import React, { useState, useRef } from 'react';
import '../../styles/pages/CourseEditPage.css';
// NOWE IMPORTY DLA EDYTORA TEKSTU
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import stylów

const MOCK_SECTIONS = [
  {
    id: 1,
    title: "Sekcja 1 kursu",
    lessons: [
      { id: 'l1-1', title: "Lekcja 1 (Wideo)", type: "video", content: { url: "https://www.youtube.com/embed/sLluVHUCMww", fileName: "wprowadzenie.mp4" } },
      { id: 'l1-2', title: "Lekcja 2 (Tekst)", type: "text", content: { text: "To są <b>przykładowe</b> <i>notatki</i> do lekcji..." } },
      { id: 'l1-3', title: "Lekcja 3 (PDF)", type: "pdf", content: { url: "/src/pdf/sample.pdf", fileName: "paradygmaty.pdf" } },
    ],
    quiz: {
      questions: [
        { 
          id: 'q1', 
          text: 'Które z poniższych jest językiem programowania?', 
          type: 'single', 
          options: [
            { id: 'q1o1', text: 'HTML', isCorrect: false },
            { id: 'q1o2', text: 'Python', isCorrect: true },
            { id: 'q1o3', text: 'CSS', isCorrect: false },
          ]
        },
      ]
    }
  },
  {
    id: 2,
    title: "Sekcja 2 kursu",
    lessons: [
      { id: 'l2-1', title: "Lekcja 1 (Sekcja 2)", type: "video", content: { url: "", fileName: "" } },
    ],
    quiz: { questions: [] }
  }
];

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

// USUNIĘTO: Komponent RteToolbar

export const LessonContentInput = ({ lesson, onFileChange, onTextChange }) => {
  const contentRef = useRef(null);

  // USUNIĘTO: handleBlur dla starego edytora

  switch (lesson.type) {
    case 'video':
    case 'pdf':
      return (
        <div className="file-upload-wrapper">
          {lesson.content.fileName ? (
            <div className="file-name-display">
              Wybrany plik: <span>{lesson.content.fileName}</span>
            </div>
          ) : (
            <div className="file-name-display-empty">
              Nie wybrano pliku.
            </div>
          )}
          <button type="button" className="edit-btn-upload" onClick={onFileChange}>
            {lesson.type === 'video' ? 'Wybierz Wideo' : 'Wybierz PDF'}
          </button>
        </div>
      );
    case 'text':
      // ZMIANA: Zastąpiono stary edytor nowym ReactQuill
      return (
        <div className="text-editor-wrapper-quill">
          <ReactQuill 
            theme="snow" 
            value={lesson.content.text || ''} 
            onChange={(value) => onTextChange('text', value)} // ReactQuill zwraca pełny HTML
          />
        </div>
      );
    default:
      return null;
  }
};

export const OptionEditor = ({ option, questionType, onOptionChange, onCorrectChange }) => {
  // ... (bez zmian) ...
  return (
    <div className="option-item">
      <input 
        type={questionType === 'single' ? 'radio' : 'checkbox'}
        name={`correct-option-${option.questionId}`}
        checked={option.isCorrect}
        onChange={(e) => onCorrectChange(e.target.checked)}
        className="option-checkbox"
      />
      <input 
        type="text"
        placeholder="Treść opcji"
        value={option.text}
        onChange={(e) => onOptionChange('text', e.target.value)}
        className="edit-input-option"
      />
    </div>
  );
};

export const QuestionEditor = ({ question, onQuestionChange, onOptionChange, onAddOption, onCorrectOptionChange }) => {
  // ... (bez zmian) ...
  return (
    <div className="question-item">
      <div className="question-item-header">
        <input 
          type="text"
          placeholder="Wpisz treść pytania"
          value={question.text}
          onChange={(e) => onQuestionChange('text', e.target.value)}
          className="edit-input-question"
        />
        <select
          value={question.type}
          onChange={(e) => onQuestionChange('type', e.target.value)}
          className="edit-lesson-type"
        >
          <option value="single">Jednokrotny wybór</option>
          <option value="multiple">Wielokrotny wybór</option>
        </select>
      </div>
      
      <div className="options-list">
        {question.options.map(option => (
          <OptionEditor 
            key={option.id}
            option={{...option, questionId: question.id}}
            questionType={question.type}
            onOptionChange={(field, value) => onOptionChange(option.id, field, value)}
            onCorrectChange={(isChecked) => onCorrectOptionChange(option.id, isChecked)}
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
  // ... (cała logika QuizEditor bez zmian) ...
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
    onQuizChange({ ...quiz, questions: [...quiz.questions, newQuestion] });
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
  
  return (
    <div className="quiz-editor-wrapper">
      {quiz.questions.map(q => (
        <QuestionEditor 
          key={q.id}
          question={q}
          onQuestionChange={(field, value) => updateQuestion(q.id, field, value)}
          onOptionChange={(optionId, field, value) => updateOption(q.id, optionId, field, value)}
          onAddOption={() => addOption(q.id)}
          onCorrectOptionChange={(optionId, isChecked) => handleCorrectChange(q.id, optionId, isChecked)}
        />
      ))}
      <button type="button" className="edit-btn-add-question" onClick={addQuestion}>
        + Dodaj pytanie
      </button>
    </div>
  );
};


const CourseEditPage = ({ course, onBack }) => {
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description || "Przykładowy opis pobrany z obiektu kursu...");
  const [thumbnailUrl, setThumbnailUrl] = useState(course.imageSrc || "/src/course/placeholder_sql.png");
  const [sections, setSections] = useState(MOCK_SECTIONS);
  const [openItems, setOpenItems] = useState({});

  // ... (wszystkie handlery i funkcje bez zmian) ...
  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log("Zapisywanie danych:", { title, description, thumbnailUrl, sections });
    alert(`Zapisano zmiany dla kursu: ${title}`);
    onBack();
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
              <button type="submit" className="edit-btn-primary">
                Zapisz zmiany
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
                
                {/* ZMIANA: Zastąpiono stary edytor nowym ReactQuill */}
                <div className="text-editor-wrapper-quill">
                  <ReactQuill 
                    theme="snow" 
                    value={description} 
                    onChange={setDescription} // Bezpośrednio aktualizuje stan
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
                  <input
                    type="text"
                    className="edit-input-section"
                    value={section.title}
                    onChange={(e) => updateSectionField(section.id, 'title', e.target.value)} 
                  />
                  
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
                    Test podsumowujący ({section.quiz.questions.length} pytań)
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