import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE_URL = 'http://localhost:7115/api';

const parseJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    // Inicjalizacja stanu bezpośrednio z localStorage
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken'); 
        window.location.href = '/login';
    }, []);

    // Konfiguracja axios interceptora
    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            config => {
                const currentToken = localStorage.getItem('token');
                if (currentToken && !config.headers.Authorization) {
                    config.headers.Authorization = `Bearer ${currentToken}`;
                }
                return config;
            },
            error => Promise.reject(error)
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
        };
    }, []);

    // Dekodowanie tokena przy zmianie (lub starcie aplikacji)
    useEffect(() => {
        if (token) {
            const decoded = parseJwt(token);
            
            if (decoded) {
                const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role || "User";
                const name = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || decoded.unique_name || decoded.sub || "Użytkownik";
                const id = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || decoded.nameid || decoded.sub;

                setUser({
                    id: id,
                    username: name,
                    role: role,
                });
                setIsAuthenticated(true);
            } else {
                // Jeśli token jest uszkodzony/nieprawidłowy, czyścimy
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                setToken(null);
                setUser(null);
                setIsAuthenticated(false);
            }
        } else {
            setUser(null);
            setIsAuthenticated(false);
        }
    }, [token]);

    const login = async (username, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/Auth/login`, { username, password });
            const { token: newToken, refreshToken } = response.data;
            
            // KLUCZOWA POPRAWKA: Zapis synchroniczny przed ustawieniem stanu
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }
            if (newToken) {
                localStorage.setItem('token', newToken);
                setToken(newToken); // To wywoła useEffect dekodujący usera
            }
            
            return { success: true };
        } catch (error) {
            console.error('Błąd logowania:', error.response ? error.response.data : error.message);
            return { success: false, message: error.response?.data?.message || 'Wystąpił nieznany błąd podczas logowania.' };
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/Auth/register`, userData);
            const { token: newToken, refreshToken } = response.data;
            
            // KLUCZOWA POPRAWKA: Zapis synchroniczny
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }
            if (newToken) {
                localStorage.setItem('token', newToken);
                setToken(newToken);
            }
            
            return { success: true };
        } catch (error) {
            console.error('Błąd rejestracji:', error.response ? error.response.data : error.message);
            const errorMessages = error.response?.data?.Errors?.map(e => e.Description).join(', ') || 'Wystąpił nieznany błąd podczas rejestracji.';
            return { success: false, message: errorMessages };
        }
    };

    const value = {
        isAuthenticated,
        token,
        user, 
        login,
        register,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};

export { AuthContext };