import React from 'react';
import { FavoriteHeart } from './FavoriteHeart';

export const CourseCard = ({ course, onClick, isFavorite, onFavoriteToggle, showInstructor = true, onEdit, showFavoriteButton = true, progress, onShowCertificate, children }) => {
    const isCompleted = progress === 100;
    
    const getInstructorName = () => {
        if (!course.instructor) return "";
        if (typeof course.instructor === 'object') {
            return course.instructor.name || course.instructor.userName || "Instruktor";
        }
        return course.instructor;
    };

    const showProgress = progress !== null && progress !== undefined;

    // Logika decydująca, gdzie wyświetlić children (przyciski)
    // Jeśli jest onEdit (widok admina), children są wewnątrz info.
    // Jeśli NIE MA onEdit (widok instruktora), children są na dole karty.
    const renderChildrenAtBottom = !onEdit && children;

    return (
        <div 
            className={`course-card ${isCompleted ? 'completed' : ''}`} 
            onClick={onClick} 
            style={{ 
                cursor: onClick ? 'pointer' : 'default',
                display: 'flex',
                flexDirection: 'column',
                height: 'auto',
                minHeight: '100%',
                position: 'relative'
            }}
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
            
            {/* Zabezpieczenie: wyświetl serce tylko jeśli mamy handler onFavoriteToggle */}
            {showFavoriteButton && onFavoriteToggle && (
                <FavoriteHeart 
                    isFavorite={isFavorite}
                    onToggle={onFavoriteToggle}
                />
            )}

            <div className="card-info" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 className="course-title">{course.title}</h3>
                {showInstructor && <p className="course-instructor">{getInstructorName()}</p>}
                
                {/* Jeśli onEdit istnieje, renderuj children tutaj (stary styl) */}
                {onEdit && children} 
            </div>
            
            {showProgress && (
                <div className="progress-bar-container">
                    <div 
                        className={`progress-bar-fill ${isCompleted ? 'completed' : ''}`}
                        style={{ width: `${progress}%` }}
                    ></div>
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
            
            {/* Nowe miejsce dla przycisków w panelu instruktora - na samym dole */}
            {renderChildrenAtBottom && (
                <div style={{ marginTop: 'auto', paddingTop: '10px', paddingBottom: '5px' }}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default CourseCard;