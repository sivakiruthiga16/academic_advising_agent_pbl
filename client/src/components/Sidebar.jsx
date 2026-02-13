import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Calendar,
    BookOpen,
    LogOut,
    ChevronRight,
    GraduationCap,
    Settings,
    UserCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ userRole, setUserRole }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = {
        admin: [
            { name: 'Overview', icon: LayoutDashboard, path: '/admin' },
            { name: 'Student Management', icon: Users, path: '/admin/students' },
            { name: 'Advisor Assignment', icon: UserCircle, path: '/admin/advisors' },
            { name: 'All Appointments', icon: Calendar, path: '/admin/appointments' },
        ],
        advisor: [
            { name: 'Dashboard', icon: LayoutDashboard, path: '/advisor' },
            { name: 'My Students', icon: Users, path: '/advisor/students' },
            { name: 'Appointments', icon: Calendar, path: '/advisor/appointments' },
        ],
        student: [
            { name: 'My Performance', icon: GraduationCap, path: '/student' },
            { name: 'Book Appointment', icon: Calendar, path: '/student/appointments' },
            { name: 'Academic Record', icon: BookOpen, path: '/student/records' },
        ]
    };

    const currentMenu = menuItems[userRole] || [];

    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    if (!userRole) return null;

    return (
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full sticky top-0 shadow-sm">
            <div className="p-6 flex items-center gap-3 border-b border-gray-50">
                <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-100">
                    <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight text-gray-800">Academic<span className="text-indigo-600">AI</span></span>
            </div>

            <nav className="flex-grow p-4 space-y-2 mt-4">
                <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Main Menu</p>
                {currentMenu.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => navigate(item.path)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${location.pathname === item.path
                            ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className={`h-5 w-5 ${location.pathname === item.path ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                            <span className="font-medium">{item.name}</span>
                        </div>
                        {location.pathname === item.path && <ChevronRight className="h-4 w-4" />}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-50">
                <div className="p-4 bg-gray-50 rounded-2xl mb-4">
                    <p className="text-xs text-gray-500 font-medium">Logged in as</p>
                    <p className="text-sm font-bold text-gray-800 capitalize">{userRole}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium group"
                >
                    <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
