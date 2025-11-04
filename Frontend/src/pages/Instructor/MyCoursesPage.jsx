import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/components/App.css'; 
import '../../styles/pages/Favorites.css'; 
import { CourseCard } from '../../components/Course/CourseCard'; 
import StarRating from '../../components/Course/StarRating'; 
import '../../styles/pages/InstructorDashboard.css'; 
import NoCourseImage from '/src/NoCourse.png'; // Użycie obrazu z public/src

// Usunięto initialMyCoursesData - dane będą pobierane z API

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
            src={NoCourseImage} // Użycie zaimportowanego obrazu
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
  // Zmieniono nazwę stanu, aby odzwierciedlała dane z API
  const [myCourses, setMyCourses] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyCourses = async () => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      setError('Błąd: Użytkownik nie jest zalogowany.');
      setLoading(false);
      return;
    }

    try {
      // Pobieramy kursy z API
      const response = await fetch('https://localhost:7115/api/Courses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Nie udało się załadować kursów. Status: ${response.status}`);
      }

      const data = await response.json();
      
      // Zakładamy, że API zwraca tablicę kursów (data)
      // LUB tablicę w polu data.courses
      if (Array.isArray(data)) {
        setMyCourses(data);
      } else if (Array.isArray(data.courses)) {
        setMyCourses(data.courses);
      } else {
        setMyCourses([]);
      }

    } catch (err) {
      console.error("Błąd ładowania kursów:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []); // Wywołaj tylko raz po załadowaniu komponentu

  const handleEditCourse = (course) => {
    // Wysyłamy cały obiekt kursu do komponentu nadrzędnego
    onStartEdit(course);
  };

  // Stany ładowania i błędu
  if (loading) {
    return <main className="main-content"><div className="loading-container">Ładowanie kursów...</div></main>;
  }

  if (error) {
    return <main className="main-content"><div className="error-container">Błąd ładowania kursów: {error}</div></main>;
  }

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
                // Używamy onEdit, ale wewnątrz wykonujemy onStartEdit z obiektu MyCoursesPage
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