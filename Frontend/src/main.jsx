import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';

// Wyciszenie ostrzeżeń findDOMNode (z Twojego oryginalnego kodu)
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('findDOMNode')) {
        return;
    }
    originalWarn(...args);
};

console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('findDOMNode')) {
        return;
    }
    originalError(...args);
};

// Rejestracja Service Workera
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                // Łapiemy błąd, aby nie blokował aplikacji w trybie Incognito/HTTP
                console.warn('SW registration failed. To normalne w trybie Incognito lub bez HTTPS.', registrationError);
            });
    });
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
);