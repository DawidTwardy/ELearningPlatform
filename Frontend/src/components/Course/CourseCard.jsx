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

  const ratingValue = parseFloat(course.averageRating || course.AverageRating) || 0;
  const reviewsCount = parseInt(course.reviewsCount || course.ReviewsCount) || 0;
  const hasReviews = reviewsCount > 0;

  // Pobieranie nazwy instruktora z różnych możliwych pól (zależnie od endpointu API)
  const instructorName = course.instructorName 
      || course.InstructorName 
      || course.instructor?.name 
      || course.Instructor?.Name 
      || "Instruktor";

  // Pobieranie ID instruktora
  const instructorId = course.instructorId || course.InstructorId || course.instructor?.id || course.Instructor?.Id;

  // Pobieranie awatara instruktora
  const instructorAvatar = course.instructor?.avatarUrl || course.Instructor?.AvatarUrl;

  const displayImage = resolveImageUrl(course.imageUrl || course.imageSrc || course.ImageUrl);

  return (
    <div className="course-card" onClick={handleCardClick}>
      <div className="course-thumbnail">
        {displayImage ? (
            <img 
                src={displayImage} 
                alt={course.title} 
                className="course-image"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                }}
            />
        ) : null}
        
        <div className={`placeholder-image ${getPlaceholderClass(course.category)}`} style={{ display: displayImage ? 'none' : 'flex' }}>
            {getCategoryIcon(course.category)}
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
                    alt={instructorName} 
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

        <div className="course-meta" style={{ justifyContent: hasReviews ? 'flex-start' : 'center' }}>
            {hasReviews ? (
                <>
                    <StarRating rating={ratingValue} />
                    <span className="rating-count">({reviewsCount})</span>
                </>
            ) : (
                <span className="no-reviews" style={{ color: '#888', fontStyle: 'italic', fontSize: '0.9em' }}>
                    Brak opinii
                </span>
            )}
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

const getCategoryIcon = (category) => {
    return null; 
};

export default CourseCard;