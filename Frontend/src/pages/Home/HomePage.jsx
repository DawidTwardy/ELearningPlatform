import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../../components/Course/CourseCard';
import '../../styles/pages/InstructorDashboard.css'; // Używamy stylów ogólnych lub stwórz HomePage.css

const HomePage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Pobieramy publiczne kursy
                const response = await fetch('http://localhost:7115/api/Courses');
                if (!response.ok) {
                    throw new Error('Błąd pobierania kursów');
                }
                const data = await response.json();
                setCourses(data);
            } catch (err) {
                console.error(err);
                setError('Nie udało się pobrać kursów.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    // Ta funkcja naprawia błąd "onShowDetails is not a function"
    const handleShowDetails = (courseId) => {
        navigate(`/courses/${courseId}`);
    };

    if (loading) return <div className="loading-container">Ładowanie kursów...</div>;
    if (error) return <div className="error-container">{error}</div>;

    return (
        <main className="main-content">
            
            <div className="courses-list">
                {courses.length === 0 ? (
                    <p>Brak dostępnych kursów.</p>
                ) : (
                    courses.map(course => (
                        <CourseCard 
                            key={course.id} 
                            course={course} 
                            onShowDetails={handleShowDetails} // Przekazujemy funkcję tutaj
                        />
                    ))
                )}
            </div>
        </main>
    );
};

export default HomePage;