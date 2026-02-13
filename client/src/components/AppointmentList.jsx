import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AppointmentList = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/appointments', {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                setAppointments(res.data);
            } catch (err) {
                console.error('Failed to fetch appointments');
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'rejected': return 'bg-rose-50 text-rose-700 border-rose-100';
            default: return 'bg-amber-50 text-amber-700 border-amber-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <CheckCircle className="h-3 w-3" />;
            case 'rejected': return <XCircle className="h-3 w-3" />;
            default: return <Clock className="h-3 w-3" />;
        }
    };

    if (loading) return <div className="p-4 text-center text-gray-500 text-xs">Loading...</div>;

    if (appointments.length === 0) return <div className="p-8 text-center text-gray-400 text-sm font-medium">No appointments found.</div>;

    return (
        <div className="divide-y divide-gray-50">
            {appointments.map(app => (
                <div key={app._id} className="p-4 hover:bg-gray-50 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${getStatusStyle(app.status)}`}>
                                {getStatusIcon(app.status)}
                                {app.status}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">{new Date(app.date).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <p className="text-sm font-bold text-gray-800 mb-1 line-clamp-1">{app.reason}</p>

                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                            <User className="h-3 w-3" />
                            <span>{app.studentId?.name || 'Unknown Student'}</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <span>with {app.advisorId?.name || 'Unknown Advisor'}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AppointmentList;
