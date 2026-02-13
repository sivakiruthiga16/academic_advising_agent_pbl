import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        // Redirect to their respective dashboard if they try to access wrong role path
        if (role === 'admin') return <Navigate to="/admin" />;
        if (role === 'advisor') return <Navigate to="/advisor" />;
        if (role === 'student') return <Navigate to="/student" />;
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;
