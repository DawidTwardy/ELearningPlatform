import React from 'react';
import '../../styles/components/App.css'; // ZMIENIONA ŚCIEŻKA
import '../../styles/pages/InstructorProfilePage.css'; // ZMIENIONA ŚCIEŻKA
import { CourseCard } from '../../components/Course/CourseCard'; // ZMIENIONA ŚCIEŻKA
import StarRating from '../../components/Course/StarRating'; // ZMIENIONA ŚCIEŻKA

const InstructorProfilePage = ({ instructor, courses, onCourseClick, onBack }) => {
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
          {courses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course}
              onClick={() => onCourseClick(course)}
              showInstructor={false}
              showFavoriteButton={true}
            >
                <StarRating rating={course.rating} /> 
            </CourseCard>
          ))}
        </div>
      </div>
    </main>
  );
};

export default InstructorProfilePage;