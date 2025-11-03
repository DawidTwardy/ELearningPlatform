import React, { useState, useEffect } from 'react';
import { CourseCard } from '../../components/Course/CourseCard';
import { StarRating } from '../../components/Course/StarRating';

const HomePage = ({ onShowDetails }) => {
    
    const [courses, setCourses] = useState([]);
    const [dummyFavorites, setDummyFavorites] = useState({});
    
    const toggleDummyFavorite = (title) => {
        setDummyFavorites(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    useEffect(() => {
        // ZMIENIONY: Endpoint API, używamy HTTPS
        const apiUrl = 'https://localhost:7115/api/Courses';

        fetch(apiUrl)
            .then(response => {
                 if (!response.ok) {
                    // Wyrzuć błąd, jeśli status nie jest 2xx
                    throw new Error(`HTTP error! status: ${response.status}`);
                 }
                 return response.json();
            })
            .then(data => {
                setCourses(data); // Ustawia kursy pobrane z bazy
            })
            .catch(error => {
                console.error("Błąd podczas pobierania kursów z API:", error);
                // W środowisku produkcyjnym można użyć lokalnych mocków jako fallback
                // alert("Nie udało się załadować kursów z API. Sprawdź, czy backend działa.");
            });
            
    }, []); // Pusta tablica oznacza, że efekt uruchomi się tylko raz po zamontowaniu

    return (
        <main className="main-content">
            <h2 className="page-title">Dostępne Kursy</h2>
            <div className="courses-list">
                {courses.map((course) => (
                    <CourseCard 
                        key={course.id} 
                        course={course} 
                        onClick={() => onShowDetails(course)}
                        isFavorite={!!dummyFavorites[course.title]}
                        onFavoriteToggle={() => toggleDummyFavorite(course.title)}
                        showInstructor={true}
                        showFavoriteButton={true}
                    >
                        <StarRating rating={course.rating} /> 
                    </CourseCard>
                ))}
            </div>
        </main>
    );
};

export default HomePage;