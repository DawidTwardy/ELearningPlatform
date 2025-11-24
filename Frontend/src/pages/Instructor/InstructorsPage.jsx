import React, { useState, useEffect } from 'react';
import '../../styles/pages/InstructorsPage.css';
import { Link } from 'react-router-dom';
import { fetchInstructors, resolveImageUrl } from '../../services/api';

const InstructorsPage = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInstructors = async () => {
      try {
        const data = await fetchInstructors();
        setInstructors(data);
      } catch (error) {
        console.error("Failed to load instructors", error);
      } finally {
        setLoading(false);
      }
    };
    loadInstructors();
  }, []);

  if (loading) return <div className="loading">Ładowanie instruktorów...</div>;

  return (
    <div className="instructors-page">
      <h2 className="page-title">Nasi Instruktorzy</h2>
      <div className="instructors-grid">
        {instructors.map((instructor) => (
          <div key={instructor.id} className="instructor-card">
            <div className="instructor-avatar-container">
              {/* Wyświetlanie awatara instruktora */}
              <img 
                src={resolveImageUrl(instructor.avatarUrl) || '/src/AvatarInstructor/usericon_large.png'} 
                alt={`${instructor.firstName} ${instructor.lastName}`} 
                className="instructor-avatar"
                onError={(e) => {e.target.onerror = null; e.target.src = '/src/AvatarInstructor/usericon_large.png'}}
              />
            </div>
            <div className="instructor-info">
              <h3>{instructor.firstName} {instructor.lastName}</h3>
              <p className="instructor-bio-short">
                  {instructor.bio ? instructor.bio.substring(0, 100) + '...' : 'Instruktor'}
              </p>
              <Link to={`/instructor/${instructor.id}`} className="view-profile-btn">
                Zobacz Profil
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstructorsPage;