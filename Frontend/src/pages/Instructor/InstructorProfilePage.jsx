import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchInstructorDetails, resolveImageUrl } from '../../services/api';
import '../../styles/pages/InstructorProfilePage.css';

const InstructorProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 9;

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        const data = await fetchInstructorDetails(id);
        setInstructor(data);
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

  const courses = instructor.courses || [];
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(courses.length / coursesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const displayName = instructor.name || `${instructor.firstName || ''} ${instructor.lastName || ''}`;
  const avatarSource = instructor.avatarSrc || instructor.avatarUrl;

  return (
    <div className="instructor-profile-page">
      <div className="profile-header">
        <div className="profile-avatar-container">
          <img
            src={resolveImageUrl(avatarSource) || '/src/AvatarInstructor/usericon_large.png'}
            alt={displayName}
            className="profile-avatar"
            onError={(e) => {e.target.onerror = null; e.target.src = '/src/AvatarInstructor/usericon_large.png'}}
          />
        </div>
        <div className="profile-details">
          <h1>{displayName}</h1>
          <p className="profile-bio">{instructor.bio || "Brak opisu."}</p>
        </div>
      </div>

      <div className="instructor-courses-section">
        <h2>Kursy prowadzone przez tego instruktora</h2>
        
        <div className="courses-list">
          {currentCourses.length > 0 ? (
            currentCourses.map(course => (
              <div 
                key={course.id} 
                className="course-item-card" 
                onClick={() => navigate(`/courses/${course.id}`)}
              >
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

        {totalPages > 1 && (
          <div className="pagination-controls">
            <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                className="pagination-btn"
            >
              Poprzednia
            </button>
            <span className="pagination-info">
              Strona {currentPage} z {totalPages}
            </span>
            <button 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                className="pagination-btn"
            >
              Następna
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorProfilePage;