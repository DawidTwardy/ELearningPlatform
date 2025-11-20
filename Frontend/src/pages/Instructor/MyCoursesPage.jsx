import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchInstructorCourses, deleteCourse } from '../../services/api';
import CourseCard from '../../components/Course/CourseCard'; // Przywrócono import CourseCard
import '../../styles/components/MyCoursesPage.css';

const MyCoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const getCourses = async () => {
            try {
                const data = await fetchInstructorCourses();
                setCourses(data);
            } catch (err) {
                setError("Nie udało się załadować Twoich kursów. Spróbuj ponownie później.");
                console.error("Error fetching instructor courses:", err);
            } finally {
                setLoading(false);
            }
        };

        getCourses();
    }, []);

    const handleDelete = async (courseId) => {
        if (window.confirm('Czy na pewno chcesz usunąć ten kurs? Tej operacji nie można cofnąć.')) {
            try {
                await deleteCourse(courseId);
                setCourses(courses.filter(course => course.id !== courseId));
            } catch (err) {
                alert("Nie udało się usunąć kursu. Spróbuj ponownie.");
                console.error("Error deleting course:", err);
            }
        }
    };

    if (loading) {
        return <div className="my-courses-container">Ładowanie kursów...</div>;
    }

    if (error) {
        return <div className="my-courses-container error-message">{error}</div>;
    }

    return (
        <div className="my-courses-container">
            <h1 className="my-courses-title">Moje Kursy</h1>
            
            <button className="add-new-course-button" onClick={() => navigate('/add-course')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Dodaj nowy kurs</span>
            </button>

            {courses.length === 0 ? (
                <p className="no-courses-message">Nie masz jeszcze żadnych kursów. Dodaj swój pierwszy kurs!</p>
            ) : (
                <div className="courses-grid">
                    {courses.map(course => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            showInstructor={false}
                            showFavoriteButton={false}
                            onClick={() => navigate(`/edit-course/${course.id}`)}
                        >
                            {/* Przyciski są przekazywane do środka karty */}
                            <div className="course-card-actions">
                                <button 
                                    className="action-button edit-button" 
                                    onClick={(e) => { e.stopPropagation(); navigate(`/edit-course/${course.id}`); }}
                                >
                                    Edytuj
                                </button>
                                <button 
                                    className="action-button stats-button" 
                                    onClick={(e) => { e.stopPropagation(); navigate(`/instructor/analytics/${course.id}`); }}
                                >
                                    Statystyki
                                </button>
                                <button 
                                    className="action-button delete-button" 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(course.id); }}
                                >
                                    Usuń
                                </button>
                            </div>
                        </CourseCard>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCoursesPage;