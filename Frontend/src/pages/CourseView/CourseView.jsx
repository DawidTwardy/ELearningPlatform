import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourseDetails, markLessonCompleted } from '../../services/api';
import QuizView from './QuizView';
import DiscussionThread from './DiscussionThread';
import '../../styles/pages/CourseView.css';

const CourseView = ({ course: courseProp, onBack }) => {
    const { courseId: paramId } = useParams();
    const navigate = useNavigate();
    
    const [course, setCourse] = useState(null);
    const [currentContent, setCurrentContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState({});
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
                const data = await fetchCourseDetails(courseId);
                
                if (!data) throw new Error("Brak danych");
                
                setCourse(data);
                
                const sections = data.sections || data.Sections || [];
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
            if (lessonId) await markLessonCompleted(lessonId);
        } catch (e) { console.error(e); }
    };

    const handleQuizSelect = (quiz) => {
        setCurrentContent({ ...quiz, contentType: 'quiz' });
    };

    const handleBack = () => {
        if (onBack) onBack();
        else navigate(-1);
    };

    const renderMainWindow = () => {
        if (!currentContent) return <div className="video-placeholder">Wybierz element z listy</div>;

        if (currentContent.contentType === 'quiz') {
            return (
                <div className="notes-container">
                    <QuizView quiz={currentContent} courseId={courseId} />
                </div>
            );
        }

        const videoUrl = currentContent.videoUrl || currentContent.VideoUrl;
        const content = currentContent.content || currentContent.Content;
        
        const hasVideo = videoUrl && videoUrl.length > 5;

        if (hasVideo) {
            return (
                <video 
                    key={videoUrl} 
                    className="video-frame" 
                    controls 
                    src={videoUrl}
                >
                    Twoja przeglądarka nie obsługuje wideo.
                </video>
            );
        } else {
            if (content && content.includes('.pdf')) {
                 return (
                    <div className="pdf-container">
                        <iframe src={content} title="PDF"></iframe>
                    </div>
                );
            }
            return (
                <div className="notes-container" dangerouslySetInnerHTML={{ __html: content || "<p>Brak treści.</p>" }} />
            );
        }
    };

    if (loading) return <div className="loading-spinner" style={{color:'white', padding:'50px', textAlign:'center'}}>Ładowanie...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!course) return <div className="error-message">Nie znaleziono kursu.</div>;

    const courseSections = course.sections || course.Sections || [];

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

                        return (
                            <div key={secId}>
                                <div 
                                    className={`section-title ${expandedSections[secId] ? 'active' : ''}`}
                                    onClick={() => toggleSection(secId)}
                                >
                                    {section.title || section.Title}
                                </div>

                                {expandedSections[secId] && (
                                    <div className="section-lessons">
                                        {lessons.map((lesson) => {
                                            const lId = lesson.id || lesson.Id;
                                            const isActive = currentContent?.id === lId && currentContent?.contentType === 'lesson';
                                            return (
                                                <p 
                                                    key={lId}
                                                    className={isActive ? 'active' : ''}
                                                    onClick={() => handleLessonSelect(lesson)}
                                                >
                                                    {lesson.title || lesson.Title}
                                                </p>
                                            );
                                        })}

                                        {quiz && (
                                            <p
                                                className={`quiz-item ${currentContent?.id === (quiz.id || quiz.Id) && currentContent?.contentType === 'quiz' ? 'active-quiz' : ''}`}
                                                style={{ color: '#ffeb3b', fontWeight: 'bold', cursor: 'pointer' }} 
                                                onClick={() => handleQuizSelect(quiz)}
                                            >
                                                📝 Test: {quiz.title || quiz.Title}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <button className="rate-course-button">Oceń ten kurs</button>
                    <button className="back-button" onClick={handleBack}>Powrót</button>
                </div>
            </div>
        </div>
    );
};

export default CourseView;