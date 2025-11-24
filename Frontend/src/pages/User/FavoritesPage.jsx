import React, { useState } from 'react';
import '../../styles/components/App.css'; 
import '../../styles/pages/Favorites.css'; 
import CourseCard from '../../components/Course/CourseCard'; 

const initialFavoritesData = [
  { 
      id: 1, 
      title: "Kurs Nauki SQL", 
      instructorName: "Michał Nowak", 
      averageRating: 4, 
      reviewsCount: 15,
      category: "Programowanie",
      level: "Początkujący",
      price: 199,
      imageSrc: "/src/course/placeholder_sql.png"
  },
  { 
      id: 2, 
      title: "Kurs Pythona", 
      instructorName: "Jan Kowalski", 
      averageRating: 4.5, 
      reviewsCount: 28,
      category: "Programowanie",
      level: "Średniozaawansowany",
      price: 149,
      imageSrc: "/src/course/placeholder_python.png" 
  },
  { 
      id: 3, 
      title: "Kurs AI", 
      instructorName: "Michał Nowak", 
      averageRating: 4, 
      reviewsCount: 10,
      category: "Biznes",
      level: "Zaawansowany",
      price: 299,
      imageSrc: "/src/course/placeholder_ai.png" 
  },
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
              isFavorite={true}
              onToggleFavorite={() => removeFavorite(course.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyFavoritesMessage onNavigateToHome={onNavigateToHome} />
      )}
    </main>
  );
};

export default FavoritesPage;