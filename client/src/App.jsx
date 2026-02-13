import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './pages/Login';
// Register import removed
import AdminDashboard from './pages/AdminDashboard';
import AdvisorDashboard from './pages/AdvisorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

function LogoutAndRedirect() {
    const { logout } = useAuth();
    useEffect(() => {
        logout();
    }, [logout]);
    return <Navigate to="/login" replace />;
}

function AppContent() {
    const { user, loading } = useAuth();
    // Strict requirement: Force login on app open
    // We check if it's the very first load or root access

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />

            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={user ? <Navigate to={`/${user.role}`} /> : <Login />} />

                {/* Strict Root Redirect with Logout */}
                <Route path="/" element={<LogoutAndRedirect />} />

                {/* Protected Routes */}
                <Route path="/admin/*" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <div className="flex h-screen overflow-hidden">
                            <Sidebar userRole="admin" />
                            <div className="flex-grow flex flex-col h-screen overflow-y-auto">
                                <Navbar userRole="admin" />
                                <main className="p-6 md:p-8 flex-grow">
                                    <AdminDashboard />
                                </main>
                            </div>
                        </div>
                    </ProtectedRoute>
                } />

                <Route path="/advisor/*" element={
                    <ProtectedRoute allowedRoles={['advisor']}>
                        <div className="flex h-screen overflow-hidden">
                            <Sidebar userRole="advisor" />
                            <div className="flex-grow flex flex-col h-screen overflow-y-auto">
                                <Navbar userRole="advisor" />
                                <main className="p-6 md:p-8 flex-grow">
                                    <AdvisorDashboard />
                                </main>
                            </div>
                        </div>
                    </ProtectedRoute>
                } />

                <Route path="/student/*" element={
                    <ProtectedRoute allowedRoles={['student']}>
                        <div className="flex h-screen overflow-hidden">
                            <Sidebar userRole="student" />
                            <div className="flex-grow flex flex-col h-screen overflow-y-auto">
                                <Navbar userRole="student" />
                                <main className="p-6 md:p-8 flex-grow">
                                    <StudentDashboard />
                                </main>
                            </div>
                        </div>
                    </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;
