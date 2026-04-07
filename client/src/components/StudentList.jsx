import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, MoreVertical, Trash2, UserPlus, BookOpen, ChevronRight, User, Edit2 } from 'lucide-react';
import StudentForm from './StudentForm';

const StudentList = ({ refreshTrigger, onManageRecord, onAssignAdvisor, onStudentUpdated }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingStudent, setEditingStudent] = useState(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/admin/students`, {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                setStudents(res.data);
            } catch (err) {
                console.error('Failed to fetch students', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [refreshTrigger]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this student?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL || ''}/api/admin/students/${id}`, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            setStudents(students.filter(s => s._id !== id));
        } catch (err) {
            console.error('Failed to delete student', err);
        }
    };

    const handleEditSuccess = () => {
        setEditingStudent(null);
        if (onStudentUpdated) onStudentUpdated();
    };

    const filteredStudents = students.filter(s =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-center py-10 text-gray-500">Loading students...</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-grow max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search students..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg">
                    <Filter className="h-4 w-4" />
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Student</th>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4">Advisor</th>
                            <th className="px-6 py-4">CGPA</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredStudents.map(student => (
                            <tr key={student._id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{student.name}</p>
                                            <p className="text-xs text-gray-500">{student.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                        {student.profile?.department || 'General'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {student.profile?.advisorId ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold">
                                                {student.profile.advisorId.name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{student.profile.advisorId.name}</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => onAssignAdvisor(student)}
                                            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 hover:border-amber-200 transition-all"
                                        >
                                            <UserPlus className="h-3 w-3" /> Assign Advisor
                                        </button>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`font-bold ${student.profile?.cgpa >= 7.5 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {student.profile?.cgpa || '0.00'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setEditingStudent(student)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg tooltip"
                                            title="Edit Student"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onManageRecord(student)}
                                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg tooltip"
                                            title="Manage Records"
                                        >
                                            <BookOpen className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(student._id)}
                                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg tooltip"
                                            title="Delete Student"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editingStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl transform transition-all">
                        <StudentForm
                            initialData={editingStudent}
                            onStudentAdded={handleEditSuccess}
                            onCancel={() => setEditingStudent(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentList;
