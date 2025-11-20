import React, { useEffect, useState } from 'react';
import '../../styles/pages/InstructorsPage.css';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../../components/Course/CourseCard';

const MyCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error("Brak tokenu autoryzacji");
        }

        // Endpoint zwracający kursy tylko zalogowanego instruktora
        const response = await fetch('http://localhost:7115/api/Courses/my-courses', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Błąd pobierania kursów');
        }
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, []);

  const handleEdit = (courseId) => {
      navigate(`/edit-course/${courseId}`);
  };

  const handleDelete = async (courseId) => {
      if(!window.confirm("Czy na pewno chcesz usunąć ten kurs?")) return;

      try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:7115/api/Courses/${courseId}`, {
              method: 'DELETE',
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });

          if(response.ok) {
              setCourses(courses.filter(c => c.id !== courseId));
          } else {
              alert("Nie udało się usunąć kursu.");
          }
      } catch (e) {
          console.error(e);
          alert("Błąd sieci.");
      }
  };

  const handleAddCourse = () => {
      navigate('/add-course');
  };
  
  const handleStats = (courseId) => {
      navigate(`/instructor/analytics/${courseId}`);
  };

  if (loading) return <div className="loading">Ładowanie...</div>;
  if (error) return <div className="error">Błąd: {error}</div>;

  return (
    <main className="main-content">
      <div className="instructors-page-header">
          <h2 className="page-title">Moje Kursy</h2>
          <button className="add-course-btn" onClick={handleAddCourse}>+ Dodaj nowy kurs</button>
      </div>
      
      {courses.length === 0 ? (
        <div className="no-courses">
            <p>Nie masz jeszcze żadnych kursów.</p>
        </div>
      ) : (
        <div className="courses-list">
          {courses.map(course => (
            <CourseCard
                key={course.id}
                course={course}
                // WAŻNE: Nie przekazujemy onEdit tutaj, aby nie używać wbudowanego przycisku.
                // Zamiast tego tworzymy własny zestaw przycisków poniżej.
                showInstructor={false}
                showFavoriteButton={false}
                onClick={() => handleEdit(course.id)} // Kliknięcie w kartę też edytuje
            >
                <div style={{ display: 'flex', gap: '8px', marginTop: '15px', flexWrap: 'wrap' }}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleEdit(course.id); }} 
                        className="card-action-button"
                        style={{ backgroundColor: '#2196F3' }}
                    >
                        Edytuj
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleStats(course.id); }} 
                        className="card-action-button"
                        style={{ backgroundColor: '#4CAF50' }}
                    >
                        Statystyki
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(course.id); }} 
                        className="card-action-button"
                        style={{ backgroundColor: '#f44336' }}
                    >
                        Usuń
                    </button>
                </div>
            </CourseCard>
          ))}
        </div>
      )}
    </main>
  );
};

export default MyCoursesPage;