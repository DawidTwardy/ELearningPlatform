import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../../styles/pages/InstructorProfilePage.css';
import CourseCard from '../../components/Course/CourseCard';
import { fetchInstructorDetails, resolveImageUrl } from '../../services/api';

const InstructorProfilePage = () => {
  const { id } = useParams();
  const [instructor, setInstructor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchInstructorDetails(id);
        setInstructor(data.instructor);
        setCourses(data.courses);
      } catch (error) {
        console.error("Error fetching instructor details", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) return <div className="loading">Ładowanie...</div>;
  if (!instructor) return <div className="error">Instruktor nie znaleziony</div>;

  return (
    <div className="instructor-profile-page">
      <div className="instructor-header">
        <div className="instructor-profile-image-container">
            {/* Wyświetlanie awatara instruktora w jego profilu */}
            <img 
                src={resolveImageUrl(instructor.avatarUrl) || '/src/AvatarInstructor/usericon_large.png'} 
                alt={`${instructor.firstName} ${instructor.lastName}`} 
                className="instructor-profile-image"
                onError={(e) => {e.target.onerror = null; e.target.src = '/src/AvatarInstructor/usericon_large.png'}}
            />
        </div>
        <div className="instructor-details">
          <h1>{instructor.firstName} {instructor.lastName}</h1>
          <p className="instructor-role">Instruktor</p>
          <div className="instructor-stats">
            <div className="stat-item">
              <span className="stat-value">{courses.length}</span>
              <span className="stat-label">Kursów</span>
            </div>
          </div>
        </div>
      </div>

      <div className="instructor-content">
        <section className="about-section">
          <h2>O Mnie</h2>
          <div className="bio-content" dangerouslySetInnerHTML={{ __html: instructor.bio }} />
        </section>

        <section className="instructor-courses-section">
          <h2>Moje Kursy</h2>
          <div className="courses-grid">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default InstructorProfilePage;