import React, { useState } from 'react';
import '../../styles/components/App.css'; // ZMIENIONA ŚCIEŻKA
import '../../styles/pages/Favorites.css'; // ZMIENIONA ŚCIEŻKA
import { CourseCard } from '../../components/Course/CourseCard'; // ZMIENIONA ŚCIEŻKA
import StarRating from '../../components/Course/StarRating'; // ZMIENIONA ŚCIEŻKA
import '../../styles/pages/InstructorDashboard.css'; // ZMIENIONA ŚCIEŻKA

const initialMyCoursesData = [
  { id: 1, title: "Kurs Nauki SQL", instructor: "Michał Nowak", rating: 5, imageSrc: "/src/course/placeholder_sql.png", iconColor: "#007BFF" },
  { id: 2, title: "Kurs Pythona", instructor: "Jan Kowalski", rating: 4.5, imageSrc: "/src/course/placeholder_python.png", iconColor: "#FFC107" },
];

const InstructorDashboardStats = ({ courses }) => {
  const totalCourses = courses.length;
  const averageRating = courses.reduce((acc, course) => acc + course.rating, 0) / totalCourses || 0;
  const totalStudents = totalCourses * 150; 

  return (
    <div className="dashboard-stats-container">
      <div className="stat-card">
        <span className="stat-card-title">Łączna liczba studentów</span>
        <span className="stat-card-value">{totalStudents.toLocaleString('pl-PL')}</span>
      </div>
      <div className="stat-card">
        <span className="stat-card-title">Średnia ocena kursów</span>
        <div className="stat-card-rating">
          <span className="stat-card-value">{averageRating.toFixed(1)}</span>
          <StarRating rating={averageRating} />
        </div>
      </div>
      <div className="stat-card">
        <span className="stat-card-title">Liczba kursów</span>
        <span className="stat-card-value">{totalCourses}</span>
      </div>
    </div>
  );
};


const EmptyCreatedCoursesMessage = ({ onStartAddCourse }) => {
  return (
    <div className="empty-favorites-container">
      <h3 className="empty-favorites-title">Nie stworzyłeś jeszcze żadnych kursów</h3>
      <div className="empty-favorites-icon-wrapper">
        <img 
            src="/src/NoCourse.png" 
            alt="Brak kursów"
            className="nocourse-icon-image"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/250x250/242424/FFFFFF?text=Brak+Kursów' }}
        />
      </div>
      <button 
        className="browse-courses-button"
        style={{ backgroundColor: '#28A745', color: '#FFFFFF' }}
        onClick={onStartAddCourse}
      >
        Stwórz swój pierwszy kurs
      </button>
    </div>
  );
};

const MyCoursesPage = ({ setSelectedCourse, onNavigateToHome, onStartEdit, onStartAddCourse }) => {
  const [myCourses, setMyCourses] = useState(initialMyCoursesData); 

  const handleEditCourse = (course) => {
    onStartEdit(course);
  };

  return (
    <main className="main-content">
      <div className="page-header-actions">
        <h2 className="page-title" style={{ marginBottom: 0 }}>Panel Instruktora</h2>
        {myCourses.length > 0 && (
          <button className="add-course-button" onClick={onStartAddCourse}>
            Dodaj nowy kurs
          </button>
        )}
      </div>

      {myCourses.length > 0 ? (
        <>
          <InstructorDashboardStats courses={myCourses} />
          
          <h3 className="learning-section-title" style={{fontSize: '1.3em', marginTop: '40px'}}>
            Zarządzaj swoimi kursami ({myCourses.length})
          </h3>
          
          <div className="courses-list">
            {myCourses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course}
                onClick={() => setSelectedCourse(course)}
                showInstructor={false}
                onEdit={() => handleEditCourse(course)}
                showFavoriteButton={false}
              >
                <StarRating rating={course.rating} /> 
              </CourseCard>
            ))}
          </div>
        </>
      ) : (
        <EmptyCreatedCoursesMessage onNavigateToHome={onNavigateToHome} onStartAddCourse={onStartAddCourse} />
      )}
    </main>
  );
};

export default MyCoursesPage;