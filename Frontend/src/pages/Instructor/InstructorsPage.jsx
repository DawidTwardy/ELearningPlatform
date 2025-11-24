import React, { useEffect, useState } from 'react';
import { fetchInstructors } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import '../../styles/components/App.css';
import '../../styles/pages/InstructorsPage.css';

const InstructorCard = ({ instructor, onProfileClick }) => (
  <div className="instructor-card" onClick={onProfileClick}>
    <div className="instructor-avatar-container">
      <img 
        src={instructor.avatarSrc || "/src/icon/usericon.png"} 
        alt={`Awatar ${instructor.name}`} 
        className="instructor-avatar" 
      />
    </div>
    
    <h3 className="instructor-name">{instructor.name}</h3>
    <p className="instructor-bio">
        {instructor.bio && instructor.bio.length > 100 
            ? instructor.bio.substring(0, 100) + '...' 
            : instructor.bio}
    </p>
    
    <div className="instructor-courses">
      {instructor.topCourses && instructor.topCourses.length > 0 ? (
          instructor.topCourses.map((course, index) => (
            <p key={index} className="course-list-item">
              {course}
            </p>
          ))
      ) : (
          <p className="course-list-item" style={{fontStyle: 'italic', color: '#777'}}>Brak kursów</p>
      )}
      
      <button className="show-all-courses" onClick={(e) => {
          e.stopPropagation();
          onProfileClick();
      }}>
        Zobacz profil
      </button>
    </div>
  </div>
);

const InstructorsPage = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadInstructors = async () => {
      try {
        const data = await fetchInstructors();
        setInstructors(data);
      } catch (err) {
        console.error("Błąd pobierania instruktorów:", err);
        setError("Nie udało się pobrać listy instruktorów.");
      } finally {
        setLoading(false);
      }
    };

    loadInstructors();
  }, []);

  if (loading) {
      return <div className="main-content" style={{textAlign: 'center', marginTop: '50px'}}>Ładowanie instruktorów...</div>;
  }

  if (error) {
      return <div className="main-content" style={{textAlign: 'center', marginTop: '50px', color: 'red'}}>{error}</div>;
  }

  return (
    <main className="main-content">
      <h2 className="page-title">Instruktorzy</h2> 
      
      {instructors.length === 0 ? (
          <p style={{textAlign: 'center', color: '#aaa'}}>Brak instruktorów do wyświetlenia.</p>
      ) : (
          <div className="instructor-list">
            {instructors.map((instructor) => (
              <InstructorCard 
                key={instructor.id} 
                instructor={instructor} 
                onProfileClick={() => navigate(`/instructor/${instructor.id}`)}
              />
            ))}
          </div>
      )}
    </main>
  );
};

export default InstructorsPage;