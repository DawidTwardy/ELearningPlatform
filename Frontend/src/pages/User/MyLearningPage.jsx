import React, { useState, useEffect } from 'react';
import { fetchMyEnrollments } from '../../services/api';
import CourseCard from '../../components/Course/CourseCard'; 
import { useNavigate } from 'react-router-dom';
import '../../styles/components/App.css';
import '../../styles/pages/MyLearningPage.css';

const MyLearningPage = ({ onCourseClick, onNavigateToHome }) => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadEnrollments = async () => {
      try {
        setLoading(true);
        const data = await fetchMyEnrollments();
        setEnrolledCourses(data);
      } catch (err) {
        console.error("Błąd pobierania kursów:", err);
        setError("Nie udało się załadować Twoich kursów.");
      } finally {
        setLoading(false);
      }
    };

    loadEnrollments();
  }, []);

  const handleContinue = (courseId) => {
    if (onCourseClick) {
        onCourseClick(courseId);
    } else {
        navigate(`/course-view/${courseId}`);
    }
  };

  const handleNavigateHome = () => {
      if (onNavigateToHome) onNavigateToHome();
      else navigate('/');
  };

  if (loading) return <main className="main-content"><div className="loading-container">Ładowanie kursów...</div></main>;
  if (error) return <main className="main-content"><div className="error-container">{error}</div></main>;

  return (
    <main className="main-content">
      <h2 className="page-title" style={{ borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '30px' }}>
        Moja nauka
      </h2>
      
      {enrolledCourses.length === 0 ? (
        <div className="empty-favorites-container">
          <h3>Nie jesteś jeszcze zapisany na żaden kurs.</h3>
          <button onClick={handleNavigateHome} className="browse-courses-button">
            Przeglądaj kursy
          </button>
        </div>
      ) : (
        <div className="courses-list">
          {enrolledCourses.map((item) => {
            const courseData = item.course || item.Course;
            if (!courseData) return null;

            const mappedCourse = {
                id: courseData.id || courseData.Id,
                title: courseData.title || courseData.Title,
                imageSrc: courseData.imageUrl || courseData.ImageUrl || "/src/course/placeholder_ai.png",
                instructor: courseData.instructorName || courseData.InstructorName || "Instruktor",
                rating: 0,
                iconColor: '#2a2a2a' 
            };

            const progressValue = item.progress !== undefined ? item.progress : (item.Progress || 0);

            return (
              <CourseCard
                key={item.id || item.Id}
                course={mappedCourse}
                onClick={() => handleContinue(mappedCourse.id)}
                progress={progressValue}
                showFavoriteButton={false}
                showInstructor={true}
              >
                  <button 
                      className="card-continue-button"
                      onClick={(e) => { e.stopPropagation(); handleContinue(mappedCourse.id); }}
                  >
                      Kontynuuj
                  </button>
              </CourseCard>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default MyLearningPage;