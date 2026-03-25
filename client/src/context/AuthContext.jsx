import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Global axios configuration
        axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Configure axios to send token with every request
                    axios.defaults.headers.common['x-auth-token'] = token;

                    // Verify token and get user details
                    const res = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/auth/me`);

                    if (res.data) {
                        setUser({ ...res.data, token });
                    } else {
                        throw new Error('User data not found');
                    }
                } catch (err) {
                    console.error('Auth verification failed', err);
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    delete axios.defaults.headers.common['x-auth-token'];
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/auth/login`, { email, password });
            const { token, role } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('role', role); 
            axios.defaults.headers.common['x-auth-token'] = token;

            setUser({ role, token });
            return role;
        } catch (err) {
            console.error('Login error:', err);
            throw err;
        }
    };

    const register = async (formData) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/auth/register`, formData);
            return res.data;
        } catch (err) {
            console.error('Registration error:', err);
            throw err;
        }
    };

    const googleLogin = async (token) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/auth/google`, { credential: token });
            const { token: jwtToken, role } = res.data;

            localStorage.setItem('token', jwtToken);
            localStorage.setItem('role', role);
            axios.defaults.headers.common['x-auth-token'] = jwtToken;

            setUser({ role, token: jwtToken });
            return role;
        } catch (err) {
            console.error('Google login error:', err);
            throw err;
        }
    };

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        delete axios.defaults.headers.common['x-auth-token'];
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, googleLogin, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
