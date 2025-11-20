import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/pages/LoginReg.css';
import { PAGE_HOME, PAGE_REGISTER } from '../../App';

// Komponent ikonki oka (zdefiniowany lokalnie lub importowany)
const EyeIcon = ({ show, toggle }) => (
    <img 
        src={show ? '/src/icon/eye.png' : '/src/icon/eye-slash.png'} 
        alt={show ? 'Ukryj hasło' : 'Pokaż hasło'}
        className="password-toggle-icon"
        onClick={toggle}
    />
);

const LoginPage = ({ navigateToPage }) => { 
    // Uwaga: navigateToPage przychodzi z propsów (zgodnie z App.jsx), 
    // ale wewnątrz komponentu lepiej używać hooka useNavigate dla spójności v6.
    const navigate = useNavigate(); 
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Używamy funkcji login z AuthContext, która obsługuje axios i token
        const result = await login(email, password);

        if (result.success) {
            // Przekierowanie po udanym logowaniu
            // Używamy navigate('/') lub navigateToPage(PAGE_HOME) jeśli wolisz
            navigate('/'); 
        } else {
            setError(result.message || 'Błędny login lub hasło.');
        }
        
        setIsLoading(false);
    };

    // Helper do nawigacji do rejestracji
    const goToRegister = (e) => {
        e.preventDefault();
        navigate('/register');
    };

    return (
        /* Używamy klasy 'login-container' zamiast 'main-content' aby pasowało do LoginReg.css */
        <main className="login-container">
            <div className="login-content">
                {/* Sekcja z ilustracją - widoczna na desktopie */}
                <div className="login-illustration">
                    <div className="login-illustration-wrapper">
                        <img 
                            src="/src/login/illustration.png" 
                            alt="Login Illustration" 
                            className="login-illustration-image"
                        />
                    </div>
                </div>

                {/* Karta logowania */}
                <div className="login-form-card">
                    <h2 className="login-title">Zaloguj się</h2>
                    
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input 
                                id="email"
                                type="text" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                                placeholder="Wpisz swój email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Hasło</label>
                            <div className="input-container">
                                <input 
                                    id="password"
                                    type={passwordVisible ? 'text' : 'password'} 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    placeholder="Wpisz swoje hasło"
                                />
                                <EyeIcon 
                                    show={passwordVisible} 
                                    toggle={() => setPasswordVisible(!passwordVisible)} 
                                />
                            </div>
                            {error && <div className="form-feedback"><span className="error-message">{error}</span></div>}
                        </div>
                        
                        {/* LINK ZAPOMNIAŁEM HASŁA */}
                        <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                            <a 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}
                                style={{ color: '#ccc', fontSize: '0.9rem', textDecoration: 'none' }}
                                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                            >
                                Zapomniałeś hasła?
                            </a>
                        </div>

                        <button type="submit" className="login-button" disabled={isLoading}>
                            {isLoading ? 'Logowanie...' : 'Zaloguj się'}
                        </button>
                    </form>

                    <div className="register-option">
                        Nie masz konta?{' '}
                        <a href="#" className="register-link" onClick={goToRegister}>
                            Zarejestruj się
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default LoginPage;