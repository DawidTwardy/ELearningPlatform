import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HomePage from './pages/Home/HomePage';
import InstructorsPage from './pages/Instructor/InstructorsPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import MyLearningPage from './pages/User/MyLearningPage';
import MyCoursesPage from './pages/Instructor/MyCoursesPage'; 
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import FavoritesPage from './pages/User/FavoritesPage';
import ProfilePage from './pages/User/ProfilePage';
import CourseDetailsPage from './pages/Course/CourseDetailsPage';
import CourseView from './pages/CourseView/CourseView';
import CourseAddPage from './pages/Course/CourseAddPage';
import CourseEditPage from './pages/Course/CourseEditPage';
import InstructorProfilePage from './pages/Instructor/InstructorProfilePage';
import SearchResultsPage from './pages/Search/SearchResultsPage';
import CertificatePage from './pages/Course/CertificatePage';
import CourseAnalyticsPage from './pages/Instructor/CourseAnalyticsPage';
import { useAuth } from './context/AuthContext';
import './styles/components/App.css';

export const PAGE_HOME = 'home';
export const PAGE_INSTRUCTORS = 'instructors';
export const PAGE_ADMIN = 'admin';
export const PAGE_MY_LEARNING = 'my-learning';
export const PAGE_MY_COURSES = 'my-courses'; 
export const PAGE_LOGIN = 'login';
export const PAGE_REGISTER = 'register';
export const PAGE_FAVORITES = 'favorites';
export const PAGE_PROFILE = 'profile';

function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = React.useState('');

  const isLoggedIn = !!user;
  const isAdmin = user?.role === 'Admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigateToPage = (page) => {
    switch (page) {
      case PAGE_HOME: navigate('/'); break;
      case PAGE_INSTRUCTORS: navigate('/instructors'); break;
      case PAGE_ADMIN: navigate('/admin'); break;
      case PAGE_MY_LEARNING: navigate('/my-learning'); break;
      case PAGE_MY_COURSES: navigate('/my-courses'); break;
      case PAGE_LOGIN: navigate('/login'); break;
      case PAGE_REGISTER: navigate('/register'); break;
      case PAGE_FAVORITES: navigate('/favorites'); break;
      case PAGE_PROFILE: navigate('/profile'); break;
      default: navigate('/');
    }
  };

  const handleSearchSubmit = () => {
      if (searchQuery.trim()) {
          navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
  };

  let currentPage = PAGE_HOME;
  const path = location.pathname;

  if (path.startsWith('/instructors')) currentPage = PAGE_INSTRUCTORS;
  else if (path.startsWith('/admin')) currentPage = PAGE_ADMIN;
  else if (path.startsWith('/my-learning')) currentPage = PAGE_MY_LEARNING;
  else if (path.startsWith('/my-courses')) currentPage = PAGE_MY_COURSES;
  else if (path.startsWith('/login')) currentPage = PAGE_LOGIN;
  else if (path.startsWith('/register')) currentPage = PAGE_REGISTER;
  else if (path.startsWith('/favorites')) currentPage = PAGE_FAVORITES;
  else if (path.startsWith('/profile')) currentPage = PAGE_PROFILE;

  // Logika: te strony mają być na PEŁNĄ SZEROKOŚĆ
  const isFullWidthPage = path.startsWith('/login') || 
                          path.startsWith('/register') || 
                          path.startsWith('/courses/') || 
                          path.startsWith('/course-view/');

  const ProtectedRoute = ({ children, roles }) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }
    if (roles && !roles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
    return children;
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
      
      {/* Dodajemy klasę full-width-page jeśli jesteśmy na odpowiedniej podstronie */}
      <main className={`main-content ${isFullWidthPage ? 'full-width-page' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage navigateToPage={navigateToPage} />} />
          <Route path="/instructors" element={<InstructorsPage />} />
          <Route path="/instructor/:id" element={<InstructorProfilePage />} />
          <Route path="/courses/:id" element={<CourseDetailsPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          
          <Route path="/login" element={<LoginPage navigateToPage={navigateToPage} />} />
          <Route 
            path="/register" 
            element={
              <RegisterPage 
                navigateToPage={navigateToPage}
                onRegisterSuccess={() => navigateToPage(PAGE_LOGIN)} 
              />
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute roles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-learning" 
            element={
              <ProtectedRoute>
                <MyLearningPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/my-courses" 
            element={
              <ProtectedRoute>
                <MyCoursesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/add-course" 
            element={
              <ProtectedRoute>
                <CourseAddPage />
              </ProtectedRoute>
            } 
          />
          <Route 
              path="/edit-course/:courseId" 
              element={
                  <ProtectedRoute>
                      <CourseEditPageWrapper />
                  </ProtectedRoute>
              } 
          />
          <Route 
              path="/instructor/analytics/:courseId" 
              element={
                  <ProtectedRoute>
                      <CourseAnalyticsPage />
                  </ProtectedRoute>
              } 
          />

          <Route 
            path="/favorites" 
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
              path="/course-view/:courseId" 
              element={
                  <ProtectedRoute>
                      <CourseView />
                  </ProtectedRoute>
              } 
          />

          <Route 
              path="/certificate/:courseId" 
              element={
                  <ProtectedRoute>
                      <CertificatePage />
                  </ProtectedRoute>
              } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

const CourseEditPageWrapper = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    
    return (
        <CourseEditPage 
            course={{ id: parseInt(courseId) }} 
            onBack={() => navigate('/my-courses')} 
        />
    );
};

export default App;