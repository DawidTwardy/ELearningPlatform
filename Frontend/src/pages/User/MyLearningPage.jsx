import React, { useState } from 'react';
import '../../styles/components/App.css'; // ZMIENIONA ŚCIEŻKA
import '../../styles/pages/Favorites.css'; // ZMIENIONA ŚCIEŻKA
import '../../styles/pages/MyLearningPage.css'; // ZMIENIONA ŚCIEŻKA
import { CourseCard } from '../../components/Course/CourseCard'; // ZMIENIONA ŚCIEŻKA
import StarRating from '../../components/Course/StarRating'; // ZMIENIONA ŚCIEŻKA

const inProgressCoursesData = [
  { id: 1, title: "Kurs Nauki SQL", instructor: "Michał Nowak", rating: 5, imageSrc: "/src/course/placeholder_sql.png", progress: 75 },
  { id: 2, title: "Kurs Pythona", instructor: "Jan Kowalski", rating: 4.5, imageSrc: "/src/course/placeholder_python.png", progress: 30 },
];

const completedCoursesData = [
  { id: 3, title: "Kurs AI", instructor: "Michał Nowak", rating: 4, imageSrc: "/src/course/placeholder_ai.png", progress: 100 },
];

const EmptyLearningMessage = ({ onNavigateToHome }) => {
  return (
    <div className="empty-favorites-container">
      <h3 className="empty-favorites-title">Nie zapisałeś się jeszcze na żaden kurs</h3>
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
        onClick={onNavigateToHome}
      >
        Przeglądaj kursy
      </button>
    </div>
  );
};

const MyLearningPage = ({ onCourseClick, onNavigateToHome, onShowCertificate }) => {
  const [enrolledCourses, setEnrolledCourses] = useState([...inProgressCoursesData, ...completedCoursesData]);

  const inProgress = enrolledCourses.filter(c => c.progress < 100);
  const completed = enrolledCourses.filter(c => c.progress === 100);

  if (enrolledCourses.length === 0) {
    return <EmptyLearningMessage onNavigateToHome={onNavigateToHome} />;
  }

  return (
    <main className="main-content">
      <h2 className="learning-page-title">Moja Nauka</h2>
      
      {inProgress.length > 0 && (
        <section className="learning-section">
          <h3 className="learning-section-title">Kursy w trakcie ({inProgress.length})</h3>
          <div className="courses-list">
            {inProgress.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course}
                onClick={() => onCourseClick(course)}
                showInstructor={true}
                showFavoriteButton={false}
                progress={course.progress}
              >
                <StarRating rating={course.rating} /> 
              </CourseCard>
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section className="learning-section">
          <h3 className="learning-section-title">Ukończone kursy ({completed.length})</h3>
          <div className="courses-list">
            {completed.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course}
                onClick={null}
                showInstructor={true}
                showFavoriteButton={false}
                progress={course.progress}
                onShowCertificate={() => onShowCertificate(course)}
              >
                <StarRating rating={course.rating} /> 
              </CourseCard>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default MyLearningPage;