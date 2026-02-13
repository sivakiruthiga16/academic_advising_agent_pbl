import { useState } from 'react';
import axios from 'axios';
import { User, Mail, Building, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentForm = ({ onStudentAdded, onCancel, initialData }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        email: initialData?.email || '',
        password: '',
        department: initialData?.profile?.department || initialData?.department || '',
        role: 'student',
        cgpa: initialData?.profile?.cgpa || initialData?.cgpa || ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Only require password for new students
        if (!initialData && formData.password.length < 6) {
            return toast.error('Password must be 6+ chars');
        }

        if (formData.cgpa < 0 || formData.cgpa > 10) {
            return toast.error('CGPA must be between 0 and 10');
        }

        setLoading(true);
        try {
            if (initialData) {
                await axios.put(`/api/admin/student/${initialData._id}`, formData);
                toast.success('Student updated successfully');
            } else {
                await axios.post('/api/admin/create-student', formData);
                toast.success('Student added successfully');
            }
            onStudentAdded();
        } catch (err) {
            toast.error(err.response?.data?.msg || `Failed to ${initialData ? 'update' : 'add'} student`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-indigo-600 p-6 text-white">
                <h3 className="text-xl font-bold">{initialData ? 'Edit Student' : 'Add New Student'}</h3>
                <p className="text-indigo-100 text-sm mt-1">
                    {initialData ? 'Update student profile information' : 'Create a new student profile and access credentials'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                required
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Student Name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="email"
                                required
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="student@university.edu"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Department</label>
                        <div className="relative">
                            <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                required
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="e.g. Computer Science"
                                value={formData.department}
                                onChange={e => setFormData({ ...formData, department: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">CGPA (0 - 10)</label>
                        <div className="relative">
                            <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="10.0"
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="0.00"
                                value={formData.cgpa}
                                onChange={e => setFormData({ ...formData, cgpa: e.target.value })}
                            />
                        </div>
                    </div>

                    {!initialData && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Temporary Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="text" // Visible for admin convenience when creating
                                    required
                                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Min 6 characters"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors"
                    >
                        {loading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Profile' : 'Create Profile')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StudentForm;
