import React, { useState, useEffect } from 'react';
import '../../styles/pages/CourseDetailsPage.css';
import StarRating from '../../components/Course/StarRating'; 
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:7115/api';

const mockInstructor = {
  name: "Michał Nowak",
  avatarSrc: "/src/icon/usericon.png",
  bio: "Ekspert w dziedzinie baz danych z 10-letnim doświadczeniem. Pasjonat czystego kodu i efektywnych zapytań."
};

const CourseDetailsPage = ({ course, onBack, onEnroll }) => {
  const { isAuthenticated, token } = useAuth();
  const [enrollmentStatus, setEnrollmentStatus] = useState('not_enrolled'); 

  useEffect(() => {
    if (isAuthenticated && course.id) {
      checkEnrollmentStatus(course.id);
    } else if (!isAuthenticated) {
      setEnrollmentStatus('not_enrolled');
    }
  }, [course.id, isAuthenticated]);

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

  const mockCurriculum = [
    { id: 1, title: "Wprowadzenie do SQL", lessons: ["Co to jest SQL?", "Instalacja środowiska"] },
    { id: 2, title: "Podstawowe Zapytania", lessons: ["SELECT i WHERE", "JOIN", "GROUP BY"] },
    { id: 3, title: "Funkcje Zaawansowane", lessons: ["Funkcje okna", "Procedury składowane"] }
  ];

  const handleReportCourse = () => {
    alert("Kurs został zgłoszony do administratora. Dziękujemy za Twoją opinię.");
  };

  const renderEnrollButton = () => {
    if (!isAuthenticated) {
      return (
        <button className="details-enroll-button disabled" disabled>
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

  return (
    <main className="main-content">
      <div className="details-container">
        <div className="details-sidebar">
          <div className="details-image-container">
            <img 
              src={course.imageSrc || "/src/course/placeholder_ai.png"} 
              alt={course.title} 
              className="details-image"
            />
          </div>
          <div className="details-sidebar-info">
            <h1 className="details-title-sidebar">{course.title}</h1>
            <div className="details-rating-sidebar">
              <StarRating rating={course.rating} />
            </div>
            
            {renderEnrollButton()}
            
            <button className="details-report-button" onClick={handleReportCourse}>
              Zgłoś ten kurs
            </button>

            <button className="details-back-button" onClick={onBack}>
              Powrót do listy
            </button>
          </div>
        </div>

        <div className="details-content">
          <h1 className="details-title-main">{course.title}</h1>
          
          <section className="details-section">
            <h2 className="details-section-title">Opis Kursu</h2>
            <div 
              className="details-description"
              dangerouslySetInnerHTML={{ __html: course.description || "Ten kurs to kompleksowe wprowadzenie do... [To jest przykładowy, domyślny opis...]" }}
            />
          </section>

          <section className="details-section">
            <h2 className="details-section-title">Program Kursu</h2>
            <div className="details-curriculum">
              {mockCurriculum.map(section => (
                <div key={section.id} className="curriculum-section">
                  <h3 className="curriculum-section-title">{section.title}</h3>
                  <ul className="curriculum-lesson-list">
                    {section.lessons.map((lesson, index) => (
                      <li key={index}>{lesson}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="details-section">
            <h2 className="details-section-title">Instruktor</h2>
            <div className="details-instructor">
              <img 
                src={mockInstructor.avatarSrc} 
                alt={mockInstructor.name} 
                className="instructor-avatar-details"
              />
              <div className="instructor-info">
                <h3 className="instructor-name-details">{mockInstructor.name}</h3>
                <p className="instructor-bio-details">{mockInstructor.bio}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default CourseDetailsPage;