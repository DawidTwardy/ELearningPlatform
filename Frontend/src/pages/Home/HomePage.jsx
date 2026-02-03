import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../../components/Course/CourseCard';
import Leaderboard from '../../components/Gamification/Leaderboard';
import { useAuth } from '../../context/AuthContext';
import '../../styles/pages/HomePage.css';

const COURSES_PER_PAGE = 9;

const HomePage = ({ navigateToPage }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const { user } = useAuth();
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

    const handleRegisterClick = () => {
        navigate('/register');
    };

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
        <div className="home-page-container">
            {!user && (
                <>
                    <section className="hero-section">
                        <div className="hero-content">
                            <h1 className="hero-title">Rozwiń swoje umiejętności IT<br />z najlepszymi ekspertami</h1>
                            <p className="hero-subtitle">
                                Dołącz do tysięcy studentów, zdobywaj certyfikaty i awansuj w karierze. 
                                Ucz się we własnym tempie, gdziekolwiek jesteś.
                            </p>
                            <button className="hero-cta-button" onClick={handleRegisterClick}>
                                Rozpocznij za darmo
                            </button>
                        </div>
                        <div className="hero-image-container">
                            <img src="/src/login/illustration.png" alt="Nauka online" className="hero-image" />
                        </div>
                    </section>

                    <section className="features-section">
                        <h2 className="section-header-title">Dlaczego warto wybrać naszą platformę?</h2>
                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon">🚀</div>
                                <h3>Szybki rozwój</h3>
                                <p>Praktyczne projekty i zadania, które przygotują Cię do realnej pracy.</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">🏆</div>
                                <h3>Certyfikaty</h3>
                                <p>Potwierdź swoje umiejętności unikalnym certyfikatem po każdym kursie.</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">🤝</div>
                                <h3>Społeczność</h3>
                                <p>Ucz się razem z innymi, wymieniaj wiedzą i rywalizuj w rankingu.</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">∞</div>
                                <h3>Dożywotni dostęp</h3>
                                <p>Kupujesz raz, korzystasz zawsze. Wracaj do materiałów kiedy chcesz.</p>
                            </div>
                        </div>
                    </section>
                </>
            )}

            {user && (
                <section style={{ marginBottom: '40px', padding: '0 20px' }}>
                    <div 
                        style={{
                            backgroundColor: '#1E1E1E',
                            padding: '30px',
                            borderRadius: '12px',
                            border: '1px solid #28A745',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '20px'
                        }}
                    >
                        <div>
                            <h2 style={{ margin: '0 0 10px 0', color: '#fff' }}>Codzienna Dawka Wiedzy</h2>
                            <p style={{ margin: 0, color: '#aaa' }}>Sprawdź, ile pamiętasz! Rozwiąż szybki test z ukończonych kursów i zdobądź dodatkowe punkty.</p>
                        </div>
                        <button 
                            className="hero-cta-button" 
                            style={{ backgroundColor: '#28A745', fontSize: '1rem', padding: '12px 25px' }}
                            onClick={() => navigate('/daily-review')}
                        >
                            Rozpocznij Powtórkę 🔥
                        </button>
                    </div>
                </section>
            )}

            <section className="home-how-it-works">
                <div className="home-section-header">
                    <h2 className="home-section-title">Jak to działa?</h2>
                    <p className="home-section-subtitle">Twoja droga do sukcesu w 3 krokach</p>
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

            <section className="courses-section">
                <h2 className="page-title" style={{textAlign: 'center', marginBottom: '30px'}}>
                    {user ? "Polecane dla Ciebie" : "Najpopularniejsze kursy"}
                </h2>
                
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
            
            <section className="leaderboard-section">
                <h2 className="page-title" style={{textAlign: 'center', marginTop: '0'}}>Ranking Użytkowników</h2>
                <Leaderboard />
            </section>
        </div>
    );
};

export default HomePage;