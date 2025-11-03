import React, { useState, useEffect } from 'react';

// Importy stylów
import './styles/components/App.css'; 
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
    
    // NOWE STANY: Autoryzacja
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken')); // Token JWT
    const [user, setUser] = useState(null); // Obiekt { username, role, firstName, lastName }

    const [viewingCourse, setViewingCourse] = useState(null);
    const [detailsCourse, setDetailsCourse] = useState(null);
    const [editingCourse, setEditingCourse] = useState(null);
    const [ratingCourse, setRatingCourse] = useState(null);
    const [viewingCertificate, setViewingCertificate] = useState(null);
    const [isAddingCourse, setIsAddingCourse] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedInstructor, setSelectedInstructor] = useState(null);
    const [isInstructorView, setIsInstructorView] = useState(false);
    
    // LOGIKA ROLI I STATUSU ZALOGOWANIA
    const isLoggedIn = !!authToken;
    // MOCK ROLI ADMINA (W przyszłości wyciągane z tokenu/użytkownika)
    const isAdmin = isLoggedIn && user?.role === 'Admin';
    // MOCK ROLI INSTRUKTORA (W przyszłości wyciągane z tokenu/użytkownika)
    const isInstructor = isLoggedIn && user?.role === 'Instructor';

    // FUNKCJA: Ustawianie tokenu i danych użytkownika po logowaniu/rejestracji
    const handleLoginSuccess = (token, userData) => {
        localStorage.setItem('authToken', token);
        setAuthToken(token);
        setUser(userData); 
        navigateToPage(PAGE_HOME);
    };

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

    // FUNKCJA: Logout usuwa token
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('lastUsername');
        localStorage.removeItem('lastFirstName');
        localStorage.removeItem('lastName');
        setAuthToken(null);
        setUser(null);
        navigateToPage(PAGE_HOME);
    };

    // EFFECT: Symulacja pobierania danych użytkownika po odświeżeniu (gdy token istnieje)
    useEffect(() => {
        if (authToken && !user) {
            // W prawdziwej aplikacji to byłoby żądanie GET /api/user/me z nagłówkiem Authorization
            // Na potrzeby mocka: próbujemy użyć lokalnego storage (zapisane przy logowaniu)
            const storedUsername = localStorage.getItem('lastUsername');
            const storedFirstName = localStorage.getItem('lastFirstName');
            const storedLastName = localStorage.getItem('lastName');
            let userRole = 'Student';

            if (storedUsername?.toLowerCase() === 'admin') {
                 userRole = 'Admin';
            } else if (storedUsername?.toLowerCase() === 'instructor') {
                 userRole = 'Instructor';
            }
            
            if (storedUsername) {
                setUser({ 
                    username: storedUsername, 
                    role: userRole, 
                    firstName: storedFirstName || 'Anonim', 
                    lastName: storedLastName || 'Anonim' 
                });
            } else {
                 // Jeśli token jest, ale nie ma danych użytkownika, trzeba go usunąć
                 localStorage.removeItem('authToken');
                 setAuthToken(null);
            }
        }
    }, [authToken, user]);


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
                    userName={user?.firstName + ' ' + user?.lastName || "Użytkownik"}
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
                // PRZEKAZUJEMY onLoginSuccess
                return <LoginPage 
                            setCurrentPage={navigateToPage} 
                            onLoginSuccess={handleLoginSuccess}
                       />;
            case PAGE_REGISTER:
                // PRZEKAZUJEMY onRegisterSuccess
                return <RegisterPage 
                            setCurrentPage={navigateToPage} 
                            onRegisterSuccess={handleLoginSuccess}
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
                isLoggedIn={isLoggedIn} // Używa nowego logicznego stanu
                handleLogout={handleLogout} 
                isAdmin={isAdmin} // Używa nowego logicznego stanu
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