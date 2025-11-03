import React, { useState } from 'react';

// Importy stylów
import './styles/components/App.css'; // Zmieniona nazwa z App.css
import './styles/components/Actions.css';

// Importy komponentów
import Header from './components/Layout/Header.jsx';
import Footer from './components/Layout/Footer.jsx';

// Importy stron (Pages)
import HomePage from './pages/Home/HomePage.jsx';
import InstructorsPage from './pages/Instructor/InstructorsPage.jsx'; 
import InstructorProfilePage from './pages/Instructor/InstructorProfilePage.jsx';
import FavoritesPage from './pages/User/FavoritesPage.jsx'; 
import MyLearningPage from './pages/User/MyLearningPage.jsx';
import MyCoursesPage from './pages/Instructor/MyCoursesPage.jsx'; 
import ProfilePage from './pages/User/ProfilePage.jsx';
import SearchResultsPage from './pages/Search/SearchResultsPage.jsx';
import LoginPage from './pages/Auth/LoginPage.jsx'; 
import RegisterPage from './pages/Auth/RegisterPage.jsx';
import CourseView from './pages/CourseView/CourseView.jsx';
import CourseDetailsPage from './pages/Course/CourseDetailsPage.jsx';
import CourseEditPage from './pages/Course/CourseEditPage.jsx';
import CourseAddPage from './pages/Course/CourseAddPage.jsx';
import CourseRatingForm from './pages/Course/CourseRatingForm.jsx';
import CertificatePage from './pages/Course/CertificatePage.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';

// Importy stylów stron (aby Vite je załadował)
import './styles/pages/AdminDashboard.css';
import './styles/pages/CertificatePage.css';
import './styles/pages/CourseDetailsPage.css';
import './styles/pages/CourseEditPage.css';
import './styles/pages/CourseRatingForm.css';
import './styles/pages/CourseView.css';
import './styles/pages/DiscussionThread.css';
import './styles/pages/Favorites.css';
import './styles/pages/InstructorDashboard.css';
import './styles/pages/InstructorProfilePage.css';
import './styles/pages/InstructorsPage.css';
import './styles/pages/LoginReg.css';
import './styles/pages/MyLearningPage.css';
import './styles/pages/ProfilePage.css';
import './styles/pages/QuizView.css';
import './styles/pages/SearchResultsPage.css';
import './styles/components/NotificationsDropdown.css';


// Eksportujemy stałe, aby Header i inne pliki mogły z nich korzystać
export const PAGE_HOME = 'home';
export const PAGE_INSTRUCTORS = 'instruktors';
export const PAGE_INSTRUCTOR_PROFILE = 'instructor_profile';
export const PAGE_FAVORITES = 'favorites'; 
export const PAGE_MY_COURSES = 'my_courses';
export const PAGE_MY_LEARNING = 'my_learning';
export const PAGE_PROFILE = 'profile';
export const PAGE_SEARCH_RESULTS = 'search_results';
export const PAGE_LOGIN = 'login'; 
export const PAGE_REGISTER = 'register';
export const PAGE_ADMIN = 'admin';

// Dane kursów potrzebne do wyszukiwania i profili instruktorów
const coursesData = [
    { id: 1, title: "Kurs Nauki SQL", instructor: "Michał Nowak", rating: 5, imageSrc: "/src/course/placeholder_sql.png", description: "Poznaj podstawy i zaawansowane techniki SQL. Ten kurs nauczy Cię, jak efektywnie zarządzać bazami danych i pisać złożone zapytania."},
    { id: 2, title: "Kurs Pythona", instructor: "Jan Kowalski", rating: 4.5, imageSrc: "/src/course/placeholder_python.png", description: "Zacznij swoją przygodę z programowaniem w Pythonie. Kurs obejmuje wszystko od podstawowej składni po tworzenie aplikacji webowych."},
    { id: 3, title: "Kurs AI", instructor: "Michał Nowak", rating: 4, imageSrc: "/src/course/placeholder_ai.png", description: "Wprowadzenie do świata Sztucznej Inteligencji. Dowiedz się, czym są sieci neuronowe, uczenie maszynowe i jak są wykorzystywane w praktyce."},
    { id: 4, title: "Kurs .Net Core", instructor: "Michał Nowak", rating: 5, imageSrc: "/src/course/placeholder_dotnet.png", description: "Buduj nowoczesne, wieloplatformowe aplikacje z .NET Core. Kurs skupia się na tworzeniu wydajnych API REST oraz aplikacji webowych."},
];


const App = () => {
    const [currentPage, setCurrentPage] = useState(PAGE_HOME); 
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const [viewingCourse, setViewingCourse] = useState(null);
    const [detailsCourse, setDetailsCourse] = useState(null);
    const [editingCourse, setEditingCourse] = useState(null);
    const [ratingCourse, setRatingCourse] = useState(null);
    const [viewingCertificate, setViewingCertificate] = useState(null);
    const [isAddingCourse, setIsAddingCourse] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedInstructor, setSelectedInstructor] = useState(null);
    const [isInstructorView, setIsInstructorView] = useState(false);

    const navigateToPage = (page) => {
        setViewingCourse(null);
        setDetailsCourse(null);
        setEditingCourse(null);
        setIsAddingCourse(false);
        setSearchQuery('');
        setSelectedInstructor(null);
        setRatingCourse(null);
        setIsInstructorView(false);
        setViewingCertificate(null);
        
        setCurrentPage(page);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setIsAdmin(false);
        navigateToPage(PAGE_HOME);
    };

    const handleStartEdit = (course) => {
        setEditingCourse(course);
    };
    
    const handleStartAddCourse = () => {
        setIsAddingCourse(true);
    };

    const handleBackFromViews = () => {
        setViewingCourse(null);
        setDetailsCourse(null);
        setEditingCourse(null);
        setIsAddingCourse(false);
        setSelectedInstructor(null);
        setRatingCourse(null);
        setIsInstructorView(false);
        setViewingCertificate(null);

        if (isAdmin && (currentPage === PAGE_ADMIN || viewingCourse)) {
            setCurrentPage(PAGE_ADMIN);
        } else if (currentPage === PAGE_PROFILE) {
            navigateToPage(PAGE_HOME);
        } else {
             navigateToPage(PAGE_HOME); // Domyślny powrót
        }
    };

    const handleShowDetails = (course) => {
        setDetailsCourse(course);
    };
    
    const handleShowInstructorProfile = (instructor) => {
        setSelectedInstructor(instructor);
        setCurrentPage(PAGE_INSTRUCTOR_PROFILE);
    };

    const handleEnroll = (course) => {
        console.log(`Zapisano na kurs: ${course.title}`);
        setDetailsCourse(null);
        setIsInstructorView(false);
        setViewingCourse(course);
    };
    
    const handleCourseCreate = (newCourse) => {
        alert(`Pomyślnie stworzono kurs: ${newCourse.title}`);
        handleBackFromViews();
    };

    const handleSearchSubmit = () => {
        if (searchQuery.trim() === '') return;
        setViewingCourse(null);
        setDetailsCourse(null);
        setEditingCourse(null);
        setIsAddingCourse(false);
        setSelectedInstructor(null);
        setRatingCourse(null);
        setIsInstructorView(false);
        setViewingCertificate(null);
        setCurrentPage(PAGE_SEARCH_RESULTS);
    };
    
    const handleStartRating = (course) => {
        setRatingCourse(course);
    };
    
    const handleSubmitRating = (courseTitle, rating) => {
        alert(`Dziękujemy za ocenę ${rating} gwiazdek dla kursu: ${courseTitle}!`);
        handleBackFromViews();
        navigateToPage(PAGE_MY_LEARNING);
    };

    const handleViewCourseAsStudent = (course) => {
        setIsInstructorView(false);
        setViewingCourse(course);
    };

    const handleViewCourseAsInstructor = (course) => {
        setIsInstructorView(true);
        setViewingCourse(course);
    };

    const handleAdminViewCourse = (course) => {
      setIsInstructorView(true); 
      setViewingCourse(course);
    };
    
    const handleShowCertificate = (course) => {
        setViewingCertificate(course);
    };

    const renderPageContent = () => {
        if (viewingCertificate) {
            return (
                <CertificatePage
                    course={viewingCertificate}
                    userName="Jan Kowalski"
                    onBack={handleBackFromViews}
                />
            );
        }
        
        if (ratingCourse) {
            return (
                <CourseRatingForm 
                    course={ratingCourse}
                    onBack={handleBackFromViews}
                    onSubmitRating={handleSubmitRating}
                />
            );
        }
        
        if (isAddingCourse) {
            return (
                <CourseAddPage 
                    onBack={handleBackFromViews}
                    onCourseCreate={handleCourseCreate}
                />
            );
        }

        if (editingCourse) {
            return (
                <CourseEditPage 
                    course={editingCourse} 
                    onBack={handleBackFromViews} 
                />
            );
        }

        if (detailsCourse) {
            return (
                <CourseDetailsPage
                    course={detailsCourse}
                    onBack={handleBackFromViews}
                    onEnroll={handleEnroll}
                />
            );
        }

        if (viewingCourse) {
            return (
                <CourseView 
                    course={viewingCourse} 
                    onBack={handleBackFromViews} 
                    onStartRating={handleStartRating}
                    isInstructorView={isInstructorView}
                />
            );
        }
        
        if (selectedInstructor) {
            const instructorCourses = coursesData.filter(
                course => course.instructor === selectedInstructor.name
            );
            return (
                <InstructorProfilePage
                    instructor={selectedInstructor}
                    courses={instructorCourses}
                    onCourseClick={handleShowDetails}
                    onBack={() => navigateToPage(PAGE_INSTRUCTORS)}
                />
            );
        }

        switch(currentPage) {
            case PAGE_LOGIN:
                return <LoginPage 
                            setCurrentPage={navigateToPage} 
                            setIsLoggedIn={setIsLoggedIn} 
                            setIsAdmin={setIsAdmin} 
                       />;
            case PAGE_REGISTER:
                return <RegisterPage 
                            setCurrentPage={navigateToPage} 
                            setIsLoggedIn={setIsLoggedIn} 
                            setIsAdmin={setIsAdmin}
                       />;
            case PAGE_INSTRUCTORS:
                return <InstructorsPage onInstructorClick={handleShowInstructorProfile} />;
            case PAGE_FAVORITES:
                return <FavoritesPage onNavigateToHome={() => navigateToPage(PAGE_HOME)} />;
            case PAGE_MY_LEARNING:
                return (
                    <MyLearningPage
                        onCourseClick={handleViewCourseAsStudent}
                        onNavigateToHome={() => navigateToPage(PAGE_HOME)}
                        onShowCertificate={handleShowCertificate}
                    />
                );
            case PAGE_MY_COURSES:
                return (
                    <MyCoursesPage 
                        setSelectedCourse={handleViewCourseAsInstructor}
                        onNavigateToHome={() => navigateToPage(PAGE_HOME)} 
                        onStartEdit={handleStartEdit}
                        onStartAddCourse={handleStartAddCourse}
                    />
                );
            case PAGE_PROFILE:
                return (
                    <ProfilePage 
                        onBack={() => navigateToPage(PAGE_HOME)} 
                    />
                );
            case PAGE_SEARCH_RESULTS:
                return (
                    <SearchResultsPage
                      allCourses={coursesData}
                      query={searchQuery}
                      onCourseClick={handleShowDetails}
                    />
                );
            
            case PAGE_ADMIN:
                return <AdminDashboard onAdminViewCourse={handleAdminViewCourse} />;

            case PAGE_HOME:
            default:
                return (
                    <HomePage onShowDetails={handleShowDetails} />
                );
        }
    };

    return (
        <div className="app">
            <Header 
                currentPage={currentPage} 
                isLoggedIn={isLoggedIn} 
                handleLogout={handleLogout} 
                isAdmin={isAdmin}
                navigateToPage={navigateToPage}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearchSubmit={handleSearchSubmit}
            />
            
            {renderPageContent()}

            <Footer />
        </div>
    );
};

export default App;