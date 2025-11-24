import React, { useState, useEffect, useRef } from 'react';
import '../../styles/pages/CourseEditPage.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { fetchCourseDetails, uploadFile } from '../../services/api';

// --- Funkcje pomocnicze i komponenty (Bez zmian logicznych, ale w pełnej wersji) ---

const deepParseCourseContent = (course) => {
    if (!course || !course.sections) return course;

    const parsedSections = course.sections.map(section => {
        if (section.lessons) {
            section.lessons = section.lessons.map(lesson => {
                let parsedContent = lesson.content;
                try {
                    if (typeof lesson.content === 'string' && lesson.content.trim().startsWith('{')) {
                        parsedContent = JSON.parse(lesson.content);
                    }
                } catch (e) {
                    console.warn("Błąd parsowania treści lekcji:", e);
                }

                let inferredType = 'video';
                if (parsedContent) {
                    if (parsedContent.text !== undefined && parsedContent.text !== "") {
                        inferredType = 'text';
                    } else if (parsedContent.url !== undefined) {
                        if (parsedContent.fileName && parsedContent.fileName.toLowerCase().endsWith('.pdf')) {
                            inferredType = 'pdf';
                        } else {
                            inferredType = 'video';
                        }
                    }
                }

                return { 
                    ...lesson, 
                    content: parsedContent || {}, 
                    type: lesson.type || inferredType,
                    resources: lesson.resources || lesson.Resources || [] 
                };
            });
        }
        
        // Fix dla Quizów - upewnienie się, że typ pytania jest poprawny
        if (section.quiz && section.quiz.questions) {
             section.quiz.questions = section.quiz.questions.map(q => ({
                 ...q,
                 type: q.type || q.questionType || q.QuestionType || 'single'
             }));
        }

        return section;
    });

    return { ...course, sections: parsedSections };
};

export const getEmptyContentForType = (type) => {
  switch (type) {
    case 'video':
    case 'pdf':
      return { url: "", fileName: "" };
    case 'text':
      return { text: "" };
    default:
      return {};
  }
};

export const LessonContentInput = ({ lesson, onFileChange, onTextChange }) => {
  const content = lesson.content || {};
  const fileInputRef = useRef(null); 

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  const handleFileSelected = (e) => {
      if (e.target.files.length > 0) {
          onFileChange(e.target.files[0]);
      }
      e.target.value = null; 
  };
  
  switch (lesson.type) {
    case 'video':
    case 'pdf':
      const fileLabel = lesson.type === 'video' ? 'Wybierz plik wideo (.mp4, .mov, .avi)' : 'Wybierz plik PDF';
      return (
        <div className="file-upload-wrapper">
          {content.fileName ? (
            <div className="file-name-display">
              Wybrany plik: <span>{content.fileName}</span>
            </div>
          ) : (
            <div className="file-name-display-empty">
              Nie wybrano pliku głównego.
            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept={lesson.type === 'video' ? 'video/*' : 'application/pdf'}
            onChange={handleFileSelected} 
          />
          <button type="button" className="edit-btn-upload" onClick={triggerFileInput}>
            {fileLabel}
          </button>
        </div>
      );
    case 'text':
      return (
        <div className="text-editor-wrapper-quill">
          <ReactQuill 
            theme="snow" 
            value={content.text || ''} 
            onChange={(value) => onTextChange('text', value)}
          />
        </div>
      );
    default:
      return <div>Wybierz typ lekcji, aby edytować treść.</div>;
  }
};

export const LessonResourcesEditor = ({ resources, onAddResource, onRemoveResource }) => {
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
      if (e.target.files.length > 0) {
          onAddResource(e.target.files[0]);
      }
      e.target.value = null;
  };

  return (
    <div className="resources-editor">
      <h5>Materiały do pobrania (Załączniki):</h5>
      <ul className="resources-list">
        {(resources || []).map((res, idx) => (
          <li key={res.id || idx} className="resource-item">
            <a href={res.fileUrl || res.url} target="_blank" rel="noopener noreferrer">
               {res.name || res.fileName}
            </a>
            <button type="button" onClick={() => onRemoveResource(idx)} className="btn-remove-res">
              Usuń
            </button>
          </li>
        ))}
        {(!resources || resources.length === 0) && <li style={{color:'#666', fontSize:'0.9em', fontStyle:'italic'}}>Brak dodatkowych zasobów.</li>}
      </ul>
      <div className="add-resource-container">
         <input 
            type="file" 
            ref={fileInputRef} 
            style={{display: 'none'}} 
            onChange={handleFileChange} 
         />
         <button type="button" className="btn-add-res" onClick={() => fileInputRef.current.click()}>
            + Dodaj plik
         </button>
      </div>
    </div>
  );
};

export const OptionEditor = ({ option, questionType, onOptionChange, onCorrectChange, onDeleteOption }) => {
  return (
    <div className="option-item">
      <input 
        type={questionType === 'single' ? 'radio' : 'checkbox'}
        name={`correct-option-${option.questionId}`} 
        checked={option.isCorrect || false}
        onChange={(e) => onCorrectChange(e.target.checked)}
        className="option-checkbox"
      />
      <input 
        type="text"
        placeholder="Treść opcji"
        value={option.text || ''}
        onChange={(e) => onOptionChange('text', e.target.value)}
        className="edit-input-option"
      />
      <button 
        type="button" 
        className="edit-btn-delete-small" 
        onClick={onDeleteOption}
        title="Usuń opcję"
        style={{ marginLeft: '10px', background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
      >
        ✕
      </button>
    </div>
  );
};

export const QuestionEditor = ({ question, onQuestionChange, onOptionChange, onAddOption, onCorrectOptionChange, onDeleteQuestion, onDeleteOption }) => {
  return (
    <div className="question-item">
      <div className="question-item-header">
        <input 
          type="text"
          placeholder="Wpisz treść pytania"
          value={question.text || ''}
          onChange={(e) => onQuestionChange('text', e.target.value)}
          className="edit-input-question"
        />
        <select
          value={question.type || 'single'}
          onChange={(e) => onQuestionChange('type', e.target.value)}
          className="edit-lesson-type"
        >
          <option value="single">Jednokrotny wybór</option>
          <option value="multiple">Wielokrotny wybór</option>
        </select>
        <button 
            type="button" 
            className="edit-btn-secondary" 
            onClick={onDeleteQuestion}
            style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#ff4444', color: 'white', borderColor: '#ff4444' }}
        >
            Usuń pytanie
        </button>
      </div>
      
      <div className="options-list">
        {question.options.map(option => (
          <OptionEditor 
            key={option.id}
            option={{...option, questionId: question.id}}
            questionType={question.type} 
            onOptionChange={(field, value) => onOptionChange(option.id, field, value)}
            onCorrectChange={(isChecked) => onCorrectOptionChange(option.id, isChecked)}
            onDeleteOption={() => onDeleteOption(option.id)}
          />
        ))}
      </div>
      
      <button type="button" className="edit-btn-add-option" onClick={onAddOption}>
        + Dodaj opcję
      </button>
    </div>
  );
};

export const QuizEditor = ({ quiz, onQuizChange }) => {
  const updateQuestion = (questionId, field, value) => {
    const newQuestions = quiz.questions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    );
    onQuizChange({ ...quiz, questions: newQuestions });
  };
  
  const updateOption = (questionId, optionId, field, value) => {
     const newQuestions = quiz.questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.map(o => 
            o.id === optionId ? { ...o, [field]: value } : o
          )
        };
      }
      return q;
    });
    onQuizChange({ ...quiz, questions: newQuestions });
  };
  
  const handleCorrectChange = (questionId, optionId, isChecked) => {
    const newQuestions = quiz.questions.map(q => {
      if (q.id === questionId) {
        let newOptions;
        if (q.type === 'single') {
          newOptions = q.options.map(o => ({ ...o, isCorrect: o.id === optionId }));
        } else {
          newOptions = q.options.map(o => 
            o.id === optionId ? { ...o, isCorrect: isChecked } : o
          );
        }
        return { ...q, options: newOptions };
      }
      return q;
    });
    onQuizChange({ ...quiz, questions: newQuestions });
  };
  
  const addQuestion = () => {
    const newQuestion = {
      id: `q${Date.now()}`,
      text: "Nowe pytanie",
      type: 'single',
      options: [
        { id: `o1-${Date.now()}`, text: "Opcja A", isCorrect: true },
        { id: `o2-${Date.now()}`, text: "Opcja B", isCorrect: false },
      ]
    };
    
    onQuizChange({ 
      ...(quiz || {}), 
      questions: [...(quiz?.questions || []), newQuestion] 
    });
  };

  const deleteQuestion = (questionId) => {
      if (window.confirm("Czy na pewno chcesz usunąć to pytanie?")) {
        const newQuestions = quiz.questions.filter(q => q.id !== questionId);
        onQuizChange({ ...quiz, questions: newQuestions });
      }
  };
  
  const addOption = (questionId) => {
     const newQuestions = quiz.questions.map(q => {
      if (q.id === questionId) {
        const newOption = {
          id: `o${Date.now()}`,
          text: `Nowa opcja ${q.options.length + 1}`,
          isCorrect: false
        };
        return { ...q, options: [...q.options, newOption] };
      }
      return q;
    });
    onQuizChange({ ...quiz, questions: newQuestions });
  };

  const deleteOption = (questionId, optionId) => {
    const newQuestions = quiz.questions.map(q => {
        if (q.id === questionId) {
            return {
                ...q,
                options: q.options.filter(o => o.id !== optionId)
            };
        }
        return q;
    });
    onQuizChange({ ...quiz, questions: newQuestions });
  };
  
  return (
    <div className="quiz-editor-wrapper">
      {(quiz?.questions || []).map(q => ( 
        <QuestionEditor 
          key={q.id}
          question={q}
          onQuestionChange={(field, value) => updateQuestion(q.id, field, value)}
          onOptionChange={(optionId, field, value) => updateOption(q.id, optionId, field, value)}
          onAddOption={() => addOption(q.id)}
          onCorrectOptionChange={(optionId, isChecked) => handleCorrectChange(q.id, optionId, isChecked)}
          onDeleteQuestion={() => deleteQuestion(q.id)}
          onDeleteOption={(optionId) => deleteOption(q.id, optionId)}
        />
      ))}
      <button type="button" className="edit-btn-add-question" onClick={addQuestion}>
        + Dodaj pytanie
      </button>
    </div>
  );
};


const CourseEditPage = ({ course, onBack }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("/src/course/placeholder_sql.png");
  const [sections, setSections] = useState([]); 
  const [openItems, setOpenItems] = useState({});
  const [uploading, setUploading] = useState(false); 

  useEffect(() => {
    const loadData = async () => {
      if (course && course.id) {
        try {
          const fetchedCourse = await fetchCourseDetails(course.id);
          const data = deepParseCourseContent(fetchedCourse);
          
          setTitle(data.title || "");
          setDescription(data.description || "");
          setThumbnailUrl(data.imageUrl || data.imageSrc || "/src/course/placeholder_sql.png");
          setSections(data.sections || []);
        } catch (error) {
          console.error("Nie udało się pobrać szczegółów kursu:", error);
          const data = deepParseCourseContent(course);
          setTitle(data.title || "");
          setDescription(data.description || "");
          setThumbnailUrl(data.imageUrl || data.imageSrc || "/src/course/placeholder_sql.png");
          setSections(data.sections || []);
        }
      }
    };
    loadData();
  }, [course]);

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token'); 
    if (!token) {
        alert("Błąd: Nie jesteś zalogowany. Zaloguj się ponownie.");
        return; 
    }

    if (!course || !course.id) {
        alert("Błąd: ID kursu jest puste lub niepoprawne. Nie można zapisać.");
        return; 
    }

    // Funkcja czyszcząca ID (tymczasowe ID frontendu zamienia na 0 dla backendu)
    const prepareSectionsForBackend = (secs) => {
        return secs.map(section => {
            const safeSectionId = (typeof section.id === 'number' && section.id > 2000000000) ? 0 : section.id;

            const lessons = (section.lessons || []).map(lesson => {
                const safeLessonId = (typeof lesson.id === 'number' && lesson.id > 2000000000) ? 0 : lesson.id;
                
                let contentStr = "";
                
                if (typeof lesson.content === 'object' && lesson.content !== null) {
                    contentStr = JSON.stringify(lesson.content);
                } else if (typeof lesson.content === 'string') {
                    contentStr = lesson.content;
                }

                // WAŻNE: Mapowanie zasobów z filtrowaniem pól
                // Tworzymy NOWY obiekt zawierający TYLKO to co backend chce: Id, Name, FileUrl
                // Unikamy przesyłania pola "Lesson" lub całych obiektów Proxy
                let resources = (lesson.resources || [])
                    .filter(res => res.fileUrl || res.url) // Tylko jeśli jest URL
                    .map(res => {
                         const resId = (typeof res.id === 'number' && res.id > 2000000000) ? 0 : (res.id || 0);
                         return {
                             Id: resId,
                             Name: res.name || res.fileName || "Plik bez nazwy",
                             FileUrl: res.fileUrl || res.url
                         };
                    });

                return {
                    Id: safeLessonId,
                    Title: lesson.title,
                    Content: contentStr,
                    VideoUrl: "", 
                    SectionId: safeSectionId,
                    Resources: resources // Czysta tablica
                };
            });

            let quiz = null;
            if (section.quiz) {
                 const safeQuizId = (typeof section.quiz.id === 'number' && section.quiz.id > 2000000000) ? 0 : (section.quiz.id || 0);
                 
                 const questions = (section.quiz.questions || []).map(q => {
                     const qId = (typeof q.id === 'string' && q.id.startsWith('q')) ? 0 : q.id;
                     
                     const options = (q.options || []).map(o => {
                         const oId = (typeof o.id === 'string' && o.id.startsWith('o')) ? 0 : o.id;
                         return { 
                             Id: oId,
                             Text: o.text,
                             IsCorrect: o.isCorrect
                         };
                     });

                     return { 
                         Id: qId,
                         Text: q.text,
                         QuestionType: q.type || 'single', 
                         Options: options
                     };
                 });

                 quiz = { 
                     Id: safeQuizId,
                     Title: section.quiz.title || "Quiz", 
                     Questions: questions
                 };
            }

            return {
                Id: safeSectionId,
                Title: section.title,
                Order: section.order || 0,
                Lessons: lessons,
                Quiz: quiz
            };
        });
    };

    const sectionsToSend = prepareSectionsForBackend(sections);
    
    const courseDataToSend = { 
        id: course.id, 
        title: title,
        description: description,
        imageUrl: thumbnailUrl, 
        price: 0,
        category: "Ogólny",
        level: "Początkujący",
        Sections: sectionsToSend
    };

    console.log("Wysyłany payload (Update):", JSON.stringify(courseDataToSend, null, 2));
    
    const apiUrl = `http://localhost:7115/api/Courses/${course.id}`;

    fetch(apiUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(courseDataToSend)
    })
    .then(async response => {
        if (response.status === 204) {
             alert(`Zapisano zmiany dla kursu: ${title}`);
             onBack();
             return;
        } 
        
        const text = await response.text();
        let data = {};
        try {
             data = text ? JSON.parse(text) : {};
        } catch(e) {}

        if (response.status === 404) {
             throw new Error('Kurs nie znaleziony (404).');
        } 
        
        if (response.status === 400) {
             const validationErrors = data.errors || data;
             console.error("Szczegóły błędu 400:", validationErrors);
             
             let message = "Wystąpił błąd walidacji (400 Bad Request).";
             if (validationErrors.errors) {
                 message += "\n" + Object.entries(validationErrors.errors)
                    .map(([key, val]) => `${key}: ${val.join(', ')}`)
                    .join('\n');
             } else if (typeof validationErrors === 'string') {
                 message += "\n" + validationErrors;
             }
             throw new Error(message);
        }
        
        throw new Error(data.title || `Nie udało się zaktualizować kursu. Status: ${response.status}`);
    })
    .catch(error => {
        console.error("Błąd podczas aktualizacji kursu:", error);
        alert(`Błąd podczas aktualizacji kursu: ${error.message}`);
    });
  };

  // --- HANDLERY (Bez zmian) ---
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
                        lessons: section.lessons.map(lesson =>
                            lesson.id === lessonId
                                ? { 
                                    ...lesson, 
                                    content: { url: result.url, fileName: file.name, text: '' },
                                  }
                                : lesson
                        ),
                    };
                }
                return section;
            })
        );
        alert(`Plik ${file.name} został przesłany (Główna zawartość).`);
    } catch (error) {
        console.error("Błąd przesyłania pliku:", error);
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
      quiz: null
    };
    setSections([...sections, newSection]);
  };

  const deleteSection = (sectionId) => {
      if(window.confirm("Czy na pewno chcesz usunąć całą sekcję wraz z lekcjami i quizem?")) {
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
            <h2 className="page-title">Edycja Kursu</h2>
            <div className="edit-actions">
              <button type="button" className="edit-btn-secondary" onClick={onBack}>
                Anuluj
              </button>
              <button type="submit" className="edit-btn-primary" disabled={uploading}>
                {uploading ? "Wysyłanie plików..." : "Zapisz zmiany"}
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
                    Lekcje w sekcji ({section.lessons?.length || 0})
                  </h4>
                  
                  {areLessonsOpen && (
                    <div className="lessons-list">
                      {section.lessons?.map(lesson => (
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
                              value={lesson.type || 'video'}
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

export default CourseEditPage;