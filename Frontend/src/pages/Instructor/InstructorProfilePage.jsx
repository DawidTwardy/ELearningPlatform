import React from 'react';
import '../../styles/components/App.css';
import '../../styles/pages/InstructorProfilePage.css';
import { CourseCard } from '../../components/Course/CourseCard';
import StarRating from '../../components/Course/StarRating';

const InstructorProfilePage = ({ instructor, courses = [], onCourseClick, onBack }) => {
  // ZABEZPIECZENIE: Jeśli instructor jest null/undefined, wyświetlamy stosowny komunikat.
  // Zapobiega to błędowi "instructor is undefined" przy odświeżaniu lub ładowaniu.
  if (!instructor) {
    return (
      <main className="main-content">
         <div className="profile-header-container" style={{ justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '50px' }}>
            <h2>Nie wybrano instruktora lub dane są niedostępne.</h2>
            <button className="profile-back-button" onClick={onBack} style={{ position: 'static', marginTop: '20px' }}>
              &larr; Wróć do listy instruktorów
            </button>
         </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="profile-header-container">
        <button className="profile-back-button" onClick={onBack}>
          &larr; Wszyscy Instruktorzy
        </button>
        <div className="profile-header-content">
          <img 
            src={instructor.avatarSrc || '/src/icon/usericon.png'} 
            alt={instructor.name}
            className="profile-avatar-large"
            onError={(e) => { e.target.onerror = null; e.target.src = '/src/icon/usericon.png' }}
          />
          <div className="profile-header-info">
            <h1 className="profile-name">{instructor.name}</h1>
            <p className="profile-bio">{instructor.bio || "Instruktor nie dodał jeszcze swojej biografii."}</p>
            <div className="profile-stats">
              <div className="profile-stat-item">
                <span className="stat-value">4.7</span>
                <StarRating rating={4.7} />
                <span className="stat-label">Średnia ocena</span>
              </div>
              <div className="profile-stat-item">
                <span className="stat-value">12,345</span>
                <span className="stat-label">Studenci</span>
              </div>
              <div className="profile-stat-item">
                <span className="stat-value">{courses.length}</span>
                <span className="stat-label">Kursy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="profile-courses-container">
        <h2 className="profile-courses-title">Kursy prowadzone przez {instructor.name}</h2>
        <div className="courses-list">
          {courses && courses.length > 0 ? (
            courses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course}
                onClick={() => onCourseClick(course)}
                showInstructor={false}
                showFavoriteButton={true}
              >
                  <StarRating rating={course.rating} /> 
              </CourseCard>
            ))
          ) : (
            <p style={{ color: '#aaa', fontStyle: 'italic' }}>Ten instruktor nie udostępnił jeszcze żadnych kursów.</p>
          )}
        </div>
      </div>
    </main>
  );
};

export default InstructorProfilePage;