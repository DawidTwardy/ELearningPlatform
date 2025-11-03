import React from 'react';
import '../../styles/pages/CourseDetailsPage.css'; // ZMIENIONA ŚCIEŻKA
import StarRating from '../../components/Course/StarRating'; // ZMIENIONA ŚCIEŻKA

const mockInstructor = {
  name: "Michał Nowak",
  avatarSrc: "/src/icon/usericon.png",
  bio: "Ekspert w dziedzinie baz danych z 10-letnim doświadczeniem. Pasjonat czystego kodu i efektywnych zapytań."
};

const CourseDetailsPage = ({ course, onBack, onEnroll }) => {
  
  const mockCurriculum = [
    { id: 1, title: "Wprowadzenie do SQL", lessons: ["Co to jest SQL?", "Instalacja środowiska"] },
    { id: 2, title: "Podstawowe Zapytania", lessons: ["SELECT i WHERE", "JOIN", "GROUP BY"] },
    { id: 3, title: "Funkcje Zaawansowane", lessons: ["Funkcje okna", "Procedury składowane"] }
  ];

  const handleReportCourse = () => {
    alert("Kurs został zgłoszony do administratora. Dziękujemy za Twoją opinię.");
  };

  return (
    <main className="main-content">
      <div className="details-container">
        <div className="details-sidebar">
          <div className="details-image-container">
            <img 
              src={course.imageSrc} 
              alt={course.title} 
              className="details-image"
              
            />
          </div>
          <div className="details-sidebar-info">
            <h1 className="details-title-sidebar">{course.title}</h1>
            <div className="details-rating-sidebar">
              <StarRating rating={course.rating} />
            </div>
            <button className="details-enroll-button" onClick={() => onEnroll(course)}>
              Zapisz się i rozpocznij naukę
            </button>
            
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