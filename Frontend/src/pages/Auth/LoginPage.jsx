import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/pages/LoginReg.css';

const EyeIcon = ({ show, toggle }) => (
    <img 
        src={show ? '/src/icon/eye.png' : '/src/icon/eye-slash.png'} 
        alt={show ? 'Ukryj hasło' : 'Pokaż hasło'}
        className="password-toggle-icon"
        onClick={toggle}
    />
);

const LoginPage = () => { 
    const navigate = useNavigate(); 
    const { login } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const result = await login(username, password);

        if (result.success) {
            navigate('/'); 
        } else {
            setError(result.message || 'Błędny login lub hasło.');
        }
        
        setIsLoading(false);
    };

    const goToRegister = (e) => {
        e.preventDefault();
        navigate('/register');
    };

    return (
        <main className="login-container">
            <div className="login-content">
                <div className="login-illustration">
                    <div className="login-illustration-wrapper">
                        <img 
                            src="/src/login/illustration.png" 
                            alt="Ilustracja logowania" 
                            className="login-illustration-image"
                        />
                    </div>
                </div>

                <div className="login-form-card">
                    <h2 className="login-title">Zaloguj się</h2>
                    
                    {error && (
                        <div className="form-error-alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label htmlFor="username">Login (Nazwa Użytkownika)</label>
                            <input 
                                id="username"
                                type="text" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                required 
                                placeholder="Wpisz swój login"
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
                        </div>
                        
                        <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                            <a 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}
                                className="forgot-password-link"
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