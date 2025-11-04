import React, { useState, useEffect } from 'react';
import '../../styles/pages/CourseView.css'; 
import QuizView from './QuizView.jsx';
import DiscussionThread from './DiscussionThread.jsx';

const parseContent = (content) => {
    if (typeof content === 'string' && content.trim().startsWith('{')) {
        try {
            return JSON.parse(content);
        } catch (e) {
            console.error("Błąd parsowania treści JSON:", e);
            return { text: content }; 
        }
    }
    return content;
};

// Funkcja pomocnicza do parsowania pytań quizu z pola QuizDataJson
const parseQuizQuestions = (quiz) => {
    if (!quiz || !quiz.QuizDataJson) {
        return [];
    }
    
    // Sprawdź, czy QuizDataJson istnieje i zawiera dane
    if (quiz.QuizDataJson) {
        try {
            const parsedData = JSON.parse(quiz.QuizDataJson);
            // Oczekujemy struktury { questions: [...] }
            return Array.isArray(parsedData.questions) ? parsedData.questions : []; 
        } catch (e) {
            console.error("Błąd parsowania QuizDataJson:", e);
        }
    }
    
    return [];
};


const CourseView = ({ course, onBack, onStartRating, isInstructorView }) => {
  const [activeSectionId, setActiveSectionId] = useState(course.sections?.[0]?.id || null);
  const [selectedContent, setSelectedContent] = useState(null); 
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);

  useEffect(() => {
    if (course.sections && course.sections.length > 0) {
      const firstSection = course.sections[0];
      if (firstSection.lessons && firstSection.lessons.length > 0) {
        setSelectedContent({ type: 'lesson', data: firstSection.lessons[0] });
      } else if (firstSection.quiz) {
        const questions = parseQuizQuestions(firstSection.quiz);
        setSelectedContent({ type: 'quiz', data: { ...firstSection.quiz, questions: questions } });
      }
      setActiveSectionId(firstSection.id);
    }
  }, [course]);

  const toggleSection = (sectionId) => {
    setActiveSectionId(activeSectionId === sectionId ? null : sectionId);
  };

  const selectLesson = (lesson) => {
    setIsTakingQuiz(false);
    setSelectedContent({ type: 'lesson', data: lesson });
  };

  const selectQuiz = (quiz) => {
    // Parsowanie pytań quizu przed ustawieniem stanu
    const questions = parseQuizQuestions(quiz);
    setSelectedContent({ type: 'quiz', data: { ...quiz, questions: questions } });
    setIsTakingQuiz(true);
  };

  const handleQuizComplete = (score, total) => {
    alert(`Ukończyłeś quiz! Twój wynik: ${score} / ${total}`);
    setIsTakingQuiz(false);
    if (course.sections && course.sections.length > 0 && course.sections[0].lessons) {
      setSelectedContent({ type: 'lesson', data: course.sections[0].lessons[0] });
    }
  };

  const renderLessonContent = () => {
    if (isTakingQuiz && selectedContent?.type === 'quiz') {
      return (
        <QuizView quizData={selectedContent.data} onQuizComplete={handleQuizComplete} />
      );
    }
    
    if (!selectedContent || selectedContent.type !== 'lesson') {
      return (
        <div className="video-placeholder">
          Wybierz lekcję lub test z listy sekcji.
        </div>
      );
    }

    const lesson = selectedContent.data;
    const content = parseContent(lesson.content);

    switch (lesson.type) {
      case 'video':
        return (
          <div className="video-frame">
            <iframe
              width="100%"
              height="100%"
              src={content.url}
              title={lesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        );

      case 'text':
        return (
          <div className="notes-container">
            <h3>{lesson.title}</h3>
            <div dangerouslySetInnerHTML={{ __html: content.text }} />
          </div>
        );

      case 'pdf':
        return (
          <div className="pdf-container">
            <iframe
              src={content.url}
              title={lesson.title}
              width="100%"
              height="100%"
              frameBorder="0"
            ></iframe>
          </div>
        );

      default:
        return (
          <div className="video-placeholder">
            Nieznany typ treści: {lesson.type}.
          </div>
        );
    }
  };

  return (
    <div className="course-view-container">
      <div className="course-view-content">
        
        <div className="lesson-content-wrapper">
          <div className="video-section">
            {renderLessonContent()}
          </div>
          <DiscussionThread isInstructorView={isInstructorView} />
        </div>

        <div className="course-sections">
          {course.sections && course.sections.map((section) => (
            <React.Fragment key={section.id}>
              <div
                className={`section-title ${activeSectionId === section.id ? 'active' : ''}`}
                onClick={() => toggleSection(section.id)}
              >
                {section.title}
              </div>

              {activeSectionId === section.id && (
                <div className="section-lessons">
                  {section.lessons && section.lessons.map((lesson) => (
                    <p
                      key={lesson.id}
                      onClick={() => selectLesson(lesson)}
                      className={
                          selectedContent?.type === 'lesson' && selectedContent.data.id === lesson.id
                            ? 'active' : ''
                      }
                    >
                      {lesson.title}
                    </p>
                  ))}
                  
                  {section.quiz && (
                    <p 
                      onClick={() => selectQuiz(section.quiz)}
                      className={
                        selectedContent?.type === 'quiz' && selectedContent.data.id === section.quiz.id && isTakingQuiz
                          ? 'active-quiz' : ''
                      }
                    >
                      Test z Sekcji
                    </p>
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
          

          {!isInstructorView && (
            <button className="rate-course-button" onClick={() => onStartRating(course)}>
              Oceń ten kurs
            </button>
          )}
          
          <button className="back-button" onClick={onBack}>
            Powrót
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseView;