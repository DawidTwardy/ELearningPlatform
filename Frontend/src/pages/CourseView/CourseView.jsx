import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourseDetails, markLessonCompleted, fetchUserEnrollment, fetchCourseProgress } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Clock, BookOpen, Layers, CheckCircle } from 'lucide-react';
import '../../styles/pages/CourseView.css';
import QuizView from './QuizView';

const CourseView = ({ course: courseIdProp }) => {
    const { id: idFromUrl } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useContext(AuthContext);
    
    const id = idFromUrl || courseIdProp;

    const [course, setCourse] = useState(null);
    const [progress, setProgress] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isEnrolled = progress !== null;
    const totalLessons = course?.sections?.flatMap(s => s.lessons).length || 0;
    const completedLessons = progress?.completedLessonIds?.length || 0;
    const courseCompletionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const isCourseCompleted = courseCompletionPercentage === 100;

    const loadCourse = useCallback(async () => {
        setError(null);
        
        if (!id) {
            setLoading(false);
            setError("Brak identyfikatora kursu w adresie URL.");
            return;
        }

        try {
            setLoading(true);
            const courseData = await fetchCourseDetails(id);
            setCourse(courseData);

            if (isAuthenticated) {
                const progressData = await fetchCourseProgress(id);
                setProgress(progressData); 
            } else {
                setProgress(null);
            }

        } catch (err) {
            console.error("Błąd ładowania kursu:", err);
            setProgress(null); 
            setError("Nie udało się załadować kursu lub wystąpił błąd komunikacji. Spróbuj odświeżyć stronę.");
        } finally {
            setLoading(false);
        }
    }, [id, isAuthenticated]);

    useEffect(() => {
        loadCourse();
    }, [loadCourse]);

    useEffect(() => {
        if (course && progress && !selectedLesson && !selectedQuiz) {
            const firstUncompletedLesson = course.sections
                .flatMap(s => s.lessons || [])
                .find(lesson => !progress.completedLessonIds.includes(lesson.id));

            if (firstUncompletedLesson) {
                setSelectedLesson(firstUncompletedLesson);
            } else if (course.sections && course.sections.length > 0) {
                const firstSection = course.sections[0];
                if (firstSection.lessons && firstSection.lessons.length > 0) {
                    setSelectedLesson(firstSection.lessons[0]);
                } else if (firstSection.quiz) {
                    setSelectedQuiz(firstSection.quiz);
                }
            }
        }
    }, [course, progress, selectedLesson, selectedQuiz]);

    const handleLessonClick = (lesson) => {
        setSelectedQuiz(null);
        setSelectedLesson(lesson);
    };

    const handleQuizClick = (quiz) => {
        setSelectedLesson(null);
        setSelectedQuiz(quiz);
    };

    const handleCompleteLesson = async (lessonId) => {
        if (!isAuthenticated) return;
        try {
            await markLessonCompleted(lessonId);
            setProgress(prev => ({
                ...prev,
                completedLessonIds: [...prev.completedLessonIds, lessonId]
            }));
        } catch (error) {
            console.error("Błąd oznaczania lekcji jako ukończonej:", error);
            alert("Nie udało się oznaczyć lekcji jako ukończonej."); 
        }
    };

    const handleEnroll = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        
        try {
            await fetchUserEnrollment(id); 
            alert("Pomyślnie zapisano na kurs!");
            await loadCourse(); 
        } catch (error) {
            console.error("Błąd zapisania na kurs:", error);
            alert(`Nie udało się zapisać na kurs. Spróbuj ponownie. Szczegóły: ${error.message}`); 
        }
    };

    if (loading) return <div className="loading-container">Ładowanie kursu...</div>;
    
    if (error) return <div className="error-message">{error}</div>; 
    if (!course) return <div className="error-message">Kurs nie znaleziony.</div>;

    const currentContent = selectedLesson || selectedQuiz;

    const renderContent = () => {
        if (!currentContent) {
            return <div className="course-view-placeholder">Wybierz lekcję lub test z panelu bocznego.</div>;
        }

        if (selectedQuiz) {
            return <QuizView quiz={selectedQuiz} courseId={course.id} />;
        }

        if (selectedLesson) {
            const isCompleted = progress?.completedLessonIds?.includes(selectedLesson.id);
            const isVideo = selectedLesson.type === 'video' && selectedLesson.content.startsWith('http');

            return (
                <div className="lesson-content-container">
                    <div className="lesson-header">
                        <h2>{selectedLesson.title}</h2>
                        {!isCompleted ? (
                            <button onClick={() => handleCompleteLesson(selectedLesson.id)} className="complete-button">
                                Oznacz jako ukończone <CheckCircle size={20} />
                            </button>
                        ) : (
                            <span className="completed-tag"><CheckCircle size={16} /> Ukończono</span>
                        )}
                    </div>

                    <div className="lesson-body">
                        {isVideo ? (
                            <div className="video-player">
                                <iframe
                                    src={selectedLesson.content}
                                    title={selectedLesson.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        ) : (
                            <div className="text-content" dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
                        )}
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="course-view-page">
            <div className="course-view-header">
                <h1>{course.title}</h1>
                <div className="course-progress-bar">
                    <p>Postęp: {courseCompletionPercentage}%</p>
                    <div className="progress-bar-inner">
                        <div style={{ width: `${courseCompletionPercentage}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="course-view-content">
                <div className="course-sidebar">
                    <h2>Spis Treści ({course.sections.length} sekcji)</h2>
                    <div className="section-list">
                        {course.sections.map((section, index) => (
                            <div key={section.id} className="course-section">
                                <h3 className="section-title">
                                    <Layers size={18} /> Sekcja {index + 1}: {section.title}
                                </h3>
                                <ul className="section-content-list">
                                    {(section.lessons || []).map(lesson => {
                                        const isCompleted = progress?.completedLessonIds?.includes(lesson.id);
                                        return (
                                            <li
                                                key={lesson.id}
                                                className={`content-item lesson-item ${isCompleted ? 'completed' : ''} ${selectedLesson?.id === lesson.id ? 'active' : ''}`}
                                                onClick={() => handleLessonClick(lesson)}
                                            >
                                                <BookOpen size={16} />
                                                <span>{lesson.title}</span>
                                                {isCompleted && <CheckCircle size={16} className="completion-icon" />}
                                            </li>
                                        );
                                    })}
                                    {section.quiz && (
                                        <li
                                            key={section.quiz.id}
                                            className={`content-item quiz-item ${selectedQuiz?.id === section.quiz.id ? 'active' : ''}`}
                                            onClick={() => handleQuizClick(section.quiz)}
                                        >
                                            <Clock size={16} />
                                            <span>{section.quiz.title}</span>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="course-main-content">
                    {!isEnrolled && (
                        <div className="enrollment-overlay">
                            <p>Musisz zapisać się na kurs, aby zobaczyć jego zawartość.</p>
                            <button onClick={handleEnroll} className="enroll-button">Zapisz się na kurs</button>
                        </div>
                    )}
                    {isEnrolled && renderContent()}
                </div>
            </div>
            {isCourseCompleted && (
                <button className="certificate-button" onClick={() => navigate(`/course/${course.id}/certificate`)}>
                    Pobierz Certyfikat
                </button>
            )}
        </div>
    );
};

export default CourseView;