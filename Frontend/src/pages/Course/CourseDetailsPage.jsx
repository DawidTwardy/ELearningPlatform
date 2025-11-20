import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Dodano useParams i useNavigate
import '../../styles/pages/CourseDetailsPage.css';
import StarRating from '../../components/Course/StarRating'; 
import { useAuth } from '../../context/AuthContext';
import { fetchCourseDetails } from '../../services/api'; // Importujemy funkcję z api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:7115/api';

const CourseDetailsPage = ({ course: propCourse, onBack, onEnroll }) => {
  const { id } = useParams(); // Pobieramy ID z URL
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  
  const [course, setCourse] = useState(propCourse || null);
  const [loading, setLoading] = useState(!propCourse);
  const [error, setError] = useState(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState('not_enrolled'); 

  // Pobieranie danych kursu jeśli nie zostały przekazane jako prop
  useEffect(() => {
    const loadCourse = async () => {
      if (!course && id) {
        try {
          setLoading(true);
          const data = await fetchCourseDetails(id);
          setCourse(data);
        } catch (err) {
          console.error("Błąd pobierania szczegółów kursu:", err);
          setError("Nie udało się pobrać szczegółów kursu.");
        } finally {
          setLoading(false);
        }
      }
    };
    loadCourse();
  }, [id, course]);

  useEffect(() => {
    if (isAuthenticated && course?.id) {
      checkEnrollmentStatus(course.id);
    } else if (!isAuthenticated) {
      setEnrollmentStatus('not_enrolled');
    }
  }, [course?.id, isAuthenticated]);

  const checkEnrollmentStatus = async (courseId) => {
    setEnrollmentStatus('loading');
    try {
      const response = await axios.get(`${API_BASE_URL}/Enrollments/check/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const isEnrolled = response.data;
      setEnrollmentStatus(isEnrolled ? 'enrolled' : 'not_enrolled');
    } catch (error) {
      console.error("Błąd sprawdzania zapisu:", error);
      setEnrollmentStatus('not_enrolled');
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      alert("Musisz być zalogowany, aby zapisać się na kurs.");
      navigate('/login'); // Przekierowanie do logowania
      return;
    }

    setEnrollmentStatus('loading');

    try {
      await axios.post(`${API_BASE_URL}/Enrollments/${course.id}`, null, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setEnrollmentStatus('success');
      alert("Pomyślnie zapisano na kurs! Możesz go znaleźć w sekcji Moja Nauka.");
      
      if (onEnroll) {
          onEnroll(course.id); 
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setEnrollmentStatus('enrolled');
        alert("Jesteś już zapisany na ten kurs.");
      } else {
        setEnrollmentStatus('error');
        console.error("Błąd zapisu:", error);
        alert("Wystąpił błąd podczas zapisu na kurs.");
      }
    }
  };

  const handleReportCourse = () => {
    alert("Kurs został zgłoszony do administratora. Dziękujemy za Twoją opinię.");
  };

  const handleBack = () => {
      if (onBack) onBack();
      else navigate(-1); // Powrót w historii przeglądarki
  };

  const renderEnrollButton = () => {
    if (!isAuthenticated) {
      return (
        <button className="details-enroll-button" onClick={() => navigate('/login')}>
          Zaloguj się, aby się zapisać
        </button>
      );
    }
    
    switch (enrollmentStatus) {
      case 'loading':
        return (
          <button className="details-enroll-button disabled" disabled>
            Sprawdzanie statusu...
          </button>
        );
      case 'enrolled':
      case 'success':
        return (
          <button className="details-enroll-button enrolled" disabled>
            Już zapisany
          </button>
        );
      case 'error':
        return (
          <button className="details-enroll-button error" onClick={handleEnroll}>
            Błąd. Spróbuj ponownie
          </button>
        );
      case 'not_enrolled':
      default:
        return (
          <button className="details-enroll-button" onClick={handleEnroll}>
            Zapisz się i rozpocznij naukę
          </button>
        );
    }
  };

  if (loading) return <div className="loading-container">Ładowanie szczegółów kursu...</div>;
  if (error) return <div className="error-container">{error}</div>;
  if (!course) return <div className="error-container">Nie znaleziono kursu.</div>;

  // Przygotowanie danych instruktora (fallback)
  const instructor = course.instructor || {
      name: "Nieznany instruktor",
      avatarSrc: "/src/icon/usericon.png",
      bio: "Brak informacji o instruktorze."
  };

  return (
    <main className="main-content">
      <div className="details-container">
        <div className="details-sidebar">
          <div className="details-image-container">
            <img 
              src={course.imageSrc || course.imageUrl || "/src/course/placeholder_ai.png"} 
              alt={course.title} 
              className="details-image"
              onError={(e) => { e.target.onerror = null; e.target.src = "/src/course/placeholder_ai.png"; }}
            />
          </div>
          <div className="details-sidebar-info">
            <h1 className="details-title-sidebar">{course.title}</h1>
            <div className="details-rating-sidebar">
              <StarRating rating={course.rating || 0} />
            </div>
            
            {renderEnrollButton()}
            
            <button className="details-report-button" onClick={handleReportCourse}>
              Zgłoś ten kurs
            </button>

            <button className="details-back-button" onClick={handleBack}>
              Powrót
            </button>
          </div>
        </div>

        <div className="details-content">
          <h1 className="details-title-main">{course.title}</h1>
          
          <section className="details-section">
            <h2 className="details-section-title">Opis Kursu</h2>
            <div 
              className="details-description"
              dangerouslySetInnerHTML={{ __html: course.description || "Brak opisu." }}
            />
          </section>

          <section className="details-section">
            <h2 className="details-section-title">Program Kursu</h2>
            <div className="details-curriculum">
              {course.sections && course.sections.length > 0 ? (
                  course.sections.map(section => (
                    <div key={section.id} className="curriculum-section">
                      <h3 className="curriculum-section-title">{section.title}</h3>
                      {section.lessons && section.lessons.length > 0 ? (
                          <ul className="curriculum-lesson-list">
                            {section.lessons.map((lesson) => (
                              <li key={lesson.id}>{lesson.title}</li>
                            ))}
                          </ul>
                      ) : (
                          <p className="no-lessons">Brak lekcji w tej sekcji.</p>
                      )}
                    </div>
                  ))
              ) : (
                  <p>Brak zdefiniowanego programu kursu.</p>
              )}
            </div>
          </section>

          <section className="details-section">
            <h2 className="details-section-title">Instruktor</h2>
            <div className="details-instructor">
              <img 
                src={instructor.avatarSrc || "/src/icon/usericon.png"} 
                alt={instructor.name} 
                className="instructor-avatar-details"
              />
              <div className="instructor-info">
                <h3 className="instructor-name-details">{instructor.name}</h3>
                <p className="instructor-bio-details">{instructor.bio}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default CourseDetailsPage;