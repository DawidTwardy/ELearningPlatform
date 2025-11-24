import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchInstructorDetails, resolveImageUrl } from '../../services/api';
import StarRating from '../../components/Course/StarRating';
import '../../styles/pages/InstructorProfilePage.css';

const InstructorProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Paginacja
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 9;

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        setLoading(true);
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

  // Logika paginacji
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
          
          {/* ZMIANA: Używamy dangerouslySetInnerHTML, aby interpretować HTML z bazy (np. z edytora tekstu) */}
          <div 
            className="profile-bio" 
            dangerouslySetInnerHTML={{ __html: instructor.bio || "Brak opisu." }}
          />

          <div className="instructor-stats-simple" style={{ marginTop: '15px', color: '#888' }}>
             <span>Liczba kursów: {courses.length}</span>
          </div>
        </div>
      </div>

      <div className="instructor-courses-section">
        <h2>Kursy prowadzone przez tego instruktora</h2>
        
        <div className="courses-list">
          {currentCourses.length > 0 ? (
            currentCourses.map(course => {
                const imageUrl = resolveImageUrl(course.imageUrl);
                const rating = typeof course.rating === 'number' ? course.rating : 0;
                const lessonsCount = course.lessonsCount || 0;

                return (
                    <div 
                        key={course.id} 
                        className="course-item-card" 
                        onClick={() => navigate(`/courses/${course.id}`)}
                        style={{ cursor: 'pointer' }}
                    >
                        <img 
                            src={imageUrl || '/src/course/placeholder_ai.png'} 
                            alt={course.title} 
                            className="course-item-img"
                            onError={(e) => {e.target.onerror = null; e.target.src = '/src/course/placeholder_ai.png'}} 
                        />
                        
                        <div className="course-item-info">
                            <h4>{course.title}</h4>
                            <p className="course-category" style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '10px' }}>
                                {course.category || 'Ogólne'}
                            </p>
                            
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                {rating > 0 ? (
                                    <>
                                        <StarRating rating={rating} size={16} />
                                        <span style={{ marginLeft: '8px', color: '#fbbf24', fontWeight: 'bold' }}>
                                            {rating.toFixed(1)}
                                        </span>
                                    </>
                                ) : (
                                    <span style={{ color: '#888', fontStyle: 'italic', fontSize: '0.9rem' }}>
                                        Brak ocen
                                    </span>
                                )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ddd', fontSize: '0.95rem' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                                </svg>
                                <span>{lessonsCount} lekcji</span>
                            </div>

                        </div>
                    </div>
                );
            })
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