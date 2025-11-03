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

const LoginPage = ({ setCurrentPage, setIsLoggedIn, setIsAdmin }) => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setError(''); 
        
        if (login === 'admin' && password === 'admin') {
            setIsLoggedIn(true);
            setIsAdmin(true); 
            setCurrentPage('admin'); 
        
        } else if (login === 'test' && password === 'haslo') {
            setIsLoggedIn(true);
            setIsAdmin(false); 
            setCurrentPage('home'); 
        } else {
            setError('Błędny Login lub Hasło'); 
        }
    };

    const handleRegisterClick = (e) => {
        e.preventDefault();
        setCurrentPage('register');
    };
    
    return (
        <main className="login-container">
            <div className="login-content">
                
                <div className="login-illustration">
                    <div className="login-illustration-wrapper">
                        <img 
                            src="/src/login/illustration.png" 
                            alt="Bezpieczeństwo konta"
                            className="login-illustration-image"
                        />
                    </div>
                </div>

                <div className="login-form-card">
                    <h2 className="login-title">Zaloguj się</h2>
                    
                    <form onSubmit={handleLogin}>
                        
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
                                <a href="#forgot-password" className="forgot-password">Przypomnij hasło</a>
                            </div>
                        </div>

                        <button type="submit" className="login-button">Zaloguj się</button>
                    </form>
                    
                    <div className="register-option">
                        Nie masz Konta? <a href="#register" className="register-link" onClick={handleRegisterClick}>Zarejestruj się</a>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default LoginPage;