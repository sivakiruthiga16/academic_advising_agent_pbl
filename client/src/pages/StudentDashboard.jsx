import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BookOpen, Calendar, GraduationCap, Clock, MessageSquare, Loader2, Bell } from 'lucide-react';

const StudentDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [profile, setProfile] = useState(null);
    const [records, setRecords] = useState([]);
    const [remarks, setRemarks] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notificationCount, setNotificationCount] = useState(0);

    const [appointmentData, setAppointmentData] = useState({ advisorId: '', date: '', time: '', reason: '' });

    useEffect(() => {
        const path = location.pathname;
        if (path.includes('/records')) setActiveTab('records');
        else if (path.includes('/appointments')) {
            setActiveTab('appointments');
            markNotificationsAsRead();
        }
        else setActiveTab('overview');

        fetchData();
        checkNotifications();

        const interval = setInterval(checkNotifications, 12000); // Poll every 12s
        return () => clearInterval(interval);
    }, [location.pathname]);

    const checkNotifications = async () => {
        try {
            const res = await axios.get('/api/appointments/notifications');
            if (res.data.count > notificationCount) {
                toast('Appointment Status Updated!', {
                    icon: '🔔',
                    style: {
                        borderRadius: '10px',
                        background: '#3B82F6',
                        color: '#fff',
                    },
                });
            }
            setNotificationCount(res.data.count);
        } catch (err) {
            console.error('Failed to fetch notifications');
        }
    };

    const markNotificationsAsRead = async () => {
        try {
            if (notificationCount > 0) {
                await axios.put('/api/appointments/notifications/mark-viewed');
                setNotificationCount(0);
            }
        } catch (err) {
            console.error('Failed to mark notifications');
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'overview') navigate('/student');
        else if (tab === 'records') navigate('/student/records');
        else if (tab === 'appointments') {
            navigate('/student/appointments');
            markNotificationsAsRead();
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // Progressive Loading: Load basic profile first
            const profileRes = await axios.get('/api/student/profile');
            setProfile(profileRes.data);
            setLoading(false); // Show UI as soon as profile is loaded

            // Load secondary data in background
            const [recordsRes, remarksRes, appointmentsRes] = await Promise.all([
                axios.get('/api/student/records'),
                axios.get('/api/student/remarks'),
                axios.get('/api/student/appointments')
            ]);
            setRecords(recordsRes.data);
            setRemarks(remarksRes.data);
            setAppointments(appointmentsRes.data);
            if (activeTab === 'appointments') checkNotifications();
        } catch (err) {
            console.error(err);
            toast.error('Data unavailable. Try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/student/appointments', {
                ...appointmentData,
                advisorId: profile.advisorId._id
            });
            toast.success('Appointment booked successfully');
            setAppointmentData({ advisorId: '', date: '', time: '', reason: '' });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to book appointment');
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
                <div className="relative p-2 bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleTabChange('appointments')}>
                    <Bell className="h-5 w-5 text-gray-600" />
                    {notificationCount > 0 && (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border border-white animate-pulse"></span>
                    )}
                </div>
            </div>

            <div className="flex space-x-4 border-b">
                <button
                    className={`pb-2 px-4 ${activeTab === 'overview' ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-gray-500'}`}
                    onClick={() => handleTabChange('overview')}
                >
                    Overview
                </button>
                <button
                    className={`pb-2 px-4 ${activeTab === 'records' ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-gray-500'}`}
                    onClick={() => handleTabChange('records')}
                >
                    Academic Records
                </button>
                <div className="relative">
                    <button
                        className={`pb-2 px-4 ${activeTab === 'appointments' ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-gray-500'}`}
                        onClick={() => handleTabChange('appointments')}
                    >
                        Appointments
                    </button>
                    {notificationCount > 0 && activeTab !== 'appointments' && (
                        <span className="absolute top-0 right-0 h-2 w-2 bg-blue-500 rounded-full"></span>
                    )}
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><GraduationCap className="h-5 w-5 text-indigo-600" /> My Profile</h3>
                        <div className="space-y-3">
                            <p><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-900">{profile?.userId?.name}</span></p>
                            <p><span className="text-gray-500">Department:</span> <span className="font-medium text-gray-900">{profile?.department}</span></p>
                            <p><span className="text-gray-500">CGPA:</span> <span className="font-bold text-indigo-600 text-xl">{profile?.cgpa || '0.00'}</span></p>
                            <p><span className="text-gray-500">Advisor:</span> <span className="font-medium text-blue-600">{profile?.advisorId?.name || 'Not Assigned'}</span></p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><MessageSquare className="h-5 w-5 text-teal-600" /> Advisor Remarks</h3>
                        <div className="space-y-4 max-h-60 overflow-y-auto">
                            {remarks.length === 0 ? <p className="text-gray-400 italic">No remarks yet.</p> :
                                remarks.map((remark, idx) => (
                                    <div key={idx} className="bg-gray-50 p-3 rounded-lg border-l-4 border-teal-500">
                                        <p className="text-gray-800">{remark.content}</p>
                                        <p className="text-xs text-gray-500 mt-2">{new Date(remark.createdAt).toLocaleDateString()}</p>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'records' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><BookOpen className="h-5 w-5 text-indigo-600" /> Academic History</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b text-gray-500 text-sm">
                                    <th className="pb-3">Semester</th>
                                    <th className="pb-3">Subjects</th>
                                    <th className="pb-3">Marks</th>
                                    <th className="pb-3">Grades</th>
                                    <th className="pb-3">GPA</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((record, idx) => (
                                    <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="py-3 font-medium text-gray-900">{record.semester}</td>
                                        <td className="py-3 text-gray-600">
                                            {record.subjects.map(s => <div key={s._id}>{s.name}</div>)}
                                        </td>
                                        <td className="py-3 text-gray-600">
                                            {record.subjects.map(s => <div key={s._id}>{s.marks}</div>)}
                                        </td>
                                        <td className="py-3 text-gray-600">
                                            {record.subjects.map(s => <div key={s._id} className="font-medium">{s.grade}</div>)}
                                        </td>
                                        <td className="py-3 font-bold text-indigo-600">{record.cgpa}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {records.length === 0 && <p className="text-center text-gray-500 mt-4">No academic records found.</p>}
                    </div>
                </div>
            )}

            {activeTab === 'appointments' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Calendar className="h-5 w-5 text-indigo-600" /> Book Appointment</h3>
                        {profile?.advisorId ? (
                            <form onSubmit={handleBookAppointment} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Select Advisor</label>
                                    <select
                                        className="w-full border p-2 rounded-lg bg-gray-50"
                                        value={profile.advisorId._id}
                                        disabled
                                    >
                                        <option value={profile.advisorId._id}>{profile.advisorId.name}</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Date</label>
                                        <input
                                            type="date"
                                            className="w-full border p-2 rounded-lg"
                                            value={appointmentData.date}
                                            onChange={(e) => setAppointmentData({ ...appointmentData, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Time</label>
                                        <input
                                            type="time"
                                            className="w-full border p-2 rounded-lg"
                                            value={appointmentData.time}
                                            onChange={(e) => setAppointmentData({ ...appointmentData, time: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Reason</label>
                                    <textarea
                                        className="w-full border p-2 rounded-lg"
                                        rows="3"
                                        placeholder="Discuss project, grades, etc."
                                        value={appointmentData.reason}
                                        onChange={(e) => setAppointmentData({ ...appointmentData, reason: e.target.value })}
                                        required
                                    ></textarea>
                                </div>
                                <button type="button" onClick={handleBookAppointment} className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">Set Appointment</button>
                            </form>
                        ) : (
                            <div className="text-center p-6 text-gray-500 bg-gray-50 rounded-lg">
                                <p>You do not have an assigned advisor yet.</p>
                                <p className="text-sm mt-2">Please contact the administrator.</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Clock className="h-5 w-5 text-teal-600" /> Appointment History</h3>
                        <div className="space-y-4">
                            {appointments.length === 0 ? <p className="text-gray-500">No appointments found.</p> :
                                appointments.map(apt => (
                                    <div key={apt._id} className="relative border p-3 rounded-lg flex justify-between items-center bg-white hover:shadow-sm transition-shadow">
                                        {((apt.status === 'approved' || apt.status === 'rejected') && new Date(apt.statusUpdatedAt) > new Date(Date.now() - 86400000)) && (
                                            <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span></span>
                                        )}
                                        <div>
                                            <p className="font-medium text-gray-900">{new Date(apt.date).toLocaleDateString()} at {apt.time || "Not Scheduled"}</p>
                                            <p className="text-sm text-gray-600">{apt.reason}</p>
                                            <p className="text-xs text-indigo-600 mt-1">Advisor: {apt.advisorId?.name}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold capitalize ${apt.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            apt.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {apt.status}
                                        </span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
