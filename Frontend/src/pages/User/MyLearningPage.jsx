import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMyEnrollments } from '../../services/api';
import '../../styles/pages/MyLearningPage.css';

const MyLearningPage = () => {
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
    navigate(`/course-view/${courseId}`);
  };

  if (loading) return <div className="loading-spinner">Ładowanie kursów...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="my-learning-container">
      <h1 className="page-title">Moja nauka</h1>
      
      {enrolledCourses.length === 0 ? (
        <div className="empty-state">
          <p>Nie jesteś jeszcze zapisany na żaden kurs.</p>
          <button onClick={() => navigate('/search')} className="browse-btn">
            Przeglądaj kursy
          </button>
        </div>
      ) : (
        <div className="enrolled-courses-grid">
          {enrolledCourses.map((item) => {
            // ZABEZPIECZENIE: Obsługa różnych formatów danych (wielkość liter z API)
            const courseData = item.course || item.Course;

            // Jeśli z jakiegoś powodu dane kursu są puste, pomijamy ten element, żeby nie wywalić aplikacji
            if (!courseData) return null;

            const imageUrl = courseData.imageUrl || courseData.ImageUrl || "/src/course/placeholder_ai.png";
            const title = courseData.title || courseData.Title || "Bez tytułu";
            const instructorName = courseData.instructorName || courseData.InstructorName || "Instruktor";
            const courseId = courseData.id || courseData.Id;
            const progress = item.progress || item.Progress || 0;

            return (
              <div key={item.id || item.Id} className="course-card-learning">
                <div className="course-image-wrapper">
                  <img 
                      src={imageUrl} 
                      alt={title} 
                      className="course-image" 
                  />
                </div>
                <div className="course-info">
                  <h3 className="course-title">{title}</h3>
                  <p className="course-instructor">{instructorName}</p>
                  
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{progress}% ukończono</span>
                  
                  <button 
                      className="continue-btn"
                      onClick={() => handleContinue(courseId)}
                  >
                      Kontynuuj
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyLearningPage;