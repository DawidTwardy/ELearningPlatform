import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchInstructorDetails } from '../../services/api';
import '../../styles/components/App.css';
import '../../styles/pages/InstructorProfilePage.css';
import { CourseCard } from '../../components/Course/CourseCard';
import StarRating from '../../components/Course/StarRating';

const InstructorProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInstructor = async () => {
      try {
        const data = await fetchInstructorDetails(id);
        setInstructor(data);
      } catch (err) {
        console.error("Błąd pobierania profilu instruktora:", err);
        setError("Nie udało się załadować profilu instruktora.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
        loadInstructor();
    }
  }, [id]);

  const handleBack = () => {
      navigate('/instructors');
  };

  const handleCourseClick = (courseId) => {
      navigate(`/courses/${courseId}`);
  };

  const calculateAverageRating = (courses) => {
    if (!courses || courses.length === 0) return "0.0";
    
    // Filtrujemy kursy, które mają ocenę 0 (zakładamy, że 0 oznacza brak ocen)
    const ratedCourses = courses.filter(course => course.rating > 0);
    
    if (ratedCourses.length === 0) return "0.0";

    const total = ratedCourses.reduce((acc, curr) => acc + curr.rating, 0);
    return (total / ratedCourses.length).toFixed(1);
  };

  if (loading) {
      return <div className="main-content" style={{textAlign: 'center', padding: '50px'}}>Ładowanie profilu...</div>;
  }

  if (error || !instructor) {
    return (
      <main className="main-content">
         <div className="profile-header-container" style={{ justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '50px' }}>
            <h2>{error || "Nie znaleziono instruktora."}</h2>
            <button className="profile-back-button" onClick={handleBack} style={{ position: 'static', marginTop: '20px' }}>
              &larr; Wróć do listy instruktorów
            </button>
         </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="profile-header-container">
        <button className="profile-back-button" onClick={handleBack}>
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
                <span className="stat-value">
                    {calculateAverageRating(instructor.courses)}
                </span>
                <span className="stat-label">Średnia ocena</span>
              </div>
              <div className="profile-stat-item">
                <span className="stat-value">{instructor.courses ? instructor.courses.length : 0}</span>
                <span className="stat-label">Kursy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="profile-courses-container">
        <h2 className="profile-courses-title">Kursy prowadzone przez {instructor.name}</h2>
        <div className="courses-list">
          {instructor.courses && instructor.courses.length > 0 ? (
            instructor.courses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course}
                onClick={() => handleCourseClick(course.id)}
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