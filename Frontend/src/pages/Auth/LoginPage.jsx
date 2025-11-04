import React, { useState } from 'react';
import '../../styles/pages/LoginReg.css';

const EyeIcon = ({ show, toggle }) => (
    <img 
        src={show ? '/src/icon/eye.png' : '/src/icon/eye-slash.png'} 
        alt={show ? 'Ukryj hasło' : 'Pokaż hasło'}
        className="password-toggle-icon"
        onClick={toggle}
    />
);

const LoginPage = ({ setCurrentPage, onLoginSuccess }) => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setError(''); 
        
        const loginData = {
            username: login, // UŻYWAMY username ZGODNIE Z TWOJĄ LOGIKĄ MOCKOWANIA
            password: password,
        };

        // NOWA LOGIKA: Wysyłanie do API
        fetch('https://localhost:7115/api/Auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        })
        .then(response => {
             // Zawsze próbujemy sparsować JSON, aby uzyskać token lub błędy
            return response.json().then(data => ({ status: response.status, body: data }));
        })
        .then(result => {
            if (result.status === 200) {
                // Pomyślne logowanie, otrzymaliśmy token
                
                // --- KLUCZOWA POPRAWKA: ZAPIS TOKENU DO LOCAL STORAGE ---
                if (result.body.token) {
                    localStorage.setItem('token', result.body.token); 
                }
                
                // MOCK ROLI I DANYCH UŻYTKOWNIKA (na podstawie loginu, dopóki Identity nie obsługuje ról)
                let userRole = 'Student';
                let firstName = 'Jan';
                let lastName = 'Kowalski';

                if (login.toLowerCase() === 'admin') {
                    userRole = 'Admin';
                    firstName = 'Admin';
                    lastName = 'User';
                } else if (login.toLowerCase() === 'instructor') {
                    userRole = 'Instructor';
                    firstName = 'Michał';
                    lastName = 'Nowak';
                }
                
                // Zapisujemy mockowe dane użytkownika do lokalnego storage, aby App.jsx mogło je odtworzyć po odświeżeniu
                localStorage.setItem('lastUsername', login);
                localStorage.setItem('lastFirstName', firstName);
                localStorage.setItem('lastName', lastName);

                // Przekazanie tokenu i danych do App.jsx
                onLoginSuccess(result.body.token, { username: login, role: userRole, firstName: firstName, lastName: lastName });

            } else {
                // Błąd logowania (np. 401 Unauthorized)
                setError(result.body.message || 'Błędny Login lub Hasło'); 
            }
        })
        .catch(err => {
            console.error("Błąd sieci/serwera:", err);
            setError('Błąd połączenia z serwerem. Spróbuj ponownie.');
        });
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