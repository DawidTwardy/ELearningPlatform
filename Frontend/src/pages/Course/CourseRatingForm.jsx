import React, { useState } from 'react';
import '../../styles/pages/CourseRatingForm.css'; // ZMIENIONA ŚCIEŻKA

const StarInput = ({ label, value, isSelected, onSelect }) => (
  <img 
    src={isSelected ? "/src/rating-star/star-full.png" : "/src/rating-star/star-outline.png"} 
    alt={`${label} gwiazdka`}
    className={`rating-form-star ${isSelected ? 'selected' : ''}`}
    onClick={onSelect}
    onMouseEnter={onSelect}
    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/35x35/333/fff?text=S' }}
  />
);

const CourseRatingForm = ({ course, onBack, onSubmitRating }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Proszę wybrać ocenę w gwiazdkach.");
      return;
    }
    console.log("Wysyłanie oceny:", { courseId: course.id, rating, reviewText });
    // Przekazujemy teraz również treść recenzji
    onSubmitRating(course.title, rating, reviewText);
  };

  const currentStars = hoverRating > 0 ? hoverRating : rating;

  return (
    <main className="main-content">
      <div className="rating-form-container">
        <form onSubmit={handleSubmit}>
          <div className="edit-header">
            <h2 className="page-title">Oceń kurs: {course.title}</h2>
          </div>
          
          <div className="section-item">
            <div className="edit-form-group">
              <label>Twoja ocena</label>
              <div 
                className="rating-form-stars-wrapper" 
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map(value => (
                  <StarInput 
                    key={value}
                    label={`${value}`}
                    value={value}
                    isSelected={value <= currentStars}
                    onSelect={() => setRating(value)}
                  />
                ))}
              </div>
            </div>

            <div className="edit-form-group">
              <label htmlFor="reviewText">Twoja recenzja (opcjonalnie)</label>
              <textarea
                id="reviewText"
                className="edit-input rating-form-textarea"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Co sądzisz o tym kursie? Czy poleciłbyś go innym?"
                rows="6"
              />
            </div>
          </div>

          <div className="rating-form-actions">
            <button type="button" className="edit-btn-secondary" onClick={onBack}>
              Anuluj
            </button>
            <button type="submit" className="edit-btn-primary">
              Wyślij ocenę
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default CourseRatingForm;