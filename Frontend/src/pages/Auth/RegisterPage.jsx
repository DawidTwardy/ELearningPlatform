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

const RegisterPage = ({ setCurrentPage, onRegisterSuccess }) => {
    const [login, setLogin] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = (e) => {
        e.preventDefault();
        setError(''); 
        
        if (password.length < 4) { 
            setError('Hasło musi mieć co najmniej 4 znaki.');
            return;
        }
        
        const registerData = {
            username: login,
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName
        };

        // POPRAWKA: Używamy HTTP
        fetch('http://localhost:7115/api/Auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData)
        })
        .then(async response => {
            // Zmieniona logika do bezpiecznej obsługi odpowiedzi nie będącej formatem JSON (np. błąd 500)
            const text = await response.text();
            let data = {};
            
            try {
                // Spróbuj parsować jako JSON
                data = JSON.parse(text);
            } catch (e) {
                // Jeśli parsowanie JSON się nie powiedzie (np. otrzymano HTML/czysty tekst)
                if (response.ok) {
                    // W teorii pomyślna odpowiedź powinna być JSON, więc to jest nieoczekiwane
                    throw new Error("Pomyślny status, ale nieoczekiwany format odpowiedzi.");
                } else {
                    // W przypadku błędu serwera, który nie jest JSON-em, rzuć ogólny błąd
                    console.error("Błąd serwera zwrócił nie-JSON:", text);
                    throw new Error(`Wystąpił błąd serwera (Status: ${response.status}). Serwer zwrócił nieoczekiwany format danych.`);
                }
            }
            
            return { status: response.status, body: data };
        })
        .then(result => {
            if (result.status === 200) {
                alert("Rejestracja przebiegła pomyślnie! Zostałeś zalogowany.");
                
                // Nowy użytkownik w backendzie domyślnie otrzymuje rolę Instructor, ale tutaj mockujemy rolę Studenta, 
                // dopóki nie pobierzemy faktycznych ról z tokena. (To powinno być obsłużone w funkcji onRegisterSuccess)
                const userRole = 'Student'; 

                // Przechowujemy dane użytkownika
                localStorage.setItem('token', result.body.token); // POPRAWKA: Używamy klucza 'token'
                localStorage.setItem('lastUsername', login);
                localStorage.setItem('lastFirstName', firstName);
                localStorage.setItem('lastName', lastName);

                // Przekazujemy token i dane użytkownika
                onRegisterSuccess(result.body.token, { username: login, role: userRole, firstName: firstName, lastName: lastName }); 

            } else {
                // Błąd rejestracji (400 Bad Request)
                const errorBody = result.body.Errors;
                
                let errorMessage = 'Nieznany błąd rejestracji.';
                if (errorBody && Array.isArray(errorBody)) {
                    errorMessage = errorBody.map(err => err.Description).join('; ');
                } else if (result.body.message) {
                    errorMessage = result.body.message;
                } else if (result.status === 400 && result.body.title) {
                    errorMessage = result.body.title; 
                }
                
                setError(errorMessage);
            }
        })
        .catch(err => {
            console.error("Błąd sieci/serwera:", err);
            // Używamy error.message z rzuconego błędu w bloku .then
            setError(err.message || 'Błąd połączenia z serwerem. Spróbuj ponownie.'); 
        });
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
                            <label htmlFor="password">Hasło (min. 4 znaki)</label>
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