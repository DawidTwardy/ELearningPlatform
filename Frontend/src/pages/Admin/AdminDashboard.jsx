import React, { useState, useEffect } from 'react';
import '../../styles/pages/AdminDashboard.css'; 
import CourseCard from '../../components/Course/CourseCard'; 
import { 
  fetchReportedCourses, 
  ignoreCourseReport, 
  deleteReportedCourse, 
  fetchReportedComments, 
  keepComment, 
  deleteReportedComment 
} from '../../services/api';

const AdminDashboard = ({ onAdminViewCourse }) => {
  const [courses, setCourses] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchModerationData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedCourses, fetchedComments] = await Promise.all([
        fetchReportedCourses(),
        fetchReportedComments()
      ]);
      
      // Mapowanie danych z DTO do formatu oczekiwanego przez komponenty frontendu
      setCourses(fetchedCourses.map(c => ({ 
        id: c.id, 
        title: c.title, 
        instructor: c.instructor, 
        rating: c.rating, 
        imageSrc: c.imageSrc 
      })));
      
      setComments(fetchedComments.map(c => ({
        id: c.id,
        text: c.text,
        author: c.author,
        course: c.courseTitle
      })));
    } catch (err) {
      setError("Nie udało się pobrać danych moderacyjnych: " + err.message);
      console.error("Błąd pobierania danych moderacyjnych:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModerationData();
  }, []);

  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (window.confirm(`Czy na pewno chcesz usunąć kurs "${courseTitle}"? Tej akcji nie można cofnąć.`)) {
      try {
        await deleteReportedCourse(courseId);
        setCourses(courses.filter(c => c.id !== courseId));
        alert(`Usunięto kurs ${courseTitle}`);
      } catch (err) {
        alert("Błąd podczas usuwania kursu: " + err.message);
      }
    }
  };
  
  const handleIgnoreCourseReport = async (courseId) => {
    try {
      await ignoreCourseReport(courseId);
      setCourses(courses.filter(c => c.id !== courseId));
      alert(`Zgłoszenie kursu ${courseId} zostało zignorowane.`);
    } catch (err) {
      alert("Błąd podczas ignorowania zgłoszenia: " + err.message);
    }
  };

  const handleKeepComment = async (commentId) => {
    try {
      await keepComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
      alert(`Zgłoszenie komentarza ${commentId} zostało zignorowane. Komentarz pozostaje widoczny.`);
    } catch (err) {
      alert("Błąd podczas ignorowania zgłoszenia komentarza: " + err.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
     if (window.confirm(`Czy na pewno chcesz usunąć ten komentarz?`)) {
        try {
          await deleteReportedComment(commentId);
          setComments(comments.filter(c => c.id !== commentId));
          alert(`Usunięto komentarz`);
        } catch (err) {
          alert("Błąd podczas usuwania komentarza: " + err.message);
        }
     }
  };

  if (loading) return <main className="main-content"><p>Ładowanie danych moderacyjnych...</p></main>;
  if (error) return <main className="main-content"><p className="error-message">{error}</p></main>;

  return (
    <main className="main-content">
      <h2 className="page-title">Panel Moderacji Admina</h2>

      <div className="admin-section-container">
        <h3 className="admin-section-title">Zgłoszone Kursy ({courses.length})</h3>
        <div className="courses-list">
          {courses.length === 0 ? (
            <p>Brak zgłoszonych kursów.</p>
          ) : (
            courses.map(course => (
              <CourseCard 
                key={course.id}
                course={course}
                showFavoriteButton={false}
                showInstructor={true}
                onEdit={null} 
                onClick={() => onAdminViewCourse(course)}
              >
                <div className="admin-course-actions">
                  <button 
                    className="admin-btn-ignore"
                    onClick={(e) => { e.stopPropagation(); handleIgnoreCourseReport(course.id); }}
                  >
                    Ignoruj
                  </button>
                  <button 
                    className="admin-btn-delete-course" 
                    onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id, course.title); }}
                  >
                    Usuń Kurs
                  </button>
                </div>
              </CourseCard>
            ))
          )}
        </div>
      </div>

      <div className="admin-section-container">
        <h3 className="admin-section-title">Zgłoszone Komentarze ({comments.length})</h3>
        {comments.length === 0 ? (
          <p>Brak zgłoszonych komentarzy.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Treść Komentarza</th>
                <th>Autor</th>
                <th>Kurs</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {comments.map(comment => (
                <tr key={comment.id}>
                  <td className="admin-comment-text">"{comment.text}"</td>
                  <td>{comment.author}</td>
                  <td>{comment.course}</td>
                  <td className="admin-actions">
                    <button 
                      className="admin-btn-keep"
                      onClick={() => handleKeepComment(comment.id)}
                    >
                      Zachowaj
                    </button>
                    <button 
                      className="admin-btn-delete-comment"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      Usuń
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
};

export default AdminDashboard;