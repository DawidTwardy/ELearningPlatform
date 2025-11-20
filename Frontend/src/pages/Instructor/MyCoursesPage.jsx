import React, { useEffect, useState } from 'react';
import '../../styles/pages/InstructorsPage.css';
import { useNavigate } from 'react-router-dom';

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
        <div className="instructors-grid">
          {courses.map(course => (
            <div key={course.id} className="instructor-card">
              <div className="instructor-image-wrapper">
                  <img 
                    src={course.imageSrc || course.imageUrl || "/src/course/placeholder_sql.png"} 
                    alt={course.title} 
                    className="instructor-image"
                    onError={(e) => { e.target.src = "/src/course/placeholder_sql.png"; }}
                  />
              </div>
              <div className="instructor-info">
                <h3 className="instructor-name">{course.title}</h3>
                <p className="instructor-title">{course.category}</p>
                <p className="instructor-bio">{course.description?.substring(0, 100)}...</p>
                <div className="course-stats">
                    <span>{course.level}</span>
                    <span>{course.price} PLN</span>
                </div>
                <div className="instructor-actions" style={{marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                    <button 
                        onClick={() => handleEdit(course.id)} 
                        className="follow-btn"
                        style={{flex: 1}}
                    >
                        Edytuj
                    </button>
                    <button 
                        onClick={() => handleStats(course.id)} 
                        className="follow-btn"
                        style={{flex: 1, backgroundColor: '#4CAF50', borderColor: '#4CAF50'}}
                    >
                        Statystyki
                    </button>
                    <button 
                        onClick={() => handleDelete(course.id)} 
                        className="follow-btn"
                        style={{flex: 1, backgroundColor: '#ff4444', borderColor: '#ff4444'}}
                    >
                        Usuń
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default MyCoursesPage;