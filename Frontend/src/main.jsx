import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';

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

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
);