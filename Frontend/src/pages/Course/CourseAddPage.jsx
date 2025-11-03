import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../styles/pages/CourseEditPage.css';
import { 
  getEmptyContentForType, 
  LessonContentInput,
  QuizEditor,
} from './CourseEditPage.jsx';

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
    
    const newCourseData = { 
        title: title, 
        description: description || "", 
        imageSrc: thumbnailUrl || "/src/course/placeholder_default.png", 
        instructor: "Instruktor Mock", 
        rating: 5.0, 
        sections: sections
    };

    const apiUrl = 'https://localhost:7115/api/Courses';

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCourseData)
    })
    .then(response => {
        return response.json().then(data => ({ status: response.status, body: data }));
    })
    .then(result => {
        if (result.status === 201 || result.status === 200) {
             alert(`Pomyślnie stworzono kurs: ${result.body.title} (ID: ${result.body.id})`);
             onCourseCreate(result.body);
        } else {
             throw new Error(result.body.title || "Wystąpił błąd podczas tworzenia kursu.");
        }
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

export default CourseAddPage;