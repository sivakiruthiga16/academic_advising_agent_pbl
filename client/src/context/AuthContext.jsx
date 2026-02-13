import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Configure axios to send token with every request
                    axios.defaults.headers.common['x-auth-token'] = token;

                    // Verify token and get user details
                    const res = await axios.get('http://localhost:5000/api/auth/me');

                    if (res.data) {
                        setUser({ ...res.data, token });
                    } else {
                        // Handle case where server returns 200 but no data (should not happen with new backend fix, but good for safety)
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
        const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        const { token, role } = res.data;

        localStorage.setItem('token', token);
        localStorage.setItem('role', role); // Backup
        axios.defaults.headers.common['x-auth-token'] = token;

        // We can fetch full profile here or just trust the login response
        // Login response returns { token, role, msg }
        // Let's set basic user info
        setUser({ role, token });
        return role;
    };

    const register = async (formData) => {
        const res = await axios.post('http://localhost:5000/api/auth/register', formData);
        return res.data;
    };

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        delete axios.defaults.headers.common['x-auth-token'];
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
