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

    const handleResourceDownload = async (e, fileUrl, fileName) => {
        e.preventDefault();
        try {
            const response = await fetch(fileUrl);
            if (!response.ok) throw new Error("Błąd sieci");
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = fileName; 
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error("Błąd pobierania:", err);
            window.open(fileUrl, '_blank');
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
            if (quiz) {
                const quizQuestions = quiz.questions || quiz.Questions || [];
                if (quizQuestions.length > 0 && !completedQuizIds.includes(quiz.id || quiz.Id)) {
                    return false;
                }
            }
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
                const quizQuestions = quiz.questions || quiz.Questions || [];
                if (quizQuestions.length > 0) {
                    flatList.push({ ...quiz, type: 'quiz' });
                }
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
            <div className="resources-container">
                <h4 className="resources-header">
                    📥 Materiały do pobrania
                </h4>
                <div className="resources-list">
                    {resources.map((res, idx) => {
                        const fileUrl = `${BASE_URL}${res.fileUrl || res.FileUrl}`;
                        const fileName = res.name || res.Name || 'Plik';
                        
                        return (
                            <a 
                                key={idx} 
                                href={fileUrl}
                                onClick={(e) => handleResourceDownload(e, fileUrl, fileName)}
                                className="resource-link"
                            >
                                <span className="resource-name">{fileName}</span>
                                <span className="resource-download-label">Pobierz</span>
                            </a>
                        );
                    })}
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
                <div className="pdf-container">
                    <iframe src={mediaUrl} title="PDF"></iframe>
                </div>
            );
        } else {
            return (
                <div className="notes-container" dangerouslySetInnerHTML={{ __html: content || "<p>Brak treści.</p>" }} />
            );
        }
    };

    if (loading) return <div className="loading-spinner">Ładowanie...</div>;
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
                        <div className="lesson-header-container">
                            <div className="lesson-header-flex">
                                <div>
                                    <h2 className="lesson-title">
                                        {currentContent?.title || currentContent?.Title}
                                    </h2>
                                    <p className="course-subtitle">{course.title || course.Title}</p>
                                </div>
                                <button 
                                    onClick={() => setIsReportModalOpen(true)}
                                    className="report-button"
                                >
                                    <AlertTriangle size={14} />
                                    Zgłoś błąd
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {currentContent?.contentType === 'lesson' && (
                        <div className="tabs-section">
                            <div className="tabs-wrapper">
                                <button 
                                    className={`tab-button ${activeTab === 'discussion' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('discussion')}
                                >
                                    Dyskusja
                                </button>
                                <button 
                                    className={`tab-button ${activeTab === 'notes' ? 'active' : ''}`}
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
                        
                        const quizHasQuestions = quiz && (quiz.questions || quiz.Questions || []).length > 0;

                        const isSectionCompleted = 
                            (lessons.length === 0 || lessons.every(l => completedLessonIds.includes(l.id || l.Id))) &&
                            (!quizHasQuestions || completedQuizIds.includes(quiz.id || quiz.Id));

                        return (
                            <div key={secId}>
                                <div 
                                    className={`section-title2 ${expandedSections[secId] ? 'active' : ''}`}
                                    onClick={() => toggleSection(secId)}
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
                                                >
                                                    <span>{lesson.title || lesson.Title}</span>
                                                    {isCompleted && <span style={{ color: '#4CAF50', fontSize: '0.8em' }}>✔</span>}
                                                </p>
                                            );
                                        })}

                                        {quizHasQuestions && (
                                            <p
                                                className={`quiz-item-row ${currentContent?.id === (quiz.id || quiz.Id) && currentContent?.contentType === 'quiz' ? 'active-quiz' : ''}`}
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
                    >
                        <Calendar size={18} />
                        Zaplanuj w kalendarzu
                    </button>

                    {isCompleted && (
                        <button 
                            className="rate-course-button certificate-button" 
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
                <div className="report-modal-overlay">
                    <div className="report-modal-content">
                        <h3 className="report-modal-title">Zgłoś błąd w treści</h3>
                        <p className="report-modal-desc">
                            Opisz problem (np. niedziałające wideo, błąd w quizie). Zgłoszenie trafi do moderacji.
                        </p>
                        <textarea
                            className="report-modal-textarea"
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            placeholder="Treść zgłoszenia..."
                        />
                        <div className="report-modal-actions">
                            <button
                                className="report-btn-cancel"
                                onClick={() => setIsReportModalOpen(false)}
                            >
                                Anuluj
                            </button>
                            <button
                                className="report-btn-send"
                                onClick={handleReportSubmit}
                            >
                                Wyślij
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showRatingForm && (
                <div className="rating-overlay">
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