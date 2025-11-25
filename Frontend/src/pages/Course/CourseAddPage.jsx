import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import '../../styles/pages/CourseEditPage.css';
import { 
  getEmptyContentForType, 
  LessonContentInput,
  QuizEditor,
  LessonResourcesEditor 
} from './CourseEditPage.jsx';
import { uploadFile, resolveImageUrl } from '../../services/api';

const CourseAddPage = ({ onBack }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [sections, setSections] = useState([]);
  const [openItems, setOpenItems] = useState({});
  const [uploading, setUploading] = useState(false);

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await uploadFile(file);
      setThumbnailUrl(result.url);
    } catch (error) {
      console.error(error);
      alert("Błąd przesyłania zdjęcia: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!title) {
      alert("Proszę podać tytuł kursu.");
      return;
    }
    
    if (uploading) {
        alert("Poczekaj na zakończenie wysyłania plików.");
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
            
            const resourcesToSave = (lesson.resources || [])
                .filter(res => res.fileUrl || res.url)
                .map(res => ({
                    Id: 0, 
                    Name: res.name || res.fileName || "Plik do pobrania",
                    FileUrl: res.fileUrl || res.url
                }));

            return {
                Id: 0,
                Title: lesson.title,
                Content: contentStr,
                VideoUrl: "", 
                Resources: resourcesToSave 
            };
        });
        
        const hasQuizQuestions = section.quiz && section.quiz.questions && section.quiz.questions.length > 0;
        
        const quizToSave = hasQuizQuestions ? {
            Id: 0,
            Title: section.quiz.title || `Test: ${section.title}` || "Test podsumowujący",
            Questions: (section.quiz.questions || []).map(question => {
                const optionsToSave = (question.options || question.answers || []).map(option => ({
                    Id: 0,
                    Text: option.text || "", 
                    IsCorrect: option.isCorrect || false
                }));
                
                return {
                    Id: 0,
                    Text: question.text || "Pytanie",
                    QuestionType: question.type || 'single', 
                    Options: optionsToSave 
                };
            })
        } : null;

        return {
            Id: 0,
            Title: section.title, 
            Order: index + 1,
            Lessons: lessonsToSave,
            Quiz: quizToSave
        };
    });

    const newCourseData = { 
        Id: 0,
        Title: title, 
        Description: description || "", 
        ImageUrl: thumbnailUrl || "/src/course/placeholder_default.png", 
        Price: 0, 
        Category: "Ogólny",
        Level: "Początkujący",
        Rating: 0, 
        Sections: sectionsToSave
    };

    console.log("Wysyłany payload (Create):", JSON.stringify(newCourseData, null, 2));

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
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            console.error("Błąd parsowania:", text);
        }
        
        if (response.ok) {
             return data;
        } 
        
        if (response.status === 400) {
            const validationErrors = data.errors || data;
            console.error("Błędy walidacji:", validationErrors);
            
            let message = "Wystąpił błąd walidacji danych.";
            if (validationErrors.errors) {
                message += "\n" + Object.entries(validationErrors.errors)
                    .map(([key, val]) => `${key}: ${val.join(', ')}`)
                    .join('\n');
            } else if (data.title) {
                message += "\n" + data.title;
            }
            throw new Error(message);
        }
        
        throw new Error(data.title || "Wystąpił błąd podczas tworzenia kursu.");
    })
    .then(result => {
        alert(`Pomyślnie stworzono kurs: ${result.title || title}`);
        navigate('/my-courses');
    })
    .catch(error => {
        console.error(error);
        alert(`Błąd: ${error.message}`);
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
  
  const handleFileSelect = async (sectionId, lessonId, file) => {
    if (!file) return;
    try {
        setUploading(true);
        const result = await uploadFile(file); 
        setSections(prevSections =>
            prevSections.map(section => {
                if (section.id === sectionId) {
                    return {
                        ...section,
                        lessons: section.lessons.map(lesson => {
                            if (lesson.id === lessonId) {
                                return { 
                                    ...lesson, 
                                    content: { url: result.url, fileName: file.name, text: '' } 
                                };
                            }
                            return lesson;
                        }),
                    };
                }
                return section;
            })
        );
        alert("Plik główny został przesłany.");
    } catch (error) {
        console.error(error);
        alert("Błąd przesyłania pliku: " + error.message);
    } finally {
        setUploading(false);
    }
  };

  const handleAddResource = async (sectionId, lessonId, file) => {
      if (!file) return;
      try {
          setUploading(true);
          const result = await uploadFile(file);
          const newResource = {
              name: file.name,
              fileUrl: result.url,
              id: 0
          };
          
          setSections(prev => prev.map(sec => {
              if (sec.id !== sectionId) return sec;
              return {
                  ...sec,
                  lessons: sec.lessons.map(les => {
                      if (les.id !== lessonId) return les;
                      return {
                          ...les,
                          resources: [...(les.resources || []), newResource]
                      };
                  })
              };
          }));
          alert(`Dodano zasób: ${file.name}`);
      } catch (e) {
          alert("Błąd uploadu zasobu: " + e.message);
      } finally {
          setUploading(false);
      }
  };

  const handleRemoveResource = (sectionId, lessonId, resourceIndex) => {
       setSections(prev => prev.map(sec => {
          if (sec.id !== sectionId) return sec;
          return {
              ...sec,
              lessons: sec.lessons.map(les => {
                  if (les.id !== lessonId) return les;
                  const newRes = [...(les.resources || [])];
                  newRes.splice(resourceIndex, 1);
                  return {
                      ...les,
                      resources: newRes
                  };
              })
          };
      }));
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
            content: getEmptyContentForType("video"),
            resources: [] 
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
              <button type="submit" className="edit-btn-primary" disabled={uploading}>
                {uploading ? "Wysyłanie plików..." : "Stwórz Kurs"}
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
                <label>Miniaturka Kursu</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '10px' }}>
                    {thumbnailUrl && (
                        <div style={{ 
                            width: '120px', 
                            height: '80px', 
                            backgroundColor: '#333', 
                            borderRadius: '8px', 
                            overflow: 'hidden',
                            border: '1px solid #555'
                        }}>
                            <img 
                                src={resolveImageUrl(thumbnailUrl)} 
                                alt="Miniaturka" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {e.target.src = '/src/course/placeholder_default.png'}}
                            />
                        </div>
                    )}
                    <label className="edit-btn-upload">
                        Wybierz obraz
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailChange}
                            style={{ display: 'none' }}
                        />
                    </label>
                    <span style={{color: '#aaa', fontSize: '0.9rem'}}>
                        {thumbnailUrl ? 'Obraz wybrany' : 'Brak wybranego obrazu'}
                    </span>
                </div>
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
                            onFileChange={(file) => handleFileSelect(section.id, lesson.id, file)}
                          />

                          <LessonResourcesEditor 
                              resources={lesson.resources}
                              onAddResource={(file) => handleAddResource(section.id, lesson.id, file)}
                              onRemoveResource={(resIndex) => handleRemoveResource(section.id, lesson.id, resIndex)}
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