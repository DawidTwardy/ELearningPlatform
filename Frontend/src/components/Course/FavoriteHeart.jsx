import React from 'react';

export const FavoriteHeart = ({ isFavorite, onToggle }) => {
    const heartSrc = isFavorite 
      ? '/src/course/heart.png' 
      : '/src/course/heart-outline.png'; 

    const handleClick = (e) => {
        e.stopPropagation();
        onToggle();
    };

    return (
        <img 
            src={heartSrc} 
            className="filled-heart"
            onClick={handleClick}
            alt="Dodaj/Usuń z ulubionych"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/50x50/333/fff?text=H' }}
        />
    );
};

export default FavoriteHeart;