import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
import { AuthProvider } from './context/AuthContext'; 

// DODAJ TEN BLOK KODU PONIŻEJ IMPORTÓW
if (process.env.NODE_ENV === 'development') {
    const originalError = console.error;
    console.error = (...args) => {
        if (args.length > 0 && typeof args[0] === 'string' && args[0].includes('findDOMNode')) {
            return;
        }
        originalError(...args);
    };
}
// KONIEC BLOKU KODU

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);