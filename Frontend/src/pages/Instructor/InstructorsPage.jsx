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

  // Funkcja pomocnicza do usuwania znaczników HTML z bio (dla widoku kafelka)
  const stripHtml = (html) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  if (loading) return <div className="loading">Ładowanie instruktorów...</div>;

  return (
    <div className="instructors-page">
      <h2 className="page-title">Nasi Instruktorzy</h2>
      <div className="instructors-grid">
        {instructors.map((instructor) => {
            // Czyścimy bio z HTML i skracamy
            const cleanBio = stripHtml(instructor.bio);
            const shortBio = cleanBio.length > 100 
                ? cleanBio.substring(0, 100) + '...' 
                : (cleanBio || 'Instruktor');

            return (
              <div key={instructor.id} className="instructor-card">
                <div className="instructor-avatar-container">
                  <img 
                    // POPRAWKA: Backend zwraca 'avatarSrc', a nie 'avatarUrl'
                    src={resolveImageUrl(instructor.avatarSrc) || '/src/AvatarInstructor/usericon_large.png'} 
                    // POPRAWKA: Backend zwraca pole 'name' (połączone imię i nazwisko)
                    alt={instructor.name} 
                    className="instructor-avatar"
                    onError={(e) => {e.target.onerror = null; e.target.src = '/src/AvatarInstructor/usericon_large.png'}}
                  />
                </div>
                <div className="instructor-info">
                  {/* POPRAWKA: Wyświetlanie pola 'name' */}
                  <h3>{instructor.name}</h3>
                  
                  <p className="instructor-bio-short">
                      {shortBio}
                  </p>
                  
                  <Link to={`/instructor/${instructor.id}`} className="view-profile-btn">
                    Zobacz Profil
                  </Link>
                </div>
              </div>
            );
        })}
      </div>
    </div>
  );
};

export default InstructorsPage;