import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/pages/LoginReg.css';

const ResetPasswordPage = ({ onNavigateToLogin }) => {
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
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
            const response = await fetch('http://localhost:7115/api/Auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Hasło zostało pomyślnie zmienione! Przekierowywanie do logowania...');
                setTimeout(() => {
                    if (onNavigateToLogin) onNavigateToLogin();
                    else navigate('/login');
                }, 2000);
            } else {
                setError(data.message || (data.Errors ? data.Errors.map(e => e.Description).join(', ') : 'Wystąpił błąd.'));
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
                    <h2 className="login-title">Ustaw nowe hasło</h2>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Twój email"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="token">Token (z e-maila)</label>
                            <input
                                id="token"
                                type="text"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                required
                                placeholder="Wklej token tutaj"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">Nowe Hasło</label>
                            <input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                placeholder="Minimum 6 znaków"
                                minLength={6}
                            />
                        </div>

                        {message && <div style={{ color: '#28a745', textAlign: 'center', marginBottom: '10px' }}>{message}</div>}
                        {error && <div style={{ color: '#ff4d4d', textAlign: 'center', marginBottom: '10px' }}>{error}</div>}

                        <button type="submit" className="login-button" disabled={isLoading}>
                            {isLoading ? 'Zmieniam...' : 'Zmień hasło'}
                        </button>
                    </form>
                    
                    <div className="register-option">
                        <button 
                            className="register-link" 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1em' }}
                            onClick={onNavigateToLogin}
                        >
                            Anuluj i wróć do logowania
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ResetPasswordPage;