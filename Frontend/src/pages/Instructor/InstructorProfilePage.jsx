import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { resolveImageUrl } from '../../services/api';
import '../../styles/pages/InstructorProfilePage.css';

const InstructorProfilePage = () => {
  const { id } = useParams();
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        const response = await api.get(`/instructors/${id}`);
        setInstructor(response.data);
      } catch (err) {
        console.error(err);
        setError('Nie udało się pobrać danych instruktora.');
      } finally {
        setLoading(false);
      }
    };

    fetchInstructor();
  }, [id]);

  if (loading) return <div className="loading-container">Ładowanie profilu...</div>;
  if (error) return <div className="error-container">{error}</div>;
  if (!instructor) return <div className="error-container">Nie znaleziono instruktora.</div>;

  return (
    <div className="instructor-profile-page">
      <div className="profile-header">
        <div className="profile-avatar-container">
          <img
            src={resolveImageUrl(instructor.avatarUrl) || '/src/AvatarInstructor/usericon_large.png'}
            alt={`${instructor.firstName} ${instructor.lastName}`}
            className="profile-avatar"
            onError={(e) => {e.target.onerror = null; e.target.src = '/src/AvatarInstructor/usericon_large.png'}}
          />
        </div>
        <div className="profile-details">
          <h1>{instructor.firstName} {instructor.lastName}</h1>
          <p className="profile-bio">{instructor.bio || "Brak opisu."}</p>
        </div>
      </div>

      <div className="instructor-courses-section">
        <h2>Kursy prowadzone przez tego instruktora</h2>
        <div className="courses-list">
          {instructor.courses && instructor.courses.length > 0 ? (
            instructor.courses.map(course => (
              <div key={course.id} className="course-item-card">
                <img 
                    src={resolveImageUrl(course.imageUrl)} 
                    alt={course.title} 
                    className="course-item-img"
                    onError={(e) => {e.target.onerror = null; e.target.src = '/src/course/placeholder_ai.png'}} 
                />
                <div className="course-item-info">
                    <h4>{course.title}</h4>
                    <p>{course.category}</p>
                </div>
              </div>
            ))
          ) : (
            <p>Ten instruktor nie ma jeszcze przypisanych kursów.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorProfilePage;