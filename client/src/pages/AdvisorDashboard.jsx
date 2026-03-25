import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Users, Calendar, CheckCircle, XCircle, MessageSquare, Loader2, Bell } from 'lucide-react';

const AdvisorDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('students');
    const [students, setStudents] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notificationCount, setNotificationCount] = useState(0);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentProfileLoading, setStudentProfileLoading] = useState(false);

    const [remarkData, setRemarkData] = useState({ studentId: '', content: '' });

    useEffect(() => {
        const path = location.pathname;
        if (path.includes('/students')) setActiveTab('students');
        else if (path.includes('/appointments')) {
            setActiveTab('appointments');
            markNotificationsAsRead();
        }
        else setActiveTab('students'); // Default

        fetchData();
        checkNotifications();

        const interval = setInterval(checkNotifications, 15000); // Poll every 15s
        return () => clearInterval(interval);
    }, [location.pathname]);

    const checkNotifications = async () => {
        if (!activeTab.includes('appointments')) { // Only poll if not currently viewing
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/appointments/notifications`);
                setNotificationCount(res.data.count);
            } catch (err) {
                console.error('Failed to fetch notifications', err);
            }
        }
    };

    const markNotificationsAsRead = async () => {
        try {
            if (notificationCount > 0) {
                await axios.put(`${import.meta.env.VITE_API_URL || ''}/api/appointments/notifications/mark-viewed`);
                setNotificationCount(0);
            }
        } catch (err) {
            console.error('Failed to mark notifications', err);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const studentsRes = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/advisor/students`);
            setStudents(studentsRes.data);
            setLoading(false);

            const appointmentsRes = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/advisor/appointments`);
            setAppointments(appointmentsRes.data);
            if (activeTab === 'appointments') checkNotifications();
        } catch (err) {
            console.error('Data fetch error:', err);
            toast.error('Data unavailable. Try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSelectedStudent(null);
        if (tab === 'students') navigate('/advisor/students');
        else if (tab === 'appointments') {
            navigate('/advisor/appointments');
            markNotificationsAsRead();
        }
    };

    const handleAddRemark = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/advisor/remarks`, remarkData);
            toast.success('Remark added successfully');
            setRemarkData({ studentId: '', content: '' });
        } catch (err) {
            console.error('Add remark error:', err);
            toast.error('Failed to add remark');
        }
    };

    const handleAppointmentStatus = async (id, status) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL || ''}/api/advisor/appointments/${id}`, { status });
            toast.success(`Appointment ${status}`);
            fetchData();
        } catch (err) {
            console.error('Update appointment error:', err);
            toast.error('Failed to update status');
        }
    };

    const viewStudentProfile = async (studentId) => {
        setStudentProfileLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/advisor/student/${studentId}`);
            setSelectedStudent(res.data);
        } catch (err) {
            console.error('View profile error:', err);
            toast.error('Failed to load student profile');
        } finally {
            setStudentProfileLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Advisor Dashboard</h1>
                <div className="relative p-2 bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleTabChange('appointments')}>
                    <Bell className="h-5 w-5 text-gray-600" />
                    {notificationCount > 0 && (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border border-white animate-pulse"></span>
                    )}
                </div>
            </div>

            <div className="flex space-x-4 border-b">
                <button
                    className={`pb-2 px-4 ${activeTab === 'students' ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-gray-500'}`}
                    onClick={() => handleTabChange('students')}
                >
                    My Students
                </button>
                <div className="relative">
                    <button
                        className={`pb-2 px-4 ${activeTab === 'appointments' ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-gray-500'}`}
                        onClick={() => handleTabChange('appointments')}
                    >
                        Appointments
                    </button>
                    {notificationCount > 0 && activeTab !== 'appointments' && (
                        <span className="absolute top-0 right-0 h-2 w-2 bg-rose-500 rounded-full"></span>
                    )}
                </div>
            </div>

            {activeTab === 'students' && !selectedStudent && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                        <h3 className="font-bold text-lg mb-4">Assigned Students</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b text-gray-500 text-sm">
                                        <th className="pb-3">Name</th>
                                        <th className="pb-3">Department</th>
                                        <th className="pb-3">CGPA</th>
                                        <th className="pb-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(student => (
                                        <tr key={student._id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="py-3 font-medium">{student.userId?.name}</td>
                                            <td className="py-3 text-gray-600">{student.department}</td>
                                            <td className="py-3 font-bold">{student.cgpa || '0.00'}</td>
                                            <td className="py-3">
                                                <button 
                                                    onClick={() => viewStudentProfile(student._id)} 
                                                    className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1 rounded-md font-bold transition-colors"
                                                >
                                                    View Full Data
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><MessageSquare className="h-5 w-5 text-indigo-600" /> Add Remark</h3>
                        <form onSubmit={handleAddRemark} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Select Student</label>
                                <select
                                    className="w-full border p-2 rounded-lg"
                                    value={remarkData.studentId}
                                    onChange={(e) => setRemarkData({ ...remarkData, studentId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Student</option>
                                    {students.map(s => <option key={s._id} value={s.userId._id}>{s.userId.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Remark</label>
                                <textarea
                                    className="w-full border p-2 rounded-lg"
                                    rows="4"
                                    placeholder="Enter guidance or feedback..."
                                    value={remarkData.content}
                                    onChange={(e) => setRemarkData({ ...remarkData, content: e.target.value })}
                                    required
                                ></textarea>
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">Add Remark</button>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === 'students' && selectedStudent && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <button 
                        onClick={() => setSelectedStudent(null)} 
                        className="mb-4 text-indigo-600 font-bold flex items-center gap-2 hover:underline"
                    >
                        &larr; Back to Students
                    </button>
                    
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                        <h2 className="text-2xl font-black text-gray-800 mb-2">Student Academic History</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Name</p>
                                <p className="text-lg font-black text-indigo-900">{selectedStudent.name}</p>
                            </div>
                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Department</p>
                                <p className="text-lg font-black text-indigo-900">{selectedStudent.department}</p>
                            </div>
                            <div className="bg-indigo-600 p-4 rounded-xl text-white shadow-lg shadow-indigo-100">
                                <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Overall CGPA</p>
                                <p className="text-2xl font-black">{parseFloat(selectedStudent.cgpa).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-10">
                        {selectedStudent.semesters && selectedStudent.semesters.length > 0 ? (
                            selectedStudent.semesters.map((sem, idx) => (
                                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="bg-gray-50 p-4 px-6 border-b border-gray-100 flex justify-between items-center">
                                        <h3 className="font-bold text-gray-800 text-xl">Semester {sem.semesterNumber}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500 text-sm font-medium">GPA:</span>
                                            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-black text-sm">
                                                {parseFloat(sem.gpa).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="text-gray-400 text-xs font-black uppercase tracking-widest border-b">
                                                        <th className="pb-3 pl-2">Subject</th>
                                                        <th className="pb-3 text-center">Marks</th>
                                                        <th className="pb-3 text-right pr-2">Grade</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {sem.subjects.map((sub, sIdx) => (
                                                        <tr key={sIdx} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="py-4 font-bold text-gray-700 pl-2">{sub.name}</td>
                                                            <td className="py-4 text-center font-black text-gray-900">{sub.marks}</td>
                                                            <td className="py-4 text-right pr-2">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-black ${
                                                                    sub.grade.startsWith('A') ? 'bg-emerald-100 text-emerald-700' :
                                                                    sub.grade.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-amber-100 text-amber-700'
                                                                }`}>
                                                                    {sub.grade}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-400 font-bold text-lg">No Semester Data Available</p>
                                <p className="text-gray-500 text-sm mt-1">This student's academic history has not been updated yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'appointments' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-bold text-lg mb-4">Appointment Requests</h3>
                    <div className="space-y-4">
                        {appointments.length === 0 ? <p className="text-gray-500">No appointments found.</p> :
                            appointments.map(apt => (
                                <div key={apt._id} className="relative border p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                                    <div>
                                        <p className="font-bold text-gray-800">{apt.studentId?.name}</p>
                                        <p className="text-sm text-gray-600">{new Date(apt.date).toLocaleDateString()} at {apt.time || "Not Scheduled"}</p>
                                        <p className="text-gray-700 mt-1 italic">"{apt.reason}"</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {apt.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleAppointmentStatus(apt._id, 'approved')}
                                                    className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors"
                                                >
                                                    <CheckCircle className="h-4 w-4" /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleAppointmentStatus(apt._id, 'rejected')}
                                                    className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors"
                                                >
                                                    <XCircle className="h-4 w-4" /> Reject
                                                </button>
                                            </>
                                        )}
                                        {/* Highlight badge for pending/new items */}
                                        {apt.status === 'pending' && <span className="absolute top-4 right-4 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span></span>}
                                        {apt.status !== 'pending' && (
                                            <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${apt.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {apt.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvisorDashboard;
