import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE_URL = 'http://localhost:7115/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

    const logout = useCallback(() => {
        setToken(null);
    }, []);

    useEffect(() => {
        // Interceptor dla dodawania tokenu do nagłówka (Request Interceptor)
        const requestInterceptor = axios.interceptors.request.use(
            config => {
                const currentToken = localStorage.getItem('token');
                
                if (currentToken && !config.headers.Authorization) {
                    config.headers.Authorization = `Bearer ${currentToken}`;
                }
                return config;
            },
            error => {
                return Promise.reject(error);
            }
        );

        // Interceptor dla obsługi błędu 401/403 z API (Response Interceptor)
        const responseInterceptor = axios.interceptors.response.use(
            response => response,
            error => {
                
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    console.error("Token wygasł lub jest nieprawidłowy. Wylogowanie użytkownika.");
                    logout();
                    
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [logout]);


    useEffect(() => {
        
        if (token) {
            localStorage.setItem('token', token);
            setIsAuthenticated(true);
        } else {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUser(null);
        }
    }, [token]);


    
    const login = async (username, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/Auth/login`, { username, password });
            const token = response.data.token;
            setToken(token);
            
            return { success: true };
        } catch (error) {
            console.error('Błąd logowania:', error.response ? error.response.data : error.message);
            return { success: false, message: error.response?.data?.message || 'Wystąpił nieznany błąd podczas logowania.' };
        }
    };

    const register = async (userData) => {
        try {
            
            const response = await axios.post(`${API_BASE_URL}/Auth/register`, userData);
            const token = response.data.token;
            setToken(token);
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