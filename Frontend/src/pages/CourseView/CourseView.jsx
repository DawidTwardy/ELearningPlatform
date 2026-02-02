import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, AlertTriangle } from 'lucide-react';
import { 
    fetchCourseDetails, 
    markLessonCompleted, 
    fetchCompletedLessons, 
    fetchCompletedQuizzes, 
    downloadCertificate, 
    createReview,
    fetchUserEnrollment,
    createCourseReport
} from '../../services/api';
import { downloadCalendarEvent } from '../../utils/calendarGenerator';
import QuizView from './QuizView';
import DiscussionThread from './DiscussionThread';
import PersonalNotes from '../../components/Lesson/PersonalNotes';
import CourseRatingForm from '../Course/CourseRatingForm';
import StudyPlanner from '../../components/Course/StudyPlanner';
import CalendarConfigModal from '../../components/Course/CalendarConfigModal';
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
    const [enrollmentDate, setEnrollmentDate] = useState(null); 
    const [error, setError] = useState(null);
    const [showRatingForm, setShowRatingForm] = useState(false);
    
    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
    
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');

    const [activeTab, setActiveTab] = useState('discussion');
    
    const videoRef = useRef(null);

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
                
                const [courseData, completedIds, completedQuizzes, enrollmentData] = await Promise.all([
                    fetchCourseDetails(courseId),
                    fetchCompletedLessons(courseId).catch(() => []), 
                    fetchCompletedQuizzes(courseId).catch(() => []),
                    fetchUserEnrollment(courseId).catch(() => null)
                ]);
                
                if (!courseData) throw new Error("Brak danych");
                
                setCourse(courseData);
                setCompletedLessonIds(completedIds);
                setCompletedQuizIds(completedQuizzes);

                if (enrollmentData && enrollmentData.enrollmentDate) {
                    setEnrollmentDate(enrollmentData.enrollmentDate);
                } else {
                    setEnrollmentDate(new Date().toISOString()); 
                }
                
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

    const handleRateCourse = async (title, rating, reviewText) => {
        try {
            await createReview(parseInt(courseId), rating, reviewText);
            alert("Dziękujemy za ocenę!");
            setShowRatingForm(false);
        } catch (error) {
            console.error(error);
            alert("Nie udało się dodać opinii: " + error.message);
        }
    };

    const handleCalendarConfirm = (time, days) => {
        if (course) {
            downloadCalendarEvent(course.title, time, days);
            setIsCalendarModalOpen(false);
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

    const getFlatContentList = () => {
        if (!course) return [];
        const sections = course.sections || course.Sections || [];
        let flatList = [];
        
        sections.forEach(section => {
            const lessons = section.lessons || section.Lessons || [];
            lessons.forEach(l => flatList.push({ ...l, type: 'lesson' }));
            const quiz = section.quiz || section.Quiz;
            if (quiz) {
                flatList.push({ ...quiz, type: 'quiz' });
            }
        });
        return flatList;
    };

    const handleNextLesson = () => {
        if (!course || !currentContent) return;
        const flatList = getFlatContentList();
        
        const currentId = currentContent.id || currentContent.Id;
        const currentIndex = flatList.findIndex(item => (item.id || item.Id) === currentId && item.type === currentContent.contentType);

        if (currentIndex !== -1 && currentIndex < flatList.length - 1) {
            const nextItem = flatList[currentIndex + 1];
            if (nextItem.type === 'lesson') {
                handleLessonSelect(nextItem);
            } else if (nextItem.type === 'quiz') {
                handleQuizSelect(nextItem);
            }
        }
    };

    const handlePreviousLesson = () => {
        if (!course || !currentContent) return;
        const flatList = getFlatContentList();
        
        const currentId = currentContent.id || currentContent.Id;
        const currentIndex = flatList.findIndex(item => (item.id || item.Id) === currentId && item.type === currentContent.contentType);

        if (currentIndex > 0) {
            const prevItem = flatList[currentIndex - 1];
            if (prevItem.type === 'lesson') {
                handleLessonSelect(prevItem);
            } else if (prevItem.type === 'quiz') {
                handleQuizSelect(prevItem);
            }
        }
    };

    const handleReportSubmit = async () => {
        if (!reportReason.trim()) return;
        
        try {
            await createCourseReport(parseInt(courseId), 
                                     `Zgłoszenie błędu: ${currentContent?.title || "Nieokreślona treść"}. Opis: ${reportReason}`);

            alert("Zgłoszenie zostało wysłane do moderacji.");
            setReportReason('');
            setIsReportModalOpen(false);
        } catch (error) {
            console.error(error);
            alert("Wystąpił błąd podczas wysyłania zgłoszenia: " + (error.message || "Błąd sieci"));
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) {
                return;
            }

            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    if (videoRef.current) {
                        if (videoRef.current.paused) {
                            videoRef.current.play();
                        } else {
                            videoRef.current.pause();
                        }
                    }
                    break;
                case 'ArrowLeft':
                    if (videoRef.current) {
                        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
                    }
                    break;
                case 'ArrowRight':
                    if (videoRef.current) {
                        videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10);
                    }
                    break;
                case 'KeyN':
                    handleNextLesson();
                    break;
                case 'KeyP':
                    handlePreviousLesson();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [course, currentContent, completedLessonIds]);

    const renderResources = () => {
        const resources = currentContent?.resources || currentContent?.Resources || [];
        
        if (!resources || resources.length === 0) return null;

        return (
            <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#252525', borderRadius: '8px' }}>
                <h4 style={{ color: '#fff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    📥 Materiały do pobrania
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {resources.map((res, idx) => (
                        <a 
                            key={idx} 
                            href={`${BASE_URL}${res.fileUrl || res.FileUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                padding: '10px 15px', 
                                backgroundColor: '#333', 
                                color: '#E0E0E0', 
                                textDecoration: 'none', 
                                borderRadius: '6px',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#444'}
                            onMouseOut={e => e.currentTarget.style.background = '#333'}
                        >
                            <span style={{ flex: 1, fontWeight: '500' }}>{res.name || res.Name}</span>
                            <span style={{ fontSize: '0.8em', color: '#28A745' }}>Pobierz</span>
                        </a>
                    ))}
                </div>
            </div>
        );
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
        
        if (typeof content === 'object' && content.url) {
            content = content.url;
        } else if (typeof content === 'string' && content.startsWith('{')) {
             try {
                const parsed = JSON.parse(content);
                // NAPRAWIONA LINIA: Pobiera 'text' (dla sformatowanej treści) lub 'url' (dla plików)
                content = parsed.text || parsed.url || content; 
             } catch(e) {}
        }

        let mediaUrl = videoUrl || content;
        
        if (mediaUrl && mediaUrl.startsWith('/uploads')) {
            mediaUrl = `${BASE_URL}${mediaUrl}`;
        }

        const isVideo = mediaUrl && (mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.avi') || mediaUrl.endsWith('.mov'));
        const isPdf = mediaUrl && mediaUrl.endsWith('.pdf');

        if (isVideo) {
            return (
                <video 
                    ref={videoRef}
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

    const totalLessons = courseSections.reduce((acc, sec) => acc + (sec.lessons || sec.Lessons || []).length, 0);
    const completedLessonsCount = completedLessonIds.length;

    return (
        <div className="course-view-container">
            <div className="course-view-content">
                
                <div className="lesson-content-wrapper">
                    <div className="video-section">
                        {renderMainWindow()}
                    </div>

                    {currentContent?.contentType === 'lesson' && renderResources()}

                    {currentContent?.contentType !== 'quiz' && (
                        <div style={{ marginTop: '20px', padding: '0 20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                <div>
                                    <h2 style={{ fontSize: '24px', marginBottom: '10px', color: '#fff' }}>
                                        {currentContent?.title || currentContent?.Title}
                                    </h2>
                                    <p style={{ color: '#aaa' }}>{course.title || course.Title}</p>
                                </div>
                                <button 
                                    onClick={() => setIsReportModalOpen(true)}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid #d32f2f',
                                        color: '#d32f2f',
                                        padding: '5px 10px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        fontSize: '0.8rem',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.background = '#d32f2f';
                                        e.currentTarget.style.color = '#fff';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#d32f2f';
                                    }}
                                >
                                    <AlertTriangle size={14} />
                                    Zgłoś błąd
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {currentContent?.contentType === 'lesson' && (
                        <div style={{ marginTop: '30px', padding: '0 20px' }}>
                            <div style={{ display: 'flex', borderBottom: '1px solid #444', marginBottom: '0' }}>
                                <button 
                                    style={{
                                        background: activeTab === 'discussion' ? '#1e1e1e' : 'transparent',
                                        color: activeTab === 'discussion' ? '#fff' : '#aaa',
                                        border: 'none',
                                        padding: '10px 20px',
                                        cursor: 'pointer',
                                        borderBottom: activeTab === 'discussion' ? '2px solid #4CAF50' : 'none',
                                        fontWeight: 'bold',
                                        fontSize: '1rem'
                                    }}
                                    onClick={() => setActiveTab('discussion')}
                                >
                                    Dyskusja
                                </button>
                                <button 
                                    style={{
                                        background: activeTab === 'notes' ? '#1e1e1e' : 'transparent',
                                        color: activeTab === 'notes' ? '#fff' : '#aaa',
                                        border: 'none',
                                        padding: '10px 20px',
                                        cursor: 'pointer',
                                        borderBottom: activeTab === 'notes' ? '2px solid #4CAF50' : 'none',
                                        fontWeight: 'bold',
                                        fontSize: '1rem'
                                    }}
                                    onClick={() => setActiveTab('notes')}
                                >
                                    Moje Notatki
                                </button>
                            </div>

                            {activeTab === 'discussion' ? (
                                <DiscussionThread 
                                    courseId={courseId} 
                                    isInstructorView={false} 
                                />
                            ) : (
                                <PersonalNotes lessonId={currentContent.id || currentContent.Id} />
                            )}
                        </div>
                    )}
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
                                    className={`section-title2 ${expandedSections[secId] ? 'active' : ''}`}
                                    onClick={() => toggleSection(secId)}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                    <span>{section.title || section.Title}</span>
                                    {isSectionCompleted && (
                                        <span style={{ color: '#4CAF50', fontSize: '1.20em' }} title="Sekcja ukończona">
                                            ✅
                                        </span>
                                    )}
                                </div>

                                {expandedSections[secId] && (
                                    <div className="section-lessons2">
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
                    
                    <StudyPlanner 
                        totalLessons={totalLessons}
                        completedLessons={completedLessonsCount}
                        enrollmentDate={enrollmentDate}
                    />

                    <button 
                        className="btn-calendar" 
                        onClick={() => setIsCalendarModalOpen(true)}
                        style={{
                            width: '100%',
                            marginTop: '10px',
                            padding: '10px',
                            backgroundColor: '#374151',
                            color: '#e5e7eb',
                            border: '1px solid #4b5563',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#4b5563';
                            e.currentTarget.style.color = '#fff';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#374151';
                            e.currentTarget.style.color = '#e5e7eb';
                        }}
                    >
                        <Calendar size={18} />
                        Zaplanuj w kalendarzu
                    </button>

                    {isCompleted && (
                        <button 
                            className="rate-course-button" 
                            style={{ backgroundColor: '#4CAF50', marginTop: '10px' }}
                            onClick={handleDownloadCertificate}
                        >
                            🏆 Pobierz Certyfikat
                        </button>
                    )}

                    <button 
                        className="rate-course-button"
                        onClick={() => setShowRatingForm(true)}
                    >
                        Oceń ten kurs
                    </button>
                    <button className="back-button" onClick={handleBack}>Powrót</button>
                </div>
            </div>

            <CalendarConfigModal 
                isOpen={isCalendarModalOpen}
                onClose={() => setIsCalendarModalOpen(false)}
                onConfirm={handleCalendarConfirm}
                courseTitle={course?.title || "Kurs"}
            />

            {isReportModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0,
                    width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 2000
                }}>
                    <div style={{
                        backgroundColor: '#1f1f1f',
                        padding: '25px',
                        borderRadius: '8px',
                        width: '400px',
                        maxWidth: '90%',
                        border: '1px solid #333'
                    }}>
                        <h3 style={{ color: '#fff', marginBottom: '15px' }}>Zgłoś błąd w treści</h3>
                        <p style={{ color: '#aaa', fontSize: '0.9em', marginBottom: '10px' }}>
                            Opisz problem (np. niedziałające wideo, błąd w quizie). Zgłoszenie trafi do moderacji.
                        </p>
                        <textarea
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            style={{
                                width: '100%',
                                minHeight: '100px',
                                padding: '10px',
                                backgroundColor: '#333',
                                border: '1px solid #444',
                                borderRadius: '4px',
                                color: '#fff',
                                marginBottom: '20px',
                                resize: 'vertical'
                            }}
                            placeholder="Treść zgłoszenia..."
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button
                                onClick={() => setIsReportModalOpen(false)}
                                style={{
                                    padding: '8px 15px',
                                    background: 'transparent',
                                    border: '1px solid #666',
                                    color: '#ccc',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Anuluj
                            </button>
                            <button
                                onClick={handleReportSubmit}
                                style={{
                                    padding: '8px 15px',
                                    background: '#d32f2f',
                                    border: 'none',
                                    color: '#fff',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Wyślij
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showRatingForm && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CourseRatingForm 
                        course={{ id: courseId, title: course.title || course.Title }} 
                        onBack={() => setShowRatingForm(false)} 
                        onSubmitRating={(title, rating, reviewText) => handleRateCourse(title, rating, reviewText)}
                    />
                </div>
            )}
        </div>
    );
};

export default CourseView;