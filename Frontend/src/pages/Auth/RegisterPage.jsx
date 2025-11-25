import React, { useState } from 'react';
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
    const { register } = useAuth();
    
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(''); 
        
        const registerData = {
            username: username,
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName
        };

        const result = await register(registerData);

        if (result.success) {
            alert("Rejestracja przebiegła pomyślnie! Zostałeś zalogowany.");
            onRegisterSuccess();
        } else {
            setError(result.message);
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
                            <label htmlFor="password">Hasło (min. 6 znaków, duża/mała litera)</label>
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