import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import StarRating from '../../components/Course/StarRating';
import FavoriteHeart from '../../components/Course/FavoriteHeart';
import { fetchCourseDetails } from '../../services/api';
import '../../styles/pages/CourseDetailsPage.css';

const CourseDetailsPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    const getCourseDetails = async () => {
      try {
        const data = await fetchCourseDetails(id);
        setCourse(data);
      } catch (err) {
        console.error(err);
        setError('Nie udało się pobrać szczegółów kursu');
      } finally {
        setLoading(false);
      }
    };

    getCourseDetails();
  }, [id]);

  const handleStartCourse = () => {
    console.log("Rozpocznij naukę kliknięto dla:", id);
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  if (loading) return <div className="loading-spinner">Ładowanie...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!course) return <div className="not-found">Nie znaleziono kursu</div>;

  const totalLessonsCount = course.sections?.reduce((acc, section) => acc + (section.lessons?.length || 0), 0) || 0;

  return (
    <div className="page-wrapper">
      <main className="course-details-main">
        <div className="course-content-wrapper">
          
          <div className="course-header-dark">
            <h1 className="course-title">{course.title}</h1>
            <p className="course-subtitle">{course.description}</p>
            
            <div className="course-meta">
              <div className="rating-wrapper">
                <span className="rating-number">{course.rating || 0}</span>
                <StarRating rating={course.rating || 0} />
              </div>
              <div className="instructor-info">
                Utworzono przez <strong>{course.instructor?.name || 'Nieznany Instruktor'}</strong>
              </div>
              <div className="last-updated">
                Kategoria: {course.category} • Poziom: {course.level}
              </div>
            </div>
          </div>

          <div className="course-layout-grid">
            <div className="course-main-column">
              
              <div className="course-image-mobile">
                 <img 
                    src={course.imageUrl || '/src/course/placeholder_dotnet.png'} 
                    alt={course.title} 
                    onError={(e) => { e.target.onerror = null; e.target.src = '/src/course/placeholder_dotnet.png'; }}
                  />
              </div>

              <div className="section-card">
                <h3>Opis kursu</h3>
                <div className="course-description-text">
                  {course.description}
                </div>
              </div>

              <div className="section-card">
                <h3>Program kursu</h3>
                <div className="course-curriculum-summary">
                  <span>{course.sections?.length || 0} sekcji</span>
                  <span className="dot-separator">•</span>
                  <span>{totalLessonsCount} lekcji</span>
                </div>

                <div className="curriculum-list">
                  {course.sections && course.sections.length > 0 ? (
                    course.sections.map((section) => (
                      <div key={section.id} className="curriculum-section">
                        <div 
                          className="section-header" 
                          onClick={() => toggleSection(section.id)}
                        >
                          <h5 className="section-title2">
                            {section.title}
                          </h5>
                          <span className={`arrow-icon ${expandedSections[section.id] ? 'rotated' : ''}`}>
                            ▼
                          </span>
                        </div>
                        
                        {expandedSections[section.id] && (
                          <div className="section-content">
                            {section.lessons && section.lessons.length > 0 ? (
                              <ul className="lessons-list">
                                {section.lessons.map((lesson) => (
                                  <li key={lesson.id} className="lesson-item">
                                    <span className="icon-play">▶</span>
                                    <span className="lesson-title">{lesson.title}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="no-lessons">Brak lekcji w tej sekcji</div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>Brak dostępnych sekcji w tym kursie.</p>
                  )}
                </div>
              </div>
              
              <div className="section-card instructor-section">
                <h3>Instruktor</h3>
                <div className="instructor-profile">
                  <div className="instructor-avatar">
                     {course.instructor?.name ? course.instructor.name[0].toUpperCase() : '?'}
                  </div>
                  <div className="instructor-details">
                    <h4>{course.instructor?.name || 'Instruktor'}</h4>
                    <p className="instructor-bio">{course.instructor?.bio || 'Brak biografii instruktora.'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="course-sidebar-column">
              <div className="sidebar-card floating-card">
                <div className="preview-image-container">
                  <img 
                    src={course.imageUrl || '/src/course/placeholder_dotnet.png'} 
                    alt={course.title} 
                    className="course-preview-image" 
                    onError={(e) => { e.target.onerror = null; e.target.src = '/src/course/placeholder_dotnet.png'; }}
                  />
                </div>
                <div className="sidebar-content">
                  <div className="price-container">
                    <span className="price-tag">
                      {course.price && course.price > 0 ? `${course.price} PLN` : 'Darmowy'}
                    </span>
                  </div>
                  
                  <button className="btn-primary full-width" onClick={handleStartCourse}>
                    Rozpocznij naukę
                  </button>
                  
                  <div className="course-includes">
                    <h4>Ten kurs zawiera:</h4>
                    <ul>
                      <li>
                        <span className="icon">📄</span>
                        {totalLessonsCount} lekcji
                      </li>
                      <li>
                        <span className="icon">∞</span>
                        Dożywotni dostęp
                      </li>
                      <li>
                        <span className="icon">📱</span>
                        Dostęp na urządzeniach mobilnych
                      </li>
                      <li>
                        <span className="icon">🏆</span>
                        Certyfikat ukończenia
                      </li>
                    </ul>
                  </div>
                  
                  <div className="sidebar-actions">
                     <button className="btn-text">Udostępnij</button>
                     <div className="favorite-wrapper">
                        <FavoriteHeart courseId={course.id} isFavorite={false} />
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseDetailsPage;