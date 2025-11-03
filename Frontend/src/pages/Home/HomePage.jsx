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
        const apiUrl = 'https://localhost:7115/api/courses';

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                setCourses(data);
            })
            .catch(error => {
                console.error("Błąd podczas pobierania kursów:", error);
            });
            
    }, []);

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