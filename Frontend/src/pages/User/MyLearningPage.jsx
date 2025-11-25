import React, { useState, useEffect } from 'react';
import { fetchMyEnrollments, fetchCourseDetails, resolveImageUrl } from '../../services/api';
import CourseCard from '../../components/Course/CourseCard';
import { useNavigate } from 'react-router-dom';
import '../../styles/components/App.css';
import '../../styles/pages/MyLearningPage.css';

const MyLearningPage = ({ onCourseClick, onNavigateToHome }) => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadEnrollments = async () => {
      try {
        setLoading(true);
        // 1. Pobierz listę zapisów (często zwraca niepełne dane o kursie)
        const enrollmentsData = await fetchMyEnrollments();
        
        // 2. "Dopytaj" o szczegóły każdego kursu, aby uzyskać prawdziwe reviewsCount i rating
        // Używamy Promise.all, aby pobrać dane równolegle
        const enrichedEnrollments = await Promise.all(
            enrollmentsData.map(async (item) => {
                const courseId = item.course?.id || item.courseId || item.id;
                
                if (!courseId) return item;

                try {
                    // Pobieramy PEŁNE dane kursu, gdzie reviewsCount na pewno jest poprawne
                    const fullDetails = await fetchCourseDetails(courseId);
                    
                    // Nadpisujemy obiekt course w enrollmencie danymi ze szczegółów
                    return {
                        ...item,
                        course: {
                            ...(item.course || {}),
                            ...fullDetails, // To nadpisze reviewsCount i averageRating poprawnymi wartościami
                            // Upewniamy się, że ID jest zachowane
                            id: courseId 
                        }
                    };
                } catch (err) {
                    console.warn(`Nie udało się pobrać szczegółów dla kursu ${courseId}`, err);
                    return item; // W razie błędu zwracamy to co mamy
                }
            })
        );

        console.log("Pobrane i uzupełnione kursy:", enrichedEnrollments);
        setEnrolledCourses(enrichedEnrollments);

      } catch (err) {
        console.error("Błąd pobierania kursów:", err);
        setError("Nie udało się załadować Twoich kursów.");
      } finally {
        setLoading(false);
      }
    };

    loadEnrollments();
  }, []);

  const handleContinue = (courseId) => {
    if (onCourseClick) {
        onCourseClick(courseId);
    } else {
        navigate(`/course-view/${courseId}`);
    }
  };

  const handleNavigateHome = () => {
      if (onNavigateToHome) onNavigateToHome();
      else navigate('/');
  };

  if (loading) return <main className="main-content"><div className="loading-container">Ładowanie kursów...</div></main>;
  if (error) return <main className="main-content"><div className="error-container">{error}</div></main>;

  return (
    <main className="main-content">
      <h2 className="page-title" style={{ borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '30px' }}>
        Moja nauka
      </h2>
      
      {enrolledCourses.length === 0 ? (
        <div className="empty-favorites-container">
          <h3>Nie jesteś jeszcze zapisany na żaden kurs.</h3>
          <button onClick={handleNavigateHome} className="browse-courses-button">
            Przeglądaj kursy
          </button>
        </div>
      ) : (
        <div className="courses-list">
          {enrolledCourses.map((item) => {
            const courseData = item.course || item.Course || item;
            if (!courseData) return null;

            // Teraz reviewsCount pochodzi z fetchCourseDetails, więc powinno być poprawne
            const rawReviewsCount = 
                courseData.reviewsCount ?? 
                courseData.ReviewsCount ?? 
                courseData.ratingsCount ?? 
                0;

            const countReviews = parseInt(rawReviewsCount) || 0;
            const ratingVal = parseFloat(courseData.averageRating ?? courseData.AverageRating ?? 0);

            const mappedCourse = {
                id: courseData.id || courseData.Id,
                title: courseData.title || courseData.Title,
                category: courseData.category || courseData.Category || 'Ogólne',
                imageSrc: resolveImageUrl(courseData.imageUrl || courseData.ImageUrl || courseData.thumbnailUrl),
                instructorName: courseData.instructorName || courseData.InstructorName || "Instruktor",
                instructorId: courseData.instructorId || courseData.InstructorId,
                instructor: {
                    avatarUrl: courseData.instructorAvatar || courseData.InstructorAvatar || courseData.instructor?.avatarUrl
                },
                averageRating: ratingVal,
                reviewsCount: countReviews // Przekazujemy liczbę do CourseCard
            };

            const progressValue = item.progress !== undefined ? item.progress : (item.Progress || 0);

            return (
              <CourseCard
                key={item.id || item.Id}
                course={mappedCourse}
                onClick={() => handleContinue(mappedCourse.id)}
                // progress={progressValue} // USUNIĘTO: Domyślny pasek postępu w CourseCard jest ukryty
                showFavoriteButton={false}
                showInstructor={true}
              >
                  {/* DODANO: Niestandardowy pasek postępu z tekstem */}
                  <div className="progress-bar-container">
                      <div 
                          className={`progress-bar-fill ${progressValue === 100 ? 'completed' : ''}`} 
                          style={{ width: `${progressValue}%` }} 
                      />
                      <span className="progress-bar-text">{progressValue}%</span>
                  </div>

                  <button 
                      className="card-continue-button"
                      onClick={(e) => { e.stopPropagation(); handleContinue(mappedCourse.id); }}
                  >
                      Kontynuuj
                  </button>
              </CourseCard>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default MyLearningPage;