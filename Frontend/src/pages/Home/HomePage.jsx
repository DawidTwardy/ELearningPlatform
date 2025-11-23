import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../../components/Course/CourseCard';
import Leaderboard from '../../components/Gamification/Leaderboard';
// WAŻNE: Importujemy nowy plik stylów
import '../../styles/pages/HomePage.css'; 

const COURSES_PER_PAGE = 9;

const HomePage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Stan paginacji
    const [currentPage, setCurrentPage] = useState(1);

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

    // Obliczenia paginacji
    const indexOfLastCourse = currentPage * COURSES_PER_PAGE;
    const indexOfFirstCourse = indexOfLastCourse - COURSES_PER_PAGE;
    const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);
    const totalPages = Math.ceil(courses.length / COURSES_PER_PAGE);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    if (loading) return <div className="loading-container">Ładowanie kursów...</div>;
    if (error) return <div className="error-container">{error}</div>;

    return (
        <main className="main-content">
            {/* 1. Sekcja "Jak to działa" */}
            <section className="home-how-it-works">
                <div className="home-section-header">
                    <h2 className="home-section-title">Rozpocznij naukę w 3 prostych krokach</h2>
                    <p className="home-section-subtitle">Dołącz do naszej społeczności i rozwijaj swoje umiejętności</p>
                </div>
                
                <div className="home-steps-container">
                    <div className="home-step-card">
                        <div className="home-step-number-bg">1</div>
                        <div className="home-step-icon">🔍</div>
                        <h3>Wybierz kurs</h3>
                        <p>Przeglądaj setki dostępnych szkoleń z różnych dziedzin i znajdź to, które idealnie odpowiada Twoim potrzebom.</p>
                    </div>

                    <div className="home-step-card">
                        <div className="home-step-number-bg">2</div>
                        <div className="home-step-icon">💻</div>
                        <h3>Ucz się online</h3>
                        <p>Korzystaj z materiałów wideo, quizów i zadań praktycznych na dowolnym urządzeniu, we własnym tempie.</p>
                    </div>

                    <div className="home-step-card">
                        <div className="home-step-number-bg">3</div>
                        <div className="home-step-icon">🎓</div>
                        <h3>Odbierz certyfikat</h3>
                        <p>Po ukończeniu kursu i zdaniu egzaminu końcowego otrzymasz imienny certyfikat potwierdzający kompetencje.</p>
                    </div>
                </div>
            </section>

            {/* 2. Sekcja Kursów (na górze) */}
            <section className="courses-section">
                <h2 className="page-title" style={{textAlign: 'center', marginBottom: '30px'}}>Najpopularniejsze kursy</h2>
                
                <div className="courses-list">
                    {courses.length === 0 ? (
                        <p style={{textAlign: 'center', color: '#aaa', width: '100%'}}>Brak dostępnych kursów.</p>
                    ) : (
                        currentCourses.map(course => (
                            <CourseCard 
                                key={course.id} 
                                course={course} 
                                onClick={() => handleShowDetails(course.id)} 
                            />
                        ))
                    )}
                </div>

                {/* Paginacja */}
                {courses.length > COURSES_PER_PAGE && (
                    <div className="pagination-container">
                        <button 
                            className="pagination-btn" 
                            onClick={handlePrevPage} 
                            disabled={currentPage === 1}
                        >
                            &lt; Poprzednia
                        </button>
                        <span className="pagination-info">
                            Strona {currentPage} z {totalPages}
                        </span>
                        <button 
                            className="pagination-btn" 
                            onClick={handleNextPage} 
                            disabled={currentPage === totalPages}
                        >
                            Następna &gt;
                        </button>
                    </div>
                )}
            </section>
            
            {/* 3. Sekcja Rankingu (na dole, pod kursami) */}
            <section className="leaderboard-section">
                <h2 className="page-title" style={{textAlign: 'center', marginTop: '0'}}>Ranking Użytkowników</h2>
                <Leaderboard />
            </section>
        </main>
    );
};

export default HomePage;