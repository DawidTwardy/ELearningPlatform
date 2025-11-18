import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../styles/pages/CourseEditPage.css';
import { 
  getEmptyContentForType, 
  LessonContentInput,
  QuizEditor,
} from './CourseEditPage.jsx';

const deepParseCourseContent = (course) => {
    if (!course || !course.sections) return course;

    const parsedSections = course.sections.map(section => {
        if (section.lessons) {
            section.lessons = section.lessons.map(lesson => {
                try {
                    if (typeof lesson.content === 'string' && lesson.content.trim().startsWith('{')) {
                        lesson.content = JSON.parse(lesson.content);
                    }
                } catch (e) {
                    console.warn("Błąd parsowania treści lekcji:", e);
                }
                return lesson;
            });
        }
        return section;
    });

    return { ...course, sections: parsedSections };
};


const CourseAddPage = ({ onBack, onCourseCreate }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [sections, setSections] = useState([]);
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!title) {
      alert("Proszę podać tytuł kursu.");
      return;
    }
    
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert("Błąd: Nie jesteś zalogowany. Zaloguj się jako instruktor, aby stworzyć kurs.");
        return; 
    }
    
    const sectionsToSave = sections.map((section, index) => {
        
        const lessonsToSave = section.lessons.map(lesson => {
            let contentStr = "";
            
            if (typeof lesson.content === 'object' && lesson.content !== null) {
                contentStr = JSON.stringify(lesson.content);
            } else {
                contentStr = lesson.content || "";
            }

            return {
                Title: lesson.title,
                Content: contentStr,
            };
        });
        
        const hasQuizQuestions = section.quiz && section.quiz.questions && section.quiz.questions.length > 0;
        
        const quizToSave = hasQuizQuestions ? {
            Title: section.quiz.title || `Test: ${section.title}` || "Test podsumowujący",
            Questions: (section.quiz.questions || []).map(question => {
                const optionsToSave = (question.options || question.answers || []).map(option => ({
                    Text: option.text, 
                    IsCorrect: option.isCorrect
                }));
                
                return {
                    Text: question.text,
                    QuestionType: question.questionType || 'single', 
                    Options: optionsToSave 
                };
            })
        } : null;


        return {
            Title: section.title, 
            Order: index + 1,
            Lessons: lessonsToSave,
            Quiz: quizToSave
        };
    });

    const newCourseData = { 
        Title: title, 
        Description: description || "", 
        ImageUrl: thumbnailUrl || "/src/course/placeholder_default.png", 
        Price: 0,
        Category: "Ogólny",
        Level: "Początkujący",
        Rating: 0, 
        Sections: sectionsToSave
    };

    const apiUrl = 'http://localhost:7115/api/Courses';

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify(newCourseData)
    })
    .then(async response => {
        const text = await response.text();
        let data = {};
        
        try {
            data = JSON.parse(text);
        } catch (e) {
            if (response.status >= 500) {
                throw new Error(`Wystąpił wewnętrzny błąd serwera (Status: ${response.status}). Sprawdź logi backendu.`);
            }
            throw new Error(`Nieoczekiwany format odpowiedzi z serwera (Status: ${response.status}).`);
        }
        
        if (response.status === 201 || response.status === 200) {
             return data;
        } 
        
        if (response.status === 403) {
            throw new Error("Brak autoryzacji. Upewnij się, że jesteś zalogowany jako instruktor lub administrator.");
        }
        
        if (response.status === 400) {
            const validationErrors = data.errors || data;
            console.error("Błąd walidacji API:", validationErrors);
            let message = "Wystąpił błąd walidacji (400 Bad Request). Sprawdź, czy wszystkie pola są poprawnie wypełnione.";
            if (validationErrors.errors && Object.keys(validationErrors.errors).length > 0) {
                message += "\nSzczegóły: " + Object.entries(validationErrors.errors).map(([key, value]) => `${key}: ${value.join(', ')}`).join('; ');
            }
            throw new Error(message);
        }
        
        throw new Error(data.title || "Wystąpił błąd podczas tworzenia kursu.");
    })
    .then(result => {
        const parsedResult = deepParseCourseContent(result); 
        alert(`Pomyślnie stworzono kurs: ${parsedResult.title} (ID: ${parsedResult.id})`);
        onCourseCreate(parsedResult);
    })
    .catch(error => {
        console.error("Błąd podczas tworzenia kursu:", error);
        alert(`Wystąpił błąd: ${error.message}`);
    });
  };

  const updateSectionField = (sectionId, field, value) => {
     setSections(prevSections =>
      prevSections.map(section => 
        section.id === sectionId ? { ...section, [field]: value } : section
      )
    );
  };

  const updateLessonField = (sectionId, lessonId, field, value) => {
    setSections(prevSections =>
      prevSections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            lessons: section.lessons.map(lesson =>
              lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
            ),
          };
        }
        return section;
      })
    );
  };

  const handleLessonTypeChange = (sectionId, lessonId, newType) => {
    setSections(prevSections =>
      prevSections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            lessons: section.lessons.map(lesson =>
              lesson.id === lessonId
                ? { ...lesson, type: newType, content: getEmptyContentForType(newType) }
                : lesson
            ),
          };
        }
        return section;
      })
    );
  };

  const handleLessonTextChange = (sectionId, lessonId, contentField, value) => {
     setSections(prevSections =>
      prevSections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            lessons: section.lessons.map(lesson =>
              lesson.id === lessonId
                ? { ...lesson, content: { ...lesson.content, [contentField]: value } }
                : lesson
            ),
          };
        }
        return section;
      })
    );
  };
  
  const handleFileSelect = (sectionId, lessonId, lessonType) => {
    const mockFileName = lessonType === 'video' ? `przykładowe_wideo_${Date.now()}.mp4` : `dokument_lekcji_${Date.now()}.pdf`;
    const mockUrl = `/uploads/mock/${mockFileName}`;

     setSections(prevSections =>
      prevSections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            lessons: section.lessons.map(lesson =>
              lesson.id === lessonId
                ? { ...lesson, content: { url: mockUrl, fileName: mockFileName } }
                : lesson
            ),
          };
        }
        return section;
      })
    );
  };

  const addSection = () => {
    const newSection = {
      id: Date.now(),
      title: `Nowa Sekcja ${sections.length + 1}`,
      lessons: [],
      quiz: { questions: [] }
    };
    setSections([...sections, newSection]);
    setOpenItems(prev => ({
      ...prev,
      [`lessons-${newSection.id}`]: true,
      [`quiz-${newSection.id}`]: true,
    }));
  };

  const deleteSection = (sectionId) => {
      if(window.confirm("Czy na pewno chcesz usunąć tę sekcję?")) {
          setSections(prevSections => prevSections.filter(s => s.id !== sectionId));
      }
  };
  
  const addLesson = (sectionId) => {
    setSections(prevSections =>
      prevSections.map(section => {
        if (section.id === sectionId) {
          const newLesson = {
            id: Date.now(),
            title: `Nowa Lekcja ${section.lessons.length + 1}`,
            type: "video",
            content: getEmptyContentForType("video")
          };
          return {
            ...section,
            lessons: [...section.lessons, newLesson]
          };
        }
        return section;
      })
    );
  };

  const deleteLesson = (sectionId, lessonId) => {
      if(window.confirm("Czy na pewno chcesz usunąć tę lekcję?")) {
        setSections(prevSections =>
            prevSections.map(section => {
              if (section.id === sectionId) {
                return {
                  ...section,
                  lessons: section.lessons.filter(l => l.id !== lessonId)
                };
              }
              return section;
            })
          );
      }
  };

  return (
    <main className="main-content">
      <div className="edit-course-container">
        <form onSubmit={handleSave}>
          <div className="edit-header">
            <h2 className="page-title">Stwórz Nowy Kurs</h2>
            <div className="edit-actions">
              <button type="button" className="edit-btn-secondary" onClick={onBack}>
                Anuluj
              </button>
              <button type="submit" className="edit-btn-primary">
                Stwórz Kurs
              </button>
            </div>
          </div>

          <div className="edit-form-group">
            <label htmlFor="courseTitle">Tytuł Kursu</label>
            <input
              type="text"
              id="courseTitle"
              className="edit-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Np. Wprowadzenie do React"
            />
          </div>

          <hr className="edit-divider" />

          <h3
            className={`collapsible-header ${!!openItems['info'] ? 'open' : ''}`}
            onClick={() => toggleItem('info')}
            style={{ marginTop: 0, marginBottom: '20px' }}
          >
            Informacje Podstawowe
          </h3>

          {!!openItems['info'] && (
            <div className="section-item" style={{ marginBottom: '20px', paddingBottom: '30px' }}>
              <div className="edit-form-group">
                <label htmlFor="courseDescription">Opis Kursu</label>
                <div className="text-editor-wrapper-quill">
                  <ReactQuill 
                    theme="snow" 
                    value={description} 
                    onChange={setDescription} 
                  />
                </div>
              </div>
              <div className="edit-form-group" style={{marginTop: '20px'}}>
                <label htmlFor="courseThumbnail">URL Miniaturki</label>
                <input
                  type="text"
                  id="courseThumbnail"
                  className="edit-input"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="Np. /src/course/placeholder_nowy.png"
                />
              </div>
            </div>
          )}

          <h3>Zawartość Kursu</h3>
          
          <div className="sections-list">
            {sections.map(section => {
              const lessonsId = `lessons-${section.id}`;
              const quizId = `quiz-${section.id}`;
              const areLessonsOpen = !!openItems[lessonsId];
              const isQuizOpen = !!openItems[quizId];
              
              return (
                <div key={section.id} className="section-item">
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <input
                            type="text"
                            className="edit-input-section"
                            value={section.title}
                            onChange={(e) => updateSectionField(section.id, 'title', e.target.value)}
                            style={{ flex: 1, margin: 0 }}
                        />
                        <button 
                            type="button" 
                            className="edit-btn-secondary" 
                            onClick={() => deleteSection(section.id)}
                            style={{ backgroundColor: '#ff4444', color: 'white', borderColor: '#ff4444' }}
                        >
                            Usuń Sekcję
                        </button>
                  </div>
                  
                  <h4 
                    className={`collapsible-header ${areLessonsOpen ? 'open' : ''}`}
                    onClick={() => toggleItem(lessonsId)}
                  >
                    Lekcje w sekcji ({section.lessons.length})
                  </h4>
                  
                  {areLessonsOpen && (
                    <div className="lessons-list">
                      {section.lessons.map(lesson => (
                        <div key={lesson.id} className="lesson-item">
                          <div className="lesson-item-header">
                            <input
                              type="text"
                              className="edit-input-lesson"
                              value={lesson.title}
                              onChange={(e) => updateLessonField(section.id, lesson.id, 'title', e.target.value)} 
                            />
                            <select
                              className="edit-lesson-type"
                              value={lesson.type}
                              onChange={(e) => handleLessonTypeChange(section.id, lesson.id, e.target.value)}
                            >
                              <option value="video">Wideo</option>
                              <option value="pdf">PDF</option>
                              <option value="text">Tekst</option>
                            </select>
                            <button 
                                type="button" 
                                className="edit-btn-secondary" 
                                onClick={() => deleteLesson(section.id, lesson.id)}
                                style={{ backgroundColor: '#ff4444', color: 'white', borderColor: '#ff4444', padding: '5px 10px', marginLeft: '10px', fontSize: '12px' }}
                            >
                                Usuń
                            </button>
                          </div>
                          <LessonContentInput 
                            lesson={lesson}
                            onTextChange={(field, value) => handleLessonTextChange(section.id, lesson.id, field, value)}
                            onFileChange={() => handleFileSelect(section.id, lesson.id, lesson.type)}
                          />
                        </div>
                      ))}
                       <button type="button" className="edit-btn-add-lesson" onClick={() => addLesson(section.id)}>
                        + Dodaj lekcję
                      </button>
                    </div>
                  )}
                  
                  <h4 
                    className={`collapsible-header ${isQuizOpen ? 'open' : ''}`}
                    onClick={() => toggleItem(quizId)}
                  >
                    Test podsumowujący ({section.quiz?.questions?.length || 0} pytań)
                  </h4>
                  
                  {isQuizOpen && (
                    <QuizEditor 
                      quiz={section.quiz}
                      onQuizChange={(newQuiz) => updateSectionField(section.id, 'quiz', newQuiz)}
                    />
                  )}
                  
                </div>
              );
            })}
          </div>
          
          <button type="button" className="edit-btn-add-section" onClick={addSection}>
            + Dodaj sekcję
          </button>
        </form>
      </div>
    </main>
  );
};

export default CourseAddPage;