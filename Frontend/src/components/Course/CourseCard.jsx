import React from 'react';
import { FavoriteHeart } from './FavoriteHeart';
import StarRating from './StarRating';

export const CourseCard = ({ course, onClick, isFavorite, onFavoriteToggle, showInstructor = true, onEdit, showFavoriteButton = true, progress, onShowCertificate, children }) => {
    const isCompleted = progress === 100;
    
    const getInstructorName = () => {
        if (!course.instructor) return "";
        if (typeof course.instructor === 'object') {
            return course.instructor.name || course.instructor.userName || "Instruktor";
        }
        return course.instructor;
    };

    // POPRAWKA: Wyświetlamy pasek zawsze, gdy progress jest zdefiniowany (nawet jeśli wynosi 0)
    const showProgress = progress !== null && progress !== undefined;

    return (
        <div 
            className={`course-card ${isCompleted ? 'completed' : ''}`} 
            onClick={onClick} 
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            <div 
                className="card-image-container" 
                style={{ backgroundColor: course.iconColor }} 
            >
                <img 
                    src={course.imageSrc || course.imageUrl} 
                    alt={course.title} 
                    className="card-image" 
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/250x140/1B1B1B/FFFFFF?text=Kurs' }}
                />
            </div>
            
            {showFavoriteButton && (
                <FavoriteHeart 
                    isFavorite={isFavorite}
                    onToggle={onFavoriteToggle}
                />
            )}

            <div className="card-info">
                <h3 className="course-title">{course.title}</h3>
                {showInstructor && <p className="course-instructor">{getInstructorName()}</p>}
                
                { onEdit !== null && children } 
            </div>
            
            {showProgress && (
                <div className="progress-bar-container">
                    <div 
                        className={`progress-bar-fill ${isCompleted ? 'completed' : ''}`}
                        style={{ width: `${progress}%` }}
                    ></div>
                    {/* POPRAWKA: Tekst procentowy zawsze widoczny na pasku */}
                    <span className="progress-bar-text">{Math.round(progress)}%</span>
                </div>
            )}
            
            {onEdit && (
                <button className="card-edit-button" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                    Edytuj
                </button>
            )}

            {onShowCertificate && (
                <button className="card-certificate-button" onClick={(e) => { e.stopPropagation(); onShowCertificate(); }}>
                    Zobacz Certyfikat
                </button>
            )}
            
            { (onEdit === null) && !onShowCertificate && children }
        </div>
    );
};

export default CourseCard;