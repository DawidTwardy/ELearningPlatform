import React, { useState, useEffect } from 'react';
import '../../styles/pages/CourseView.css'; 
import QuizView from './QuizView.jsx';
import DiscussionThread from './DiscussionThread.jsx';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:7115/api';

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

const parseQuizQuestions = (quiz) => {
    if (!quiz || !quiz.QuizDataJson) {
        return [];
    }
    
    if (quiz.QuizDataJson) {
        try {
            const parsedData = JSON.parse(quiz.QuizDataJson);
            return Array.isArray(parsedData.questions) ? parsedData.questions : []; 
        } catch (e) {
            console.error("Błąd parsowania QuizDataJson:", e);
        }
    }
    
    return [];
};


const CourseView = ({ course, onBack, onStartRating, isInstructorView }) => {
  const { token, isAuthenticated } = useAuth();
  const [activeSectionId, setActiveSectionId] = useState(course.sections?.[0]?.id || null);
  const [selectedContent, setSelectedContent] = useState(null); 
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [completedLessons, setCompletedLessons] = useState({}); // Nowy stan do śledzenia ukończonych lekcji

  
  const checkLessonStatus = (lessonId) => {
    // W bardziej zaawansowanej wersji, to by robiło GET /api/Progress/lesson/{lessonId}
    // Na razie używamy lokalnego stanu
    return completedLessons[lessonId] || false;
  };


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
  
  const markLessonCompleted = async (lessonId) => {
    if (!isAuthenticated) {
        alert("Musisz być zalogowany, aby oznaczyć lekcję jako ukończoną.");
        return;
    }

    try {
        await axios.post(`${API_BASE_URL}/Progress/lesson/${lessonId}/complete`, null, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        setCompletedLessons(prev => ({ ...prev, [lessonId]: true }));
        alert("Lekcja oznaczona jako ukończona!");
        
        // Opcjonalnie: odśwież postęp na stronie MyLearning, jeśli to konieczne
        
    } catch (error) {
        console.error("Błąd oznaczania lekcji:", error.response?.data?.Message || error.message);
        alert(`Błąd: ${error.response?.data?.Message || "Wystąpił problem z serwerem."}`);
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
    const isCompleted = checkLessonStatus(lesson.id);

    return (
        <>
            {/* RENDEROWANIE WŁAŚCIWEJ TREŚCI LEKCJI */}
            {(() => {
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
            })()}

            {/* NOWY PRZYCISK POSTĘPU */}
            {!isInstructorView && isAuthenticated && (
                <button 
                    className={`mark-complete-button ${isCompleted ? 'completed' : ''}`}
                    onClick={() => markLessonCompleted(lesson.id)}
                    disabled={isCompleted}
                >
                    {isCompleted ? 'Ukończono!' : 'Oznacz lekcję jako ukończoną'}
                </button>
            )}
        </>
    );
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
                      {lesson.title} {checkLessonStatus(lesson.id) ? ' ✅' : ''}
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