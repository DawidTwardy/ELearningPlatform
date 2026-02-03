import React, { useState, useEffect } from 'react';
import NotificationsDropdown from '../Notifications/NotificationsDropdown';
import { fetchNotifications, fetchMyStats, resolveImageUrl, api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/components/Gamification.css'; 

const PAGE_HOME = 'home';
const PAGE_INSTRUCTORS = 'instructors';
const PAGE_ADMIN = 'admin';
const PAGE_MY_LEARNING = 'my-learning';
const PAGE_MY_COURSES = 'my-courses'; 
const PAGE_LOGIN = 'login';
const PAGE_REGISTER = 'register';
const PAGE_FAVORITES = 'favorites';
const PAGE_PROFILE = 'profile';

const LoggedInMenu = ({ handleLogout, navigateToPage }) => ( 
    <div className="profile-menu">
        <button className="menu-item" onClick={() => navigateToPage(PAGE_PROFILE)}>
            Zmień Dane
        </button>
        <div className="menu-divider"></div>
        <button className="menu-item logout" onClick={handleLogout}>Wyloguj się</button>
    </div>
);

const Header = ({ 
    currentPage, 
    isLoggedIn, 
    handleLogout, 
    isAdmin, 
    navigateToPage, 
    searchQuery, 
    setSearchQuery, 
    handleSearchSubmit 
}) => {
    const { user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const [streak, setStreak] = useState(0);
    const [avatarUrl, setAvatarUrl] = useState(null);

    useEffect(() => {
        if (isLoggedIn && user) {
            setAvatarUrl(user.avatarUrl);
            fetchFreshData();
        } else {
            setAvatarUrl(null);
        }
    }, [isLoggedIn, user?.id]);

    const fetchFreshData = async () => {
        try {
            const [profileRes, statsRes, notificationsRes] = await Promise.all([
                api.get('/profile'),
                fetchMyStats(),
                fetchNotifications()
            ]);

            if (profileRes.data && profileRes.data.avatarUrl) {
                setAvatarUrl(profileRes.data.avatarUrl);
            }

            if (statsRes) {
                setStreak(statsRes.currentStreak || 0);
            }

            if (notificationsRes) {
                const unread = notificationsRes.filter(n => !n.isRead).length > 0;
                setHasUnread(unread);
            }
        } catch (error) {
            console.error("Błąd odświeżania danych w nagłówku", error);
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(prev => !prev);
        setIsNotificationsOpen(false);
    };
    
    const toggleNotifications = () => {
        setIsNotificationsOpen(prev => !prev);
        setIsMenuOpen(false);
        if (!isNotificationsOpen) {
            fetchFreshData();
        }
    };

    const searchPlaceholder = currentPage === PAGE_INSTRUCTORS ? "Wyszukaj Twórcę" : "Wyszukaj Kurs";

    const handleNavClick = (page) => (e) => {
        e.preventDefault();
        navigateToPage(page);
    };

    return (
        <header className="header">
            <div className="header-left">
                <div className="logo">
                    <img 
                        src="/src/logo.png" 
                        alt="e-LEARNING Logo" 
                        className="logo-image"
                        onClick={() => navigateToPage(PAGE_HOME)}
                        style={{ cursor: 'pointer' }} 
                    />
                </div>
                <div className="search-bar">
                    <img 
                        src="/src/icon/lupa.png" 
                        alt="Wyszukaj" 
                        className="search-icon-image" 
                    />
                    <input 
                        type="text" 
                        placeholder={searchPlaceholder} 
                        className="search-input" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearchSubmit();
                            }
                        }}
                    />
                </div>
            </div>
            
            <div className="header-right">
                <nav className="nav-links">
                    <a 
                        href="#" 
                        onClick={handleNavClick(PAGE_INSTRUCTORS)}
                        className={currentPage === PAGE_INSTRUCTORS ? 'active' : ''}
                    >
                        Instruktorzy
                    </a>

                    {isLoggedIn && (
                        <>
                            {isAdmin && (
                                <a 
                                    href="#" 
                                    onClick={handleNavClick(PAGE_ADMIN)}
                                    className={currentPage === PAGE_ADMIN ? 'active' : ''}
                                >
                                    Admin
                                </a>
                            )}
                            <a 
                                href="#" 
                                onClick={handleNavClick(PAGE_MY_LEARNING)}
                                className={currentPage === PAGE_MY_LEARNING ? 'active' : ''}
                            >
                                Moja Nauka
                            </a>
                            <a 
                                href="#" 
                                onClick={handleNavClick(PAGE_MY_COURSES)}
                                className={currentPage === PAGE_MY_COURSES ? 'active' : ''}
                            >
                                Moje Kursy
                            </a>
                        </>
                    )}
                    
                    {!isLoggedIn && (
                        <>
                            <a 
                                href="#login" 
                                className="nav-button" 
                                onClick={handleNavClick(PAGE_LOGIN)}
                            >
                                Zaloguj się
                            </a>
                            <a 
                                href="#register" 
                                className="nav-button register-button"
                                onClick={handleNavClick(PAGE_REGISTER)}
                            >
                                Zarejestruj się
                            </a>
                        </>
                    )}
                </nav>

                <div className="user-actions">
                    {isLoggedIn && user && (
                        <>
                            <div className="streak-display" title="Dni nauki z rzędu">
                                <span className="fire-icon">🔥</span>
                                <span>{streak}</span>
                            </div>

                            <div className="notification-icon-wrapper">
                                <img 
                                    src="/src/icon/notification.png" 
                                    alt="Powiadomienia" 
                                    className="action-icon-image notification-icon-image"
                                    onClick={toggleNotifications}
                                />
                                {hasUnread && <div className="notification-dot"></div>}
                            </div>
                            
                            <img 
                                src={resolveImageUrl(avatarUrl) || "/src/icon/usericon.png"} 
                                alt="Profil" 
                                className="action-icon-image profile-icon-image" 
                                onClick={toggleMenu} 
                                onError={(e) => {e.target.onerror = null; e.target.src = "/src/icon/usericon.png"}}
                                style={{ borderRadius: '50%', objectFit: 'cover' }}
                            />
                        </>
                    )}
                    {isMenuOpen && isLoggedIn && <LoggedInMenu handleLogout={handleLogout} navigateToPage={navigateToPage} />}
                    {isNotificationsOpen && isLoggedIn && (
                        <NotificationsDropdown 
                            onClose={() => {
                                setIsNotificationsOpen(false);
                                fetchFreshData(); 
                            }} 
                        />
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;