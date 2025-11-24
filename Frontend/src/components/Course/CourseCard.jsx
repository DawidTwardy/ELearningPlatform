import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/components/CourseCard.css';
import FavoriteHeart from './FavoriteHeart';
import StarRating from './StarRating';
import { resolveImageUrl } from '../../services/api';

const CourseCard = ({ 
    course, 
    isFavorite, 
    onToggleFavorite, 
    children, 
    onClick, 
    progress,
    showFavoriteButton = true,
    showInstructor = true 
}) => {
  const navigate = useNavigate();

  const handleCardClick = (e) => {
      if (e.target.closest('.favorite-btn-wrapper') || e.target.closest('.instructor-link')) {
          return;
      }
      
      if (onClick) {
          onClick();
          return;
      }

      navigate(`/courses/${course.id}`);
  };

  const ratingValue = parseFloat(course.averageRating || course.rating || 0);

  // --- POPRAWIONA LOGIKA DLA NAZWY INSTRUKTORA ---
  let instructorName = "Instruktor";
  
  if (course.instructorName) {
      // Przypadek 1: DTO ma pole instructorName (np. FavoritesPage)
      instructorName = course.instructorName;
  } else if (typeof course.instructor === 'string') {
      // Przypadek 2: Pole instructor jest stringiem (np. MyLearningPage)
      instructorName = course.instructor;
  } else if (course.instructor && typeof course.instructor === 'object') {
      // Przypadek 3: Pole instructor jest obiektem (np. HomePage z API)
      // Sprawdzamy różne warianty nazwy pola zwracane przez backend
      if (course.instructor.name) instructorName = course.instructor.name;
      else if (course.instructor.Name) instructorName = course.instructor.Name;
      else if (course.instructor.userName) instructorName = course.instructor.userName;
      else if (course.instructor.fullName) instructorName = course.instructor.fullName;
  }

  // Logika dla awatara
  const instructorAvatar = course.instructor?.avatarUrl || course.instructorAvatar || null;
  const instructorId = course.instructorId || course.instructor?.id;

  return (
    <div className="course-card" onClick={handleCardClick}>
      <div className="course-thumbnail">
        <div className={`placeholder-image ${getPlaceholderClass(course.category)}`}>
             {/* Tu ewentualnie ikona kategorii */}
        </div>
        {showFavoriteButton && onToggleFavorite && (
             <div className="favorite-btn-wrapper">
                <FavoriteHeart isFavorite={isFavorite} onToggle={() => onToggleFavorite(course.id)} />
             </div>
        )}
      </div>
      
      <div className="course-info">
        <h3 className="course-title" title={course.title}>{course.title}</h3>
        
        {showInstructor && (
            <div className="course-instructor">
                <img 
                    src={resolveImageUrl(instructorAvatar) || '/src/icon/usericon.png'} 
                    alt="Instructor" 
                    className="instructor-avatar-small"
                    onError={(e) => {e.target.onerror = null; e.target.src = '/src/icon/usericon.png'}}
                />
                {instructorId ? (
                    <Link to={`/instructor/${instructorId}`} className="instructor-link">
                        {instructorName}
                    </Link>
                ) : (
                    <span className="instructor-name-text">{instructorName}</span>
                )}
            </div>
        )}

        <div className="course-meta">
            <div className="stars-container-full">
                <StarRating rating={ratingValue} />
            </div>
            <span className="rating-count">({course.reviewsCount || course.ratingCount || 0})</span>
        </div>

        {typeof progress === 'number' && (
            <div style={{ margin: '12px 0 0 0', width: '100%', backgroundColor: '#333', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, backgroundColor: '#4caf50', height: '100%' }} />
            </div>
        )}
        
        {children && <div style={{ marginTop: '15px' }}>{children}</div>}
      </div>
    </div>
  );
};

const getPlaceholderClass = (category) => {
    switch(category?.toLowerCase()) {
        case 'programowanie': return 'bg-blue';
        case 'biznes': return 'bg-green';
        case 'design': return 'bg-pink';
        default: return 'bg-gray';
    }
};

export default CourseCard;