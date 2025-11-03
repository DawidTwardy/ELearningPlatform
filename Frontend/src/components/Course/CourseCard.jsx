import React from 'react';
import { FavoriteHeart } from './FavoriteHeart';
// Importujemy StarRating jako domyślny export
import StarRating from './StarRating';

export const CourseCard = ({ course, onClick, isFavorite, onFavoriteToggle, showInstructor = true, onEdit, showFavoriteButton = true, progress, onShowCertificate, children }) => {
    const isCompleted = progress === 100;
    
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
                    src={course.imageSrc} 
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
                {showInstructor && <p className="course-instructor">{course.instructor}</p>}
                
                {/* POPRAWKA:
                  Renderujemy 'children' (gwiazdki) w tym miejscu TYLKO wtedy, 
                  gdy NIE są to przyciski admina (czyli onEdit NIE jest równe null).
                */}
                { onEdit !== null && children } 
            </div>
            
            {progress > 0 && (
                <div className="progress-bar-container">
                    <div 
                        className={`progress-bar-fill ${isCompleted ? 'completed' : ''}`}
                        style={{ width: `${progress}%` }}
                    ></div>
                    <span className="progress-bar-text">{progress}%</span>
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
            
            {/* TA LINIA JEST POPRAWNA:
              Renderuje 'children' (przyciski admina) na dole karty, 
              gdy 'onEdit' jest jawnie ustawione na 'null'.
            */}
            { (onEdit === null) && !onShowCertificate && children }
        </div>
    );
};

export default CourseCard;