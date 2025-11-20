import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../../components/Course/CourseCard';
import '../../styles/pages/InstructorDashboard.css';

const HomePage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
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

    const handleShowDetails = (courseId) => {
        navigate(`/courses/${courseId}`);
    };

    if (loading) return <div className="loading-container">Ładowanie kursów...</div>;
    if (error) return <div className="error-container">{error}</div>;

    return (
        <main className="main-content">
            {/* Sekcja "Jak to działa" ze zaktualizowanymi klasami (prefix home-) */}
            <section className="home-how-it-works">
                <div className="home-section-header">
                    <h2 className="home-section-title">Rozpocznij naukę w 3 prostych krokach</h2>
                    <p className="home-section-subtitle">Dołącz do naszej społeczności i rozwijaj swoje umiejętności</p>
                </div>
                
                <div className="home-steps-container">
                    <div className="home-step-card">
                        <div className="home-step-number-bg">1</div>
                        <div className="home-step-icon">
                            <i className="fa-solid fa-magnifying-glass">🔍</i>
                        </div>
                        <h3>Wybierz kurs</h3>
                        <p>Przeglądaj setki dostępnych szkoleń z różnych dziedzin i znajdź to, które idealnie odpowiada Twoim potrzebom i celom zawodowym.</p>
                    </div>

                    <div className="home-step-card">
                        <div className="home-step-number-bg">2</div>
                        <div className="home-step-icon">
                            <i className="fa-solid fa-laptop-code">💻</i>
                        </div>
                        <h3>Ucz się online</h3>
                        <p>Korzystaj z materiałów wideo, quizów i zadań praktycznych na dowolnym urządzeniu, we własnym tempie i o dowolnej porze.</p>
                    </div>

                    <div className="home-step-card">
                        <div className="home-step-number-bg">3</div>
                        <div className="home-step-icon">
                            <i className="fa-solid fa-certificate">🎓</i>
                        </div>
                        <h3>Odbierz certyfikat</h3>
                        <p>Po ukończeniu kursu i zdaniu egzaminu końcowego otrzymasz imienny certyfikat potwierdzający Twoje nowe kompetencje.</p>
                    </div>
                </div>
            </section>

            <h2 className="page-title" style={{ marginTop: '20px' }}>Najpopularniejsze kursy</h2>
            
            <div className="courses-list">
                {courses.length === 0 ? (
                    <p>Brak dostępnych kursów.</p>
                ) : (
                    courses.map(course => (
                        <CourseCard 
                            key={course.id} 
                            course={course} 
                            onClick={() => handleShowDetails(course.id)} 
                        />
                    ))
                )}
            </div>
        </main>
    );
};

export default HomePage;