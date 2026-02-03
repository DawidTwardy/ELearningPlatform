import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/pages/LoginReg.css';
import { useAuth } from '../../context/AuthContext';

const EyeIcon = ({ show, toggle }) => (
    <img 
        src={show ? '/src/icon/eye.png' : '/src/icon/eye-slash.png'} 
        alt={show ? 'Ukryj hasło' : 'Pokaż hasło'}
        className="password-toggle-icon"
        onClick={toggle}
    />
);

const RegisterPage = ({ setCurrentPage, onRegisterSuccess }) => {
    const navigate = useNavigate();
    const { register } = useAuth();
    
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(''); 
        setIsLoading(true);
        
        const registerData = {
            username: username,
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName
        };

        const result = await register(registerData);

        if (result.success) {
            if(onRegisterSuccess) onRegisterSuccess();
        } else {
            setError(result.message || 'Wystąpił błąd podczas rejestracji.');
        }
        setIsLoading(false);
    };

    const handleLoginClick = (e) => {
        e.preventDefault();
        if (setCurrentPage) {
            setCurrentPage('login');
        } else {
            navigate('/login');
        }
    };
    
    return (
        <main className="login-container">
            <div className="login-content">
                <div className="login-illustration">
                    <div className="login-illustration-wrapper">
                        <img 
                            src="/src/register/illustration.png" 
                            alt="Rejestracja konta"
                            className="login-illustration-image"
                        />
                    </div>
                </div>

                <div className="login-form-card">
                    <h2 className="login-title">Zarejestruj się</h2>
                    
                    {error && (
                        <div className="form-error-alert">
                            {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleRegister}>
                        <div className="form-group">
                            <label htmlFor="firstName">Imię</label>
                            <input 
                                id="firstName"
                                type="text" 
                                placeholder="Imię"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Nazwisko</label>
                            <input 
                                id="lastName"
                                type="text" 
                                placeholder="Nazwisko"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="username">Login (Nazwa Użytkownika)</label>
                            <input 
                                id="username"
                                type="text" 
                                placeholder="Login"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input 
                                id="email"
                                type="email" 
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Hasło (min. 6 znaków)</label>
                            <div className="input-container">
                                <input 
                                    id="password"
                                    type={passwordVisible ? 'text' : 'password'} 
                                    placeholder="Hasło"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                                <EyeIcon 
                                    show={passwordVisible} 
                                    toggle={() => setPasswordVisible(!passwordVisible)} 
                                />
                            </div>
                        </div>

                        <button type="submit" className="login-button" disabled={isLoading}>
                            {isLoading ? 'Rejestrowanie...' : 'Zarejestruj się'}
                        </button>
                    </form>
                    
                    <div className="register-option">
                        Masz już Konto? <a href="/login" className="register-link" onClick={handleLoginClick}>Zaloguj się</a>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default RegisterPage;