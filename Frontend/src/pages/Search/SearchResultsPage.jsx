import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchCourses } from '../../services/api';
import '../../styles/components/App.css';
import '../../styles/pages/SearchResultsPage.css';
import { CourseCard } from '../../components/Course/CourseCard';
import StarRating from '../../components/Course/StarRating';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query) {
      const loadResults = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await searchCourses(query);
          setResults(data);
        } catch (err) {
          console.error(err);
          setError('Wystąpił błąd podczas wyszukiwania.');
        } finally {
          setLoading(false);
        }
      };
      loadResults();
    } else {
      setResults([]);
    }
  }, [query]);

  const handleCourseClick = (course) => {
      navigate(`/courses/${course.id}`);
  };

  return (
    <main className="main-content">
      <h2 className="page-title">
        Wyniki wyszukiwania dla: <span className="search-query-highlight">"{query}"</span>
      </h2>
      
      {loading && <div className="loading-container">Szukanie...</div>}
      
      {error && <div className="error-container">{error}</div>}

      {!loading && !error && (
        <>
          {results.length > 0 ? (
            <div className="courses-list">
              {results.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course}
                  onClick={() => handleCourseClick(course)}
                  showInstructor={true}
                  showFavoriteButton={false}
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
        </>
      )}
    </main>
  );
};

export default SearchResultsPage;