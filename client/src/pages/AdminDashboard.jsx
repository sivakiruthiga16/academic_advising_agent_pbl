import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserPlus, User, Loader2, PlusCircle, BookOpen, Trash2, Shield, Edit2, X, CheckCircle, XCircle } from 'lucide-react';
import StudentForm from '../components/StudentForm';

const AdminDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('students');
    const [students, setStudents] = useState([]);
    const [advisors, setAdvisors] = useState([]);
    const [loading, setLoading] = useState(true);

    const [assignmentData, setAssignmentData] = useState({ studentId: '', advisorId: '' });
    const [recordData, setRecordData] = useState({ studentId: '', semester: '', subjects: [{ name: '', marks: '' }] });

    // New States for User Creation
    const [createStudentData, setCreateStudentData] = useState({ name: '', email: '', department: '', password: '', advisorId: '', cgpa: '' });
    const [createAdvisorData, setCreateAdvisorData] = useState({ name: '', email: '', department: '', password: '' });

    // Editing States
    const [editingStudent, setEditingStudent] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingAdvisor, setEditingAdvisor] = useState(null);
    const [advisorEditData, setAdvisorEditData] = useState({ name: '', email: '', department: '' });
    const [appointments, setAppointments] = useState([]);
    const [viewingAppointment, setViewingAppointment] = useState(null);

    // Fetch student's existing record when studentId changes in actions tab
    useEffect(() => {
        if (activeTab === 'actions' && recordData.studentId && recordData.semester) {
            fetchExistingRecord();
        }
    }, [recordData.studentId, recordData.semester, activeTab]);

    const fetchExistingRecord = async () => {
        try {
            const res = await axios.get(`/api/academic/records/${recordData.studentId}`);
            if (res.data && res.data.length > 0) {
                // Find record for current semester if possible, else just use the latest
                const existing = res.data.find(r => r.semester === recordData.semester) || res.data[0];
                if (existing) {
                    setRecordData({
                        studentId: recordData.studentId,
                        semester: existing.semester,
                        cgpa: existing.cgpa,
                        subjects: existing.subjects.length > 0 ? existing.subjects : [{ name: '', marks: '' }]
                    });
                }
            }
        } catch (err) {
            console.error("Failed to fetch existing records");
        }
    };

    useEffect(() => {
        const path = location.pathname;
        if (path.includes('/students')) setActiveTab('students');
        else if (path.includes('/advisors')) setActiveTab('advisors');
        else if (path.includes('/manage-users')) setActiveTab('manage-users');
        else if (path.includes('/appointments')) setActiveTab('appointments');
        else if (path.includes('/actions')) setActiveTab('actions');
        else setActiveTab('students'); // Default or root

        fetchData();
    }, [location.pathname]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'students') navigate('/admin/students');
        else if (tab === 'advisors') navigate('/admin/advisors');
        else if (tab === 'manage-users') navigate('/admin/manage-users');
        else if (tab === 'appointments') navigate('/admin/appointments');
        else if (tab === 'actions') navigate('/admin');
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [studentsRes, advisorsRes, appointmentsRes] = await Promise.all([
                axios.get('/api/admin/students'),
                axios.get('/api/admin/advisors'),
                axios.get('/api/appointments')
            ]);
            setStudents(studentsRes.data);
            setAdvisors(advisorsRes.data);
            setAppointments(appointmentsRes.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAppointmentStatus = async (id, status) => {
        try {
            const res = await axios.put(`/api/appointments/${id}`, { status });
            setAppointments(appointments.map(app => app._id === id ? res.data : app));
            if (viewingAppointment && viewingAppointment._id === id) {
                setViewingAppointment(res.data);
            }
            toast.success(`Appointment ${status}`);
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleDeleteAppointment = async (id) => {
        if (!window.confirm('Are you sure you want to delete this appointment?')) return;
        try {
            await axios.delete(`/api/appointments/${id}`);
            setAppointments(appointments.filter(app => app._id !== id));
            toast.success('Appointment deleted');
            if (viewingAppointment && viewingAppointment._id === id) setViewingAppointment(null);
        } catch (err) {
            toast.error('Failed to delete appointment');
        }
    };

    const handleAssignAdvisor = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/admin/assign-advisor', assignmentData);
            toast.success('Advisor assigned successfully');
            fetchData();
            setAssignmentData({ studentId: '', advisorId: '' });
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to assign advisor');
        }
    };

    const handleAddRecord = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/admin/academic-records', recordData);
            toast.success('Academic record added');
            setRecordData({ studentId: '', semester: '', subjects: [{ name: '', marks: '' }] });
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to add record');
        }
    };

    const addSubjectField = () => {
        setRecordData({ ...recordData, subjects: [...recordData.subjects, { name: '', marks: '' }] });
    };

    const handleSubjectChange = (index, field, value) => {
        const newSubjects = [...recordData.subjects];
        newSubjects[index][field] = value;
        setRecordData({ ...recordData, subjects: newSubjects });
    };

    // New Handlers
    const handleCreateStudent = async (e) => {
        e.preventDefault();
        if (createStudentData.password.length < 6) return toast.error('Password must be at least 6 chars');
        try {
            await axios.post('/api/admin/create-student', createStudentData);
            toast.success('Student created successfully');
            setCreateStudentData({ name: '', email: '', department: '', password: '', advisorId: '', cgpa: '' });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to create student');
        }
    };

    const handleCreateAdvisor = async (e) => {
        e.preventDefault();
        if (createAdvisorData.password.length < 6) return toast.error('Password must be at least 6 chars');
        try {
            await axios.post('/api/admin/create-advisor', createAdvisorData);
            toast.success('Advisor created successfully');
            setCreateAdvisorData({ name: '', email: '', department: '', password: '' });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to create advisor');
        }
    };

    const handleUpdateAdvisor = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/admin/advisor/${editingAdvisor._id}`, advisorEditData);
            toast.success('Advisor updated successfully');
            setEditingAdvisor(null);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to update advisor');
        }
    };

    const handleDeleteUser = async (id, role) => {
        if (!window.confirm(`Are you sure you want to delete this ${role}?`)) return;
        try {
            await axios.delete(`/api/admin/user/${id}`);
            toast.success('User deleted successfully');
            fetchData();
        } catch (err) {
            toast.error('Failed to delete user');
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>

            <div className="flex space-x-4 border-b overflow-x-auto">
                <button
                    className={`pb-2 px-4 whitespace-nowrap ${activeTab === 'students' ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-gray-500'}`}
                    onClick={() => handleTabChange('students')}
                >
                    Students
                </button>
                <button
                    className={`pb-2 px-4 whitespace-nowrap ${activeTab === 'advisors' ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-gray-500'}`}
                    onClick={() => handleTabChange('advisors')}
                >
                    Advisors
                </button>
                <button
                    className={`pb-2 px-4 whitespace-nowrap ${activeTab === 'manage-users' ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-gray-500'}`}
                    onClick={() => handleTabChange('manage-users')}
                >
                    Manage Users
                </button>
                <button
                    className={`pb-2 px-4 whitespace-nowrap ${activeTab === 'appointments' ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-gray-500'}`}
                    onClick={() => handleTabChange('appointments')}
                >
                    Appointments
                </button>
                <button
                    className={`pb-2 px-4 whitespace-nowrap ${activeTab === 'actions' ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-gray-500'}`}
                    onClick={() => handleTabChange('actions')}
                >
                    Academic Actions
                </button>
            </div>

            {/* Students Tab */}
            {activeTab === 'students' && (
                <div className="bg-white rounded-xl shadow-sm p-6 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b text-gray-500 text-sm">
                                <th className="pb-3">Name</th>
                                <th className="pb-3">Email</th>
                                <th className="pb-3">Department</th>
                                <th className="pb-3">Assigned Advisor</th>
                                <th className="pb-3">CGPA</th>
                                <th className="pb-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student._id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="py-3 font-medium">{student.name}</td>
                                    <td className="py-3 text-gray-600">{student.email}</td>
                                    <td className="py-3 text-gray-600">{student.profile?.department}</td>
                                    <td className="py-3 text-indigo-600">
                                        {student.profile?.advisorId?.name || <span className="text-gray-400 italic">Unassigned</span>}
                                    </td>
                                    <td className="py-3 font-bold">{student.profile?.cgpa || '0.00'}</td>
                                    <td className="py-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingStudent(student);
                                                    setShowEditModal(true);
                                                }}
                                                className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDeleteUser(student._id, 'student')} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Advisors Tab */}
            {activeTab === 'advisors' && (
                <div className="bg-white rounded-xl shadow-sm p-6 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b text-gray-500 text-sm">
                                <th className="pb-3">Name</th>
                                <th className="pb-3">Email</th>
                                <th className="pb-3">Department</th>
                                <th className="pb-3">Students Assigned</th>
                                <th className="pb-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {advisors.map(advisor => (
                                <tr key={advisor._id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="py-3 font-medium">{advisor.name}</td>
                                    <td className="py-3 text-gray-600">{advisor.email}</td>
                                    <td className="py-3 text-gray-600">{advisor.profile?.department}</td>
                                    <td className="py-3 font-bold">{advisor.studentCount || 0}</td>
                                    <td className="py-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingAdvisor(advisor);
                                                    setAdvisorEditData({
                                                        name: advisor.name,
                                                        email: advisor.email,
                                                        department: advisor.profile?.department || ''
                                                    });
                                                }}
                                                className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDeleteUser(advisor._id, 'advisor')} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Manage Users Tab */}
            {activeTab === 'manage-users' && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Create Student Form */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-700">
                                <UserPlus className="h-5 w-5" /> Create Student
                            </h3>
                            <form onSubmit={handleCreateStudent} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={createStudentData.name}
                                            onChange={(e) => setCreateStudentData({ ...createStudentData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Gmail ID</label>
                                        <input
                                            type="email"
                                            className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="student@gmail.com"
                                            value={createStudentData.email}
                                            onChange={(e) => setCreateStudentData({ ...createStudentData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Department</label>
                                        <input
                                            type="text"
                                            className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={createStudentData.department}
                                            onChange={(e) => setCreateStudentData({ ...createStudentData, department: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Initial CGPA</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="10.0"
                                            className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="0.00"
                                            value={createStudentData.cgpa}
                                            onChange={(e) => setCreateStudentData({ ...createStudentData, cgpa: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Password</label>
                                    <input
                                        type="password"
                                        className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={createStudentData.password}
                                        onChange={(e) => setCreateStudentData({ ...createStudentData, password: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-md shadow-indigo-100">
                                    Create Student Account
                                </button>
                            </form>
                        </div>

                        {/* Create Advisor Form */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-teal-700">
                                <Shield className="h-5 w-5" /> Create Advisor
                            </h3>
                            <form onSubmit={handleCreateAdvisor} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                            value={createAdvisorData.name}
                                            onChange={(e) => setCreateAdvisorData({ ...createAdvisorData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Gmail ID</label>
                                        <input
                                            type="email"
                                            className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                            placeholder="advisor@gmail.com"
                                            value={createAdvisorData.email}
                                            onChange={(e) => setCreateAdvisorData({ ...createAdvisorData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Department</label>
                                    <input
                                        type="text"
                                        className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                        value={createAdvisorData.department}
                                        onChange={(e) => setCreateAdvisorData({ ...createAdvisorData, department: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Password</label>
                                    <input
                                        type="password"
                                        className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                        value={createAdvisorData.password}
                                        onChange={(e) => setCreateAdvisorData({ ...createAdvisorData, password: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <button type="submit" className="w-full bg-teal-600 text-white py-2.5 rounded-lg hover:bg-teal-700 transition-colors font-semibold shadow-md shadow-teal-100">
                                    Create Advisor Account
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Unified Advisor Assignment Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <div>
                                <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-700">
                                    <UserPlus className="h-5 w-5" /> Assign Advisor to Student
                                </h3>
                                <p className="text-sm text-gray-500">Connect students with their academic advisors</p>
                            </div>
                            <form onSubmit={handleAssignAdvisor} className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                                <select
                                    className="border p-2 rounded-lg min-w-[200px]"
                                    value={assignmentData.studentId}
                                    onChange={(e) => setAssignmentData({ ...assignmentData, studentId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Student</option>
                                    {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
                                </select>
                                <select
                                    className="border p-2 rounded-lg min-w-[200px]"
                                    value={assignmentData.advisorId}
                                    onChange={(e) => setAssignmentData({ ...assignmentData, advisorId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Advisor</option>
                                    {advisors.map(a => <option key={a._id} value={a._id}>{a.name} ({a.email})</option>)}
                                </select>
                                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
                                    Assign
                                </button>
                            </form>
                        </div>

                        {/* Recent Students Summary List */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b text-gray-400 font-medium">
                                        <th className="pb-2">Name</th>
                                        <th className="pb-2">Department</th>
                                        <th className="pb-2">Current Advisor</th>
                                        <th className="pb-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.slice(0, 5).map(student => (
                                        <tr key={student._id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="py-2.5 font-medium">{student.name}</td>
                                            <td className="py-2.5 text-gray-600">{student.profile?.department}</td>
                                            <td className="py-2.5">
                                                {student.profile?.advisorId?.name ? (
                                                    <span className="text-indigo-600 font-semibold">{student.profile?.advisorId?.name}</span>
                                                ) : (
                                                    <span className="text-gray-400 italic">None</span>
                                                )}
                                            </td>
                                            <td className="py-2.5">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${student.profile?.advisorId ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {student.profile?.advisorId ? 'Assigned' : 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
                <div className="bg-white rounded-xl shadow-sm p-6 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b text-gray-500 text-sm">
                                <th className="pb-3">Student Name</th>
                                <th className="pb-3">Advisor Name</th>
                                <th className="pb-3">Date</th>
                                <th className="pb-3">Time</th>
                                <th className="pb-3">Reason</th>
                                <th className="pb-3">Created At</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.length === 0 ? (
                                <tr><td colSpan="8" className="py-4 text-center text-gray-500">No appointments found.</td></tr>
                            ) : (
                                appointments.map(apt => (
                                    <tr key={apt._id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="py-3 font-medium">{apt.studentId?.name || 'Unknown'}</td>
                                        <td className="py-3 text-gray-600">{apt.advisorId?.name || 'Unknown'}</td>
                                        <td className="py-3 text-gray-600">{new Date(apt.date).toLocaleDateString()}</td>
                                        <td className="py-3 text-gray-600">{apt.time}</td>
                                        <td className="py-3 text-gray-600 max-w-xs truncate" title={apt.reason}>{apt.reason}</td>
                                        <td className="py-3 text-gray-500 text-xs">{apt.createdAt ? new Date(apt.createdAt).toLocaleDateString() : 'N/A'}</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold capitalize ${apt.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                apt.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {apt.status}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setViewingAppointment(apt)}
                                                    className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                                                    title="View"
                                                >
                                                    <BookOpen className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateAppointmentStatus(apt._id, 'approved')}
                                                    className="text-green-600 hover:bg-green-50 p-1.5 rounded-lg transition-colors"
                                                    title="Approve"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateAppointmentStatus(apt._id, 'rejected')}
                                                    className="text-orange-600 hover:bg-orange-50 p-1.5 rounded-lg transition-colors"
                                                    title="Cancel/Reject"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAppointment(apt._id)}
                                                    className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Academic Actions Tab */}
            {activeTab === 'actions' && (
                <div className="space-y-6">
                    {/* Academic Performance Management Section */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-8 border-b pb-4">
                            <div className="bg-indigo-100 p-2.5 rounded-xl">
                                <BookOpen className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Academic Performance Management</h3>
                                <p className="text-sm text-gray-500">Manage student CGPA and subject-wise records</p>
                            </div>
                        </div>

                        <form onSubmit={handleAddRecord} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Select Student</label>
                                    <select
                                        className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-indigo-500 outline-none transition-all"
                                        value={recordData.studentId}
                                        onChange={(e) => setRecordData({ ...recordData, studentId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Student</option>
                                        {students.map(s => <option key={s._id} value={s._id}>{s.name} - {s.profile?.department}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Semester</label>
                                    <input
                                        type="text"
                                        className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-indigo-500 outline-none transition-all"
                                        placeholder="e.g. 4th Semester"
                                        value={recordData.semester}
                                        onChange={(e) => setRecordData({ ...recordData, semester: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Overall CGPA</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="10"
                                        className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-indigo-500 outline-none transition-all font-mono font-bold text-indigo-600"
                                        placeholder="0.00"
                                        value={recordData.cgpa || ''}
                                        onChange={(e) => setRecordData({ ...recordData, cgpa: e.target.value })}
                                    />
                                    <span className="text-[10px] text-gray-400 mt-1 block">Value between 0.0 - 10.0</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-2xl">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Subject-wise Marks</label>
                                    <button
                                        type="button"
                                        onClick={addSubjectField}
                                        className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-1.5 shadow-sm"
                                    >
                                        <PlusCircle className="h-3.5 w-3.5" /> Add Subject
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {recordData.subjects.map((sub, index) => (
                                        <div key={index} className="flex gap-4 items-center animate-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="Subject Name (e.g. Data Structures)"
                                                    className="w-full border-2 border-white p-2.5 rounded-xl focus:border-indigo-400 outline-none shadow-sm"
                                                    value={sub.name}
                                                    onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="w-32">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    placeholder="Marks"
                                                    className="w-full border-2 border-white p-2.5 rounded-xl focus:border-indigo-400 outline-none shadow-sm text-center font-bold"
                                                    value={sub.marks}
                                                    onChange={(e) => handleSubjectChange(index, 'marks', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            {recordData.subjects.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newSubjects = recordData.subjects.filter((_, i) => i !== index);
                                                        setRecordData({ ...recordData, subjects: newSubjects });
                                                    }}
                                                    className="text-red-400 hover:text-red-600 p-1 transition-colors"
                                                >
                                                    <XCircle className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setRecordData({ studentId: '', semester: '', cgpa: '', subjects: [{ name: '', marks: '' }] })}
                                    className="px-8 py-3 rounded-xl border-2 border-gray-100 text-gray-500 font-bold hover:bg-gray-50 transition-all"
                                >
                                    Reset Form
                                </button>
                                <button type="submit" className="px-10 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:translate-y-[-1px] active:translate-y-[1px] transition-all">
                                    Save Performance Data
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Additional Unified Info or Quick Actions could go here */}
                </div>
            )}
            {/* Student Edit Modal */}
            {showEditModal && editingStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl transform transition-all">
                        <StudentForm
                            initialData={editingStudent}
                            onStudentAdded={() => {
                                setShowEditModal(false);
                                setEditingStudent(null);
                                fetchData();
                            }}
                            onCancel={() => {
                                setShowEditModal(false);
                                setEditingStudent(null);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Advisor Edit Modal */}
            {editingAdvisor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
                        <div className="bg-teal-600 p-6 text-white flex justify-between items-center">
                            <h3 className="text-xl font-bold">Edit Advisor</h3>
                            <button onClick={() => setEditingAdvisor(null)}><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleUpdateAdvisor} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full border p-2 rounded-lg"
                                    value={advisorEditData.name}
                                    onChange={(e) => setAdvisorEditData({ ...advisorEditData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    className="w-full border p-2 rounded-lg"
                                    value={advisorEditData.email}
                                    onChange={(e) => setAdvisorEditData({ ...advisorEditData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Department</label>
                                <input
                                    type="text"
                                    className="w-full border p-2 rounded-lg"
                                    value={advisorEditData.department}
                                    onChange={(e) => setAdvisorEditData({ ...advisorEditData, department: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setEditingAdvisor(null)} className="flex-1 py-2 text-gray-500 font-bold border rounded-lg">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-teal-600 text-white font-bold rounded-lg shadow-lg shadow-teal-100 hover:bg-teal-700">Update Advisor</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Appointment View Modal */}
            {viewingAppointment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
                        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                            <h3 className="text-xl font-bold">Appointment Details</h3>
                            <button onClick={() => setViewingAppointment(null)}><X className="h-5 w-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-500 font-medium">Appointment ID</label>
                                    <p className="font-mono text-gray-800">{viewingAppointment._id}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 font-medium">Status</label>
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold capitalize ${viewingAppointment.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        viewingAppointment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {viewingAppointment.status}
                                    </span>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 font-medium">Date</label>
                                    <p className="font-medium">{new Date(viewingAppointment.date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 font-medium">Time</label>
                                    <p className="font-medium">{viewingAppointment.time}</p>
                                </div>
                            </div>
                            <hr />
                            <div>
                                <label className="text-sm text-gray-500 font-medium">Student</label>
                                <p className="font-medium text-lg">{viewingAppointment.studentId?.name}</p>
                                <p className="text-sm text-gray-500">{viewingAppointment.studentId?.email}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 font-medium">Advisor</label>
                                <p className="font-medium text-lg">{viewingAppointment.advisorId?.name}</p>
                                <p className="text-sm text-gray-500">{viewingAppointment.advisorId?.email}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <label className="text-sm text-gray-500 font-medium mb-1 block">Reason</label>
                                <p className="text-gray-700 italic">"{viewingAppointment.reason}"</p>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => setViewingAppointment(null)}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
