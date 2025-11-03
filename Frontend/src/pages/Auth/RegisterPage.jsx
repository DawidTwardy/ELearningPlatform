import React, { useState } from 'react';
import '../../styles/pages/LoginReg.css'; // ZMIENIONA ŚCIEŻKA

const EyeIcon = ({ show, toggle }) => (
    <img 
        src={show ? '/src/icon/eye.png' : '/src/icon/eye-slash.png'} 
        alt={show ? 'Ukryj hasło' : 'Pokaż hasło'}
        className="password-toggle-icon"
        onClick={toggle}
    />
);

const RegisterPage = ({ setCurrentPage }) => {
    const [login, setLogin] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = (e) => {
        e.preventDefault();
        setError(''); 
        
        if (login && email && password.length >= 6) {
            console.log(`Zarejestrowano użytkownika: ${login}, Email: ${email}`);
            alert("Rejestracja przebiegła pomyślnie! Przekierowanie do logowania.");
            setCurrentPage('login');

        } else if (password.length < 6) {
            setError('Hasło musi mieć co najmniej 6 znaków.');
        } else {
            setError('Proszę wypełnić wszystkie pola.');
        }
    };

    const handleLoginClick = (e) => {
        e.preventDefault();
        setCurrentPage('login');
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
                    
                    <form onSubmit={handleRegister}>
                        
                        <div className="form-group">
                            <label htmlFor="login">Login</label>
                            <input 
                                id="login"
                                type="text" 
                                placeholder="Login"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
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
                            <label htmlFor="password">Hasło</label>
                            <div className="input-container">
                                <input 
                                    id="password"
                                    type={passwordVisible ? 'text' : 'password'} 
                                    placeholder="Hasło"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <EyeIcon 
                                    show={passwordVisible} 
                                    toggle={() => setPasswordVisible(!passwordVisible)} 
                                />
                            </div>
                            
                            <div className="form-feedback">
                                {error && <span className="error-message">{error}</span>}
                            </div>
                        </div>

                        <button type="submit" className="login-button">Zarejestruj się</button>
                    </form>
                    
                    <div className="register-option">
                        Masz już Konto? <a href="#login" className="register-link" onClick={handleLoginClick}>Zaloguj się</a>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default RegisterPage;