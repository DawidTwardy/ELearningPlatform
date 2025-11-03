import React from 'react';
import '../../styles/components/App.css'; // ZMIENIONA ŚCIEŻKA
import '../../styles/pages/SearchResultsPage.css'; // ZMIENIONA ŚCIEŻKA
import { CourseCard } from '../../components/Course/CourseCard'; // ZMIENIONA ŚCIEŻKA
import StarRating from '../../components/Course/StarRating'; // ZMIENIONA ŚCIEŻKA

const SearchResultsPage = ({ allCourses, query, onCourseClick }) => {
  const filteredCourses = allCourses.filter(course => 
    course.title.toLowerCase().includes(query.toLowerCase()) ||
    course.instructor.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="main-content">
      <h2 className="page-title">
        Wyniki wyszukiwania dla: <span className="search-query-highlight">"{query}"</span>
      </h2>
      
      {filteredCourses.length > 0 ? (
        <div className="courses-list">
          {filteredCourses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course}
              onClick={() => onCourseClick(course)}
              showInstructor={true}
              showFavoriteButton={true}
            >
                <StarRating rating={course.rating} /> 
            </CourseCard>
          ))}
        </div>
      ) : (
        <div className="no-results-container">
          <p>Brak wyników pasujących do Twojego wyszukiwania.</p>
        </div>
      )}
    </main>
  );
};

export default SearchResultsPage;