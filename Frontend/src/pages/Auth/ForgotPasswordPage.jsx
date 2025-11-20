import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/pages/LoginReg.css';

const ForgotPasswordPage = ({ onNavigateToLogin }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('http://localhost:7115/api/Auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Link do resetu został wysłany (sprawdź konsolę backendu, jeśli nie masz SMTP).');
                // Opcjonalnie: przekieruj do resetowania po chwili
                setTimeout(() => navigate('/reset-password'), 3000);
            } else {
                setError(data.message || 'Wystąpił błąd.');
            }
        } catch (err) {
            setError('Błąd połączenia z serwerem.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="login-container">
            <div className="login-content" style={{ justifyContent: 'center' }}>
                <div className="login-form-card" style={{ maxWidth: '500px', flex: 'none', width: '100%' }}>
                    <h2 className="login-title">Zapomniałeś hasła?</h2>
                    <p style={{ textAlign: 'center', marginBottom: '20px', color: '#ccc' }}>
                        Podaj swój adres e-mail, a wyślemy Ci token do resetu hasła.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Wpisz swój email"
                            />
                        </div>

                        {message && <div style={{ color: '#28a745', textAlign: 'center', marginBottom: '10px' }}>{message}</div>}
                        {error && <div style={{ color: '#ff4d4d', textAlign: 'center', marginBottom: '10px' }}>{error}</div>}

                        <button type="submit" className="login-button" disabled={isLoading}>
                            {isLoading ? 'Wysyłanie...' : 'Wyślij token'}
                        </button>
                    </form>

                    <div className="register-option">
                        <button 
                            className="register-link" 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1em' }}
                            onClick={onNavigateToLogin}
                        >
                            Wróć do logowania
                        </button>
                    </div>
                    <div className="register-option" style={{ marginTop: '10px' }}>
                        Masz już token? <a href="/reset-password" className="register-link" onClick={(e) => { e.preventDefault(); navigate('/reset-password'); }}>Zresetuj hasło tutaj</a>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ForgotPasswordPage;