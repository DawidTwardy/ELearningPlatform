import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { 
  fetchCourseDetails, 
  enrollInCourse, 
  fetchUserEnrollment, 
  resolveImageUrl,
  fetchCourseReviews,
  createCourseReport 
} from '../../services/api';
import StarRating from '../../components/Course/StarRating';
import { useAuth } from '../../context/AuthContext';
import '../../styles/pages/CourseDetailsPage.css';

const CourseDetailsPage = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [reviews, setReviews] = useState([]);
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    const loadCourseData = async () => {
      if (!courseId) return;

      try {
        const courseData = await fetchCourseDetails(courseId);
        setCourse(courseData);
        
        const reviewsData = await fetchCourseReviews(courseId);
        setReviews(reviewsData);

        try {
          const enrollmentData = await fetchUserEnrollment(courseId);
          setIsEnrolled(enrollmentData.isEnrolled);
        } catch (e) {
          setIsEnrolled(false);
        }
      } catch (err) {
        setError('Nie udało się pobrać szczegółów kursu.');
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [courseId]);

  const handleEnroll = async () => {
    try {
      await enrollInCourse(courseId);
      setIsEnrolled(true);
      navigate(`/course-view/${courseId}`);
    } catch (err) {
      if (err.message && err.message.includes('401')) {
         navigate('/login');
      } else {
         alert('Błąd podczas zapisywania na kurs. Spróbuj ponownie.');
      }
    }
  };
  
  const handleReportSubmit = async () => {
    if (!reportReason.trim() || !isAuthenticated) return;
    
    try {
        await createCourseReport(parseInt(courseId), `Zgłoszenie kursu: ${reportReason}`);
        alert("Zgłoszenie zostało wysłane do moderacji.");
        setReportReason('');
        setIsReportModalOpen(false);
    } catch (error) {
        console.error(error);
        alert("Wystąpił błąd podczas wysyłania zgłoszenia: " + (error.message || "Błąd sieci"));
    }
  };

  if (loading) return <div className="loading-spinner">Ładowanie...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!course) return null;

  const instructorName = course.instructor?.name || course.instructorName || 'Instruktor';

  return (
    <div className="page-wrapper">
      <div className="course-hero-section">
        <div className="hero-content-container">
          <div className="hero-text-column">
            
            <h1 className="course-title">{course.title}</h1>
            <p className="course-subtitle">
              {course.description ? course.description.substring(0, 150).replace(/<[^>]*>?/gm, '') + '...' : ''}
            </p>
            
            <div className="course-meta-row">
              <div className="rating-badge">
                {course.reviewsCount > 0 ? (
                  <>
                    <span className="rating-number">{course.averageRating?.toFixed(1) || '0.0'}</span>
                    <StarRating rating={course.averageRating || 0} />
                    <span className="rating-count">({course.reviewsCount} opinii)</span>
                  </>
                ) : (
                  <span className="no-ratings-text">Brak ocen</span>
                )}
              </div>
              <div className="students-count">
                {course.studentsCount || 0} uczestników
              </div>
            </div>

            <div className="creator-row">
              <img 
                  src={resolveImageUrl(course.instructor?.avatarUrl) || '/src/icon/usericon.png'} 
                  alt={instructorName} 
                  className="hero-instructor-avatar"
                  onError={(e) => {e.target.src = '/src/icon/usericon.png'}}
              />
              <span className="creator-text">
                Stworzone przez 
                <Link to={`/instructor/${course.instructorId}`}>
                    <span className="instructor-name">{instructorName}</span>
                </Link>
              </span>
            </div>
            
            <div className="update-info">
              <span className="icon">📅</span> Ostatnia aktualizacja {new Date(course.updatedAt || Date.now()).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="course-main-container">
        <div className="course-layout-grid">
          
          <div className="course-content-column">
            
            <div className="section-card course-description">
              <h3>Opis kursu</h3>
              <div className="description-text" dangerouslySetInnerHTML={{ __html: course.description }} />
            </div>

            <div className="section-card course-syllabus">
              <h3>Treść kursu</h3>
              <div className="syllabus-stats">
                <span>{course.sections?.length || 0} sekcji</span>
              </div>
              <ul className="syllabus-list">
                {course.sections && course.sections.length > 0 ? (
                  course.sections.map((section, index) => (
                    <li key={index} className="syllabus-item">
                      <div className="syllabus-header">
                        <span className="folder-icon">📂</span>
                        {section.title}
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="no-content-msg">Szczegóły programu wkrótce.</p>
                )}
              </ul>
            </div>

            <div className="section-card instructor-bio">
              <h3>Instruktor</h3>
              <div className="instructor-profile">
                <div className="instructor-avatar-wrapper">
                   <img 
                      src={resolveImageUrl(course.instructor?.avatarUrl) || '/src/icon/usericon.png'} 
                      alt={instructorName}
                      className="instructor-avatar-img"
                      onError={(e) => {e.target.src = '/src/icon/usericon.png'}}
                   />
                </div>
                <div className="instructor-details">
                   <Link to={`/instructor/${course.instructorId}`}>
                      <h4>{instructorName}</h4>
                   </Link>
                  <p>Ekspert w swojej dziedzinie</p>
                </div>
              </div>
            </div>
            
            <div className="section-card reviews-section">
                <h3>Opinie studentów ({reviews.length})</h3>
                <div className="reviews-list">
                    {reviews.length === 0 ? (
                        <p>Brak opinii dla tego kursu.</p>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="review-card">
                                <div className="review-header">
                                    <div className="reviewer-info">
                                        <img 
                                            src={resolveImageUrl(review.avatarUrl) || '/src/icon/usericon.png'} 
                                            alt={review.userName} 
                                            className="reviewer-avatar"
                                            onError={(e) => {e.target.src = '/src/icon/usericon.png'}}
                                        />
                                        <span className="reviewer-name">{review.userName || 'Anonim'}</span>
                                    </div>
                                    <span className="review-date">{new Date(review.createdDate).toLocaleDateString()}</span>
                                </div>
                                <div className="review-rating">
                                    <StarRating rating={review.rating} />
                                </div>
                                <p className="review-text">{review.comment}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            {/* NOWY PRZYCISK ZGŁOŚ KURS (Dla widoku mobilnego) */}
            {isAuthenticated && (
                <div className="section-card">
                     <button
                        onClick={() => setIsReportModalOpen(true)}
                        className="btn-primary btn-full"
                        style={{ background: '#d32f2f' }}
                    >
                        <AlertTriangle size={18} style={{ marginRight: '8px' }} />
                        Zgłoś kurs do moderacji
                    </button>
                </div>
            )}
            
          </div>

          <div className="course-sidebar-column">
            <div className="sidebar-card"> 
              <div className="preview-media">
                <img 
                  src={resolveImageUrl(course.thumbnailUrl) || '/src/course/placeholder_ai.png'} 
                  alt={course.title} 
                  className="course-thumbnail-large"
                  onError={(e) => {e.target.src = '/src/course/placeholder_ai.png'}}
                />
                <div className="play-overlay"></div>
              </div>
              
              <div className="sidebar-card-body">
                <div className="action-buttons">
                  {isEnrolled ? (
                    <button 
                      className="btn-primary btn-full"
                      onClick={() => navigate(`/course-view/${courseId}`)}
                    >
                      Przejdź do kursu
                    </button>
                  ) : (
                    <button 
                      className="btn-primary btn-full"
                      onClick={handleEnroll}
                    >
                      Zapisz się za darmo
                    </button>
                  )}
                  
                  {/* NOWY PRZYCISK ZGŁOŚ KURS (Dla widoku sidebar) */}
                  {isAuthenticated && (
                       <button 
                            onClick={() => setIsReportModalOpen(true)}
                            className="btn-primary btn-full"
                            style={{ background: '#333', color: '#ccc' }}
                        >
                            <AlertTriangle size={18} style={{ marginRight: '8px' }} />
                            Zgłoś kurs
                        </button>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
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
                <h3 style={{ color: '#fff', marginBottom: '15px' }}>Zgłoś kurs do moderacji</h3>
                <p style={{ color: '#aaa', fontSize: '0.9em', marginBottom: '10px' }}>
                    Opisz, dlaczego ten kurs powinien zostać sprawdzony przez administratora (np. nieodpowiednia treść, plagiat, błędy).
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
                        Wyślij zgłoszenie
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailsPage;