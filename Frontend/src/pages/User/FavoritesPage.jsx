import React, { useState } from 'react';
import '../../styles/components/App.css'; // ZMIENIONA ŚCIEŻKA
import '../../styles/pages/Favorites.css'; // ZMIENIONA ŚCIEŻKA
import { CourseCard } from '../../components/Course/CourseCard'; // ZMIENIONA ŚCIEŻKA
import StarRating from '../../components/Course/StarRating'; // ZMIENIONA ŚCIEŻKA

const initialFavoritesData = [
  { id: 1, title: "Kurs Nauki SQL", instructor: "Michał Nowak", rating: 4, imageSrc: "/src/course/placeholder_sql.png", iconColor: "#007BFF" },
  { id: 2, title: "Kurs Pythona", instructor: "Jan Kowalski", rating: 4.5, imageSrc: "/src/course/placeholder_python.png", iconColor: "#FFC107" },
  { id: 3, title: "Kurs AI", instructor: "Michał Nowak", rating: 4, imageSrc: "/src/course/placeholder_ai.png", iconColor: "#8A2BE2" },
];

const EmptyFavoritesMessage = ({ onNavigateToHome }) => {
  
  const handleBrowseClick = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };

  return (
    <div className="empty-favorites-container">
      <h3 className="empty-favorites-title">Aktualnie nie Masz żadnych Polubionych Kursów</h3>
      <div className="empty-favorites-icon-wrapper">
        <img 
            src="/src/NoCourse.png" 
            alt="Brak ulubionych kursów"
            className="nocourse-icon-image"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/250x250/242424/FFFFFF?text=Brak+Kursów' }}
        />
      </div>
      <button 
        className="browse-courses-button"
        onClick={handleBrowseClick}
      >
        Przeglądaj kursy
      </button>
    </div>
  );
};

const FavoritesPage = ({ onNavigateToHome }) => {
  const [favorites, setFavorites] = useState(initialFavoritesData); 

  const removeFavorite = (idToRemove) => {
    setTimeout(() => {
      setFavorites(prevFavorites => 
        prevFavorites.filter(course => course.id !== idToRemove)
      );
    }, 300); 
  };

  return (
    <main className="main-content">
      <h2 className="page-title">Twoje Polubione kursy</h2>
      
      {favorites.length > 0 ? (
        <div className="courses-list">
          {favorites.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course}
              onClick={null}
              isFavorite={true}
              onFavoriteToggle={() => removeFavorite(course.id)}
            >
                <StarRating rating={course.rating} /> 
            </CourseCard>
          ))}
        </div>
      ) : (
        <EmptyFavoritesMessage onNavigateToHome={onNavigateToHome} />
      )}
    </main>
  );
};

export default FavoritesPage;