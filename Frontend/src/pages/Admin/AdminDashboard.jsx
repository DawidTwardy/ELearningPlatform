import React, { useState } from 'react';
import '../../styles/pages/AdminDashboard.css'; 
import { CourseCard } from '../../components/Course/CourseCard'; 


const MOCK_REPORTED_COURSES = [
    { id: 2, title: "Kurs Pythona", instructor: "Jan Kowalski", rating: 4.5, imageSrc: "/src/course/placeholder_python.png"},
    { id: 3, title: "Kurs AI", instructor: "Michał Nowak", rating: 4, imageSrc: "/src/course/placeholder_ai.png" },
];

const MOCK_REPORTED_COMMENTS = [
  { id: 'c1', text: "To jest nieodpowiedni komentarz!", author: "Anna Zając", course: "Kurs Nauki SQL" },
  { id: 'c2', text: "Instruktor podaje błędne informacje w tej lekcji.", author: "Marek B", course: "Kurs Pythona" },
];

const AdminDashboard = ({ onAdminViewCourse }) => {
  const [courses, setCourses] = useState(MOCK_REPORTED_COURSES);
  const [comments, setComments] = useState(MOCK_REPORTED_COMMENTS);

  const handleDeleteCourse = (courseId, courseTitle) => {
    if (window.confirm(`Czy na pewno chcesz usunąć kurs "${courseTitle}"? Tej akcji nie można cofnąć.`)) {
      setCourses(courses.filter(c => c.id !== courseId));
      alert(`Usunięto kurs ${courseTitle}`);
    }
  };
  
  const handleIgnoreCourseReport = (courseId) => {
      setCourses(courses.filter(c => c.id !== courseId));
      alert(`Zgłoszenie kursu ${courseId} zostało zignorowane.`);
  };

  const handleKeepComment = (commentId) => {
     setComments(comments.filter(c => c.id !== commentId));
     alert(`Zgłoszenie komentarza ${commentId} zostało zignorowane. Komentarz pozostaje widoczny.`);
  };

  const handleDeleteComment = (commentId) => {
     if (window.confirm(`Czy na pewno chcesz usunąć ten komentarz?`)) {
        setComments(comments.filter(c => c.id !== commentId));
        alert(`Usunięto komentarz`);
     }
  };


  return (
    <main className="main-content">
      <h2 className="page-title">Panel Moderacji Admina</h2>

      <div className="admin-section-container">
        <h3 className="admin-section-title">Zgłoszone Kursy ({courses.length})</h3>
        <div className="courses-list">
          {courses.map(course => (
            <CourseCard 
              key={course.id}
              course={course}
              showFavoriteButton={false}
              showInstructor={true}
              onEdit={null} 
              onClick={() => onAdminViewCourse(course)}
            >
              {/* Przyciski admina przekazane jako 'children' */}
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
          ))}
        </div>
      </div>

      <div className="admin-section-container">
        <h3 className="admin-section-title">Zgłoszone Komentarze ({comments.length})</h3>
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
      </div>
    </main>
  );
};

export default AdminDashboard;