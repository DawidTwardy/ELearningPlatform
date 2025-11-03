import React from 'react';

export const StarRating = ({ rating }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        let starImageSrc = "/src/rating-star/star-empty.png"; 
        if (i <= rating) starImageSrc = "/src/rating-star/star-full.png";
        else if (i - 0.5 === rating) starImageSrc = "/src/rating-star/star-half.png";
        
        stars.push(
            <img 
                key={i} 
                src={starImageSrc} 
                alt="Gwiazdka oceny"
                className="star-icon-image"
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/12x12/333/fff?text=S' }}
            />
        );
    }
    return <div className="star-rating">{stars}</div>;
};

export default StarRating; 