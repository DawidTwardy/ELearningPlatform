import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourseDetails, markLessonCompleted, fetchCompletedLessons, fetchCompletedQuizzes, downloadCertificate } from '../../services/api';
import QuizView from './QuizView';
import DiscussionThread from './DiscussionThread';
import '../../styles/pages/CourseView.css';

const BASE_URL = 'http://localhost:7115';

const CourseView = ({ course: courseProp, onBack }) => {
    const { courseId: paramId } = useParams();
    const navigate = useNavigate();
    
    const [course, setCourse] = useState(null);
    const [currentContent, setCurrentContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState({});
    const [completedLessonIds, setCompletedLessonIds] = useState([]); 
    const [completedQuizIds, setCompletedQuizIds] = useState([]); 
    const [error, setError] = useState(null);

    const getCourseId = () => {
        if (paramId) return paramId;
        if (courseProp && typeof courseProp === 'object') return courseProp.id;
        return courseProp;
    };

    const courseId = getCourseId();

    useEffect(() => {
        const loadCourseData = async () => {
            if (!courseId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                
                const [courseData, completedIds, completedQuizzes] = await Promise.all([
                    fetchCourseDetails(courseId),
                    fetchCompletedLessons(courseId).catch(() => []), 
                    fetchCompletedQuizzes(courseId).catch(() => [])
                ]);
                
                if (!courseData) throw new Error("Brak danych");
                
                setCourse(courseData);
                setCompletedLessonIds(completedIds);
                setCompletedQuizIds(completedQuizzes);
                
                const sections = courseData.sections || courseData.Sections || [];
                if (sections.length > 0) {
                    const firstSection = sections[0];
                    const fSecId = firstSection.id || firstSection.Id;
                    setExpandedSections({ [fSecId]: true });
                    
                    const lessons = firstSection.lessons || firstSection.Lessons || [];
                    if (lessons.length > 0) {
                        setCurrentContent({ ...lessons[0], contentType: 'lesson' });
                    }
                }
            } catch (err) {
                console.error(err);
                setError("Nie udało się pobrać kursu.");
            } finally {
                setLoading(false);
            }
        };

        loadCourseData();
    }, [courseId]);

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const handleLessonSelect = async (lesson) => {
        setCurrentContent({ ...lesson, contentType: 'lesson' });
        try {
            const lessonId = lesson.id || lesson.Id;
            if (lessonId) {
                await markLessonCompleted(lessonId);
                if (!completedLessonIds.includes(lessonId)) {
                    setCompletedLessonIds(prev => [...prev, lessonId]);
                }
            }
        } catch (e) { console.error(e); }
    };

    const handleQuizSelect = (quiz) => {
        setCurrentContent({ ...quiz, contentType: 'quiz' });
    };

    const handleQuizPassed = (quizId) => {
        if (!completedQuizIds.includes(quizId)) {
            setCompletedQuizIds(prev => [...prev, quizId]);
        }
    };

    const handleBack = () => {
        if (onBack) onBack();
        else navigate(-1);
    };
    
    const handleDownloadCertificate = async () => {
        try {
            await downloadCertificate(courseId);
        } catch (e) {
            alert(e.message);
        }
    };

    const isCourseFullyCompleted = () => {
        if (!course) return false;
        const sections = course.sections || course.Sections || [];
        for (const section of sections) {
            const lessons = section.lessons || section.Lessons || [];
            for (const lesson of lessons) {
                if (!completedLessonIds.includes(lesson.id || lesson.Id)) return false;
            }
            const quiz = section.quiz || section.Quiz;
            if (quiz && !completedQuizIds.includes(quiz.id || quiz.Id)) return false;
        }
        return true;
    };

    const renderMainWindow = () => {
        if (!currentContent) return <div className="video-placeholder">Wybierz element z listy</div>;

        if (currentContent.contentType === 'quiz') {
            return (
                <div className="notes-container">
                    <QuizView 
                        quiz={currentContent} 
                        courseId={courseId} 
                        onQuizPassed={handleQuizPassed}
                    />
                </div>
            );
        }

        let videoUrl = currentContent.videoUrl || currentContent.VideoUrl;
        let content = currentContent.content || currentContent.Content;
        
        // Handle uploaded files URL
        if (typeof content === 'object' && content.url) {
            // Sometimes content is JSON stringified in DB
            content = content.url;
        } else if (typeof content === 'string' && content.startsWith('{')) {
             try {
                const parsed = JSON.parse(content);
                content = parsed.url || content;
             } catch(e) {}
        }

        // If we have a direct URL in content (for PDF or Video from upload)
        let mediaUrl = videoUrl || content;
        
        // Fix relative paths for uploaded files
        if (mediaUrl && mediaUrl.startsWith('/uploads')) {
            mediaUrl = `${BASE_URL}${mediaUrl}`;
        }

        const isVideo = mediaUrl && (mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.avi') || mediaUrl.endsWith('.mov'));
        const isPdf = mediaUrl && mediaUrl.endsWith('.pdf');

        if (isVideo) {
            return (
                <video 
                    key={mediaUrl} 
                    className="video-frame" 
                    controls 
                    src={mediaUrl}
                >
                    Twoja przeglądarka nie obsługuje wideo.
                </video>
            );
        } else if (isPdf) {
             return (
                <div className="pdf-container" style={{height: '600px'}}>
                    <iframe src={mediaUrl} title="PDF" width="100%" height="100%"></iframe>
                </div>
            );
        } else {
            return (
                <div className="notes-container" dangerouslySetInnerHTML={{ __html: content || "<p>Brak treści.</p>" }} />
            );
        }
    };

    if (loading) return <div className="loading-spinner" style={{color:'white', padding:'50px', textAlign:'center'}}>Ładowanie...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!course) return <div className="error-message">Nie znaleziono kursu.</div>;

    const courseSections = course.sections || course.Sections || [];
    const isCompleted = isCourseFullyCompleted();

    return (
        <div className="course-view-container">
            <div className="course-view-content">
                
                <div className="lesson-content-wrapper">
                    <div className="video-section">
                        {renderMainWindow()}
                    </div>
                    {currentContent?.contentType !== 'quiz' && (
                        <div style={{ marginTop: '20px', padding: '0 20px' }}>
                            <h2 style={{ fontSize: '24px', marginBottom: '10px', color: '#fff' }}>
                                {currentContent?.title || currentContent?.Title}
                            </h2>
                            <p style={{ color: '#aaa' }}>{course.title || course.Title}</p>
                        </div>
                    )}
                    
                    <DiscussionThread 
                        courseId={courseId} 
                        isInstructorView={false} 
                    />
                </div>

                <div className="course-sections">
                    {courseSections.map((section) => {
                        const secId = section.id || section.Id;
                        const lessons = section.lessons || section.Lessons || [];
                        const quiz = section.quiz || section.Quiz;

                        const isSectionCompleted = 
                            (lessons.length === 0 || lessons.every(l => completedLessonIds.includes(l.id || l.Id))) &&
                            (!quiz || completedQuizIds.includes(quiz.id || quiz.Id));

                        return (
                            <div key={secId}>
                                <div 
                                    className={`section-title ${expandedSections[secId] ? 'active' : ''}`}
                                    onClick={() => toggleSection(secId)}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                    <span>{section.title || section.Title}</span>
                                    {isSectionCompleted && (
                                        <span style={{ color: '#4CAF50', fontSize: '1.2em' }} title="Sekcja ukończona">
                                            ✅
                                        </span>
                                    )}
                                </div>

                                {expandedSections[secId] && (
                                    <div className="section-lessons">
                                        {lessons.map((lesson) => {
                                            const lId = lesson.id || lesson.Id;
                                            const isActive = currentContent?.id === lId && currentContent?.contentType === 'lesson';
                                            const isCompleted = completedLessonIds.includes(lId);

                                            return (
                                                <p 
                                                    key={lId}
                                                    className={isActive ? 'active' : ''}
                                                    onClick={() => handleLessonSelect(lesson)}
                                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                                >
                                                    <span>{lesson.title || lesson.Title}</span>
                                                    {isCompleted && <span style={{ color: '#4CAF50', fontSize: '0.8em' }}>✔</span>}
                                                </p>
                                            );
                                        })}

                                        {quiz && (
                                            <p
                                                className={`quiz-item ${currentContent?.id === (quiz.id || quiz.Id) && currentContent?.contentType === 'quiz' ? 'active-quiz' : ''}`}
                                                style={{ color: '#ffeb3b', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} 
                                                onClick={() => handleQuizSelect(quiz)}
                                            >
                                                <span>📝 Test: {quiz.title || quiz.Title}</span>
                                                {completedQuizIds.includes(quiz.id || quiz.Id) && (
                                                    <span style={{ color: '#4CAF50', fontSize: '0.8em' }}>✔</span>
                                                )}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    
                    {isCompleted && (
                        <button 
                            className="rate-course-button" 
                            style={{ backgroundColor: '#4CAF50', marginTop: '10px' }}
                            onClick={handleDownloadCertificate}
                        >
                            🏆 Pobierz Certyfikat
                        </button>
                    )}

                    <button className="rate-course-button">Oceń ten kurs</button>
                    <button className="back-button" onClick={handleBack}>Powrót</button>
                </div>
            </div>
        </div>
    );
};

export default CourseView;