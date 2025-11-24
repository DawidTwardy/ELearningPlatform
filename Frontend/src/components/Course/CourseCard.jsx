import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/components/CourseCard.css';
import FavoriteHeart from './FavoriteHeart';
import StarRating from './StarRating';
import { resolveImageUrl } from '../../services/api';

const CourseCard = ({ course, isFavorite, onToggleFavorite }) => {
  const navigate = useNavigate();

  const handleCardClick = (e) => {
      // Zapobiegaj nawigacji jeśli kliknięto w serce lub link instruktora
      if (e.target.closest('.favorite-btn') || e.target.closest('.instructor-link')) {
          return;
      }
      navigate(`/courses/${course.id}`);
  };

  return (
    <div className="course-card" onClick={handleCardClick}>
      <div className="course-thumbnail">
        <div className={`placeholder-image ${getPlaceholderClass(course.category)}`}>
            {getCategoryIcon(course.category)}
        </div>
        {onToggleFavorite && (
             <div className="favorite-btn-wrapper">
                <FavoriteHeart isFavorite={isFavorite} onToggle={() => onToggleFavorite(course.id)} />
             </div>
        )}
      </div>
      
      <div className="course-info">
        <div className="course-category">{course.category}</div>
        <h3 className="course-title" title={course.title}>{course.title}</h3>
        
        <div className="course-instructor">
            {/* Mały awatar instruktora na karcie kursu */}
            <img 
                src={resolveImageUrl(course.instructor?.avatarUrl) || '/src/icon/usericon.png'} 
                alt="Instructor" 
                className="instructor-avatar-small"
                onError={(e) => {e.target.onerror = null; e.target.src = '/src/icon/usericon.png'}}
            />
            <Link to={`/instructor/${course.instructorId}`} className="instructor-link">
                {course.instructorName || "Instruktor"}
            </Link>
        </div>

        <div className="course-meta">
            <StarRating rating={course.averageRating || 0} />
            <span className="rating-count">({course.reviewsCount || 0})</span>
        </div>
        
        <div className="course-footer">
           <span className="course-level">{course.level}</span>
           <span className="course-price">
               {course.price > 0 ? `${course.price} PLN` : 'Darmowy'}
           </span>
        </div>
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