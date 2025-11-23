import React from 'react';
import '../../styles/components/Gamification.css';

const BadgesList = ({ badges }) => {
    if (!badges || badges.length === 0) {
        return <p style={{color: '#aaa'}}>Jeszcze nie zdobyłeś żadnych odznak. Ucz się dalej!</p>;
    }

    return (
        <div className="badges-grid">
            {badges.map((b, i) => (
                <div key={i} className="badge-item" title={`Zdobyto: ${new Date(b.awardedAt).toLocaleDateString()}`}>
                    <img 
                        src="/src/rating-star/star-full.png" 
                        alt="Badge Icon" 
                        className="badge-icon" 
                    />
                    <span className="badge-name">{b.name}</span>
                    <span className="badge-desc">{b.description}</span>
                </div>
            ))}
        </div>
    );
};

export default BadgesList;