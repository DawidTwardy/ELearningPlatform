import React, { useState, useEffect } from 'react';
import NotificationsDropdown from '../Notifications/NotificationsDropdown';
import { fetchNotifications, fetchMyStats } from '../../services/api';
import '../../styles/components/Gamification.css'; 
import { 
  PAGE_HOME, 
  PAGE_INSTRUCTORS, 
  PAGE_ADMIN, 
  PAGE_MY_LEARNING, 
  PAGE_MY_COURSES, 
  PAGE_LOGIN, 
  PAGE_REGISTER, 
  PAGE_FAVORITES,
  PAGE_PROFILE
} from '../../App.jsx'; 

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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        if (isLoggedIn) {
            checkNotifications();
            checkStats();
        }
    }, [isLoggedIn, isNotificationsOpen]);

    const checkNotifications = async () => {
        try {
            const data = await fetchNotifications();
            const unread = data.filter(n => !n.isRead).length > 0;
            setHasUnread(unread);
        } catch (error) {
            console.error("Błąd sprawdzania powiadomień", error);
        }
    };

    const checkStats = async () => {
        try {
            const data = await fetchMyStats();
            setStreak(data.currentStreak);
        } catch(error) {
            console.error("Błąd statystyk", error);
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
            checkNotifications();
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
                    {isLoggedIn && (
                        <>
                            <div className="streak-display" title="Dni nauki z rzędu">
                                <span className="fire-icon">🔥</span>
                                <span>{streak}</span>
                            </div>

                            <img 
                                src="/src/icon/hearticon.png" 
                                alt="Ulubione" 
                                className="action-icon-image favorite-icon-image" 
                                onClick={() => navigateToPage(PAGE_FAVORITES)} 
                                style={{ cursor: 'pointer' }}
                            /> 
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
                                src="/src/icon/usericon.png" 
                                alt="Profil" 
                                className="action-icon-image profile-icon-image" 
                                onClick={toggleMenu} 
                            />
                        </>
                    )}
                    {isMenuOpen && isLoggedIn && <LoggedInMenu handleLogout={handleLogout} navigateToPage={navigateToPage} />}
                    {isNotificationsOpen && isLoggedIn && (
                        <NotificationsDropdown 
                            onClose={() => {
                                setIsNotificationsOpen(false);
                                checkNotifications(); 
                            }} 
                        />
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;