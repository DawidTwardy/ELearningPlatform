import React, { useState, useEffect } from 'react';
import '../../styles/components/App.css'; 
import '../../styles/pages/Favorites.css'; 
import '../../styles/pages/MyLearningPage.css'; 
import { CourseCard } from '../../components/Course/CourseCard'; 
import StarRating from '../../components/Course/StarRating'; 
import { useAuth } from '../../context/AuthContext'; 
import axios from 'axios';

const API_BASE_URL = 'http://localhost:7115/api';


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
  const { token, isAuthenticated } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEnrolledCourses();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);
  
  const fetchProgressForCourse = async (courseId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Progress/course/${courseId}`);
      return response.data?.ProgressPercentage ?? 0;
    } catch (error) {
      console.error(`Błąd pobierania postępu dla kursu ${courseId}:`, error);
      return 0;
    }
  };


  const fetchEnrolledCourses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/Enrollments`);
      
      console.log("Pobrane kursy (raw data):", response.data); 
      
      let courses = response.data.map(c => {
          const courseId = c.id || c.Id;
          
          if (!courseId) {
              console.error("Krytyczny błąd: ID kursu jest niezdefiniowane po mapowaniu, pomijam kurs.", c);
              return null;
          }

          return {
              id: courseId,
              title: c.title || c.Title || 'Brak tytułu',
              description: c.description || c.Description || 'Brak opisu',
              imageSrc: c.imageSrc || c.ImageSrc,
              instructor: c.instructor || c.Instructor || 'Nieznany',
              rating: c.rating || c.Rating || 0,
              sections: c.sections || c.Sections || [],
          };
      }).filter(c => c !== null);

      console.log("Kursy po mapowaniu i filtrowaniu (jeśli puste, to jest problem z backendem lub brak kursów):", courses); 
      
      
      if (courses.length === 0) {
        setEnrolledCourses([]);
        setIsLoading(false);
        return;
      }

      const coursesWithProgressPromises = courses.map(async (course) => {
        const progress = await fetchProgressForCourse(course.id);
        return {
          ...course,
          progress: progress 
        };
      });
      
      const coursesWithProgress = await Promise.all(coursesWithProgressPromises);
      
      setEnrolledCourses(coursesWithProgress);
      
    } catch (err) {
      console.error("Błąd pobierania kursów:", err);
      
      if (err.response && err.response.status === 401) {
        setError("Błąd uwierzytelnienia. Zaloguj się ponownie.");
      } else {
        setError("Wystąpił błąd podczas pobierania Twoich kursów.");
      }
      setEnrolledCourses([]);
    } finally {
      setIsLoading(false);
    }
  };


  const inProgress = enrolledCourses.filter(c => c.progress < 100);
  const completed = enrolledCourses.filter(c => c.progress === 100);

  if (isLoading) {
    return (
      <main className="main-content">
        <h2 className="learning-page-title">Ładowanie kursów...</h2>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main-content">
        <h2 className="learning-page-title">Błąd</h2>
        <p>{error}</p>
        <button onClick={fetchEnrolledCourses}>Spróbuj ponownie</button>
      </main>
    );
  }
  
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
                onClick={() => {
                  console.log(`[MyLearningPage] Kliknięto kurs: ${course.title} z ID: ${course.id}`);
                  onCourseClick(course.id);
                }}
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
                // POPRAWKA: Ustawiamy onClick, aby umożliwić wejście w ukończony kurs
                onClick={() => {
                  console.log(`[MyLearningPage] Kliknięto ukończony kurs: ${course.title} z ID: ${course.id}`);
                  onCourseClick(course.id);
                }}
                showInstructor={true}
                showFavoriteButton={false}
                progress={course.progress}
                onShowCertificate={() => {
                  console.log(`[MyLearningPage] Kliknięto certyfikat dla kursu: ${course.title} z ID: ${course.id}`);
                  onShowCertificate(course.id);
                }}
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