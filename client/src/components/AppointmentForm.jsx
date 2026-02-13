import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, User, MessageCircle, Send, ArrowRight, Clock, Shield } from 'lucide-react';

const AppointmentForm = ({ advisorId, onAppointmentAdded }) => {
    const [formData, setFormData] = useState({
        advisorId: advisorId || '',
        date: '',
        reason: ''
    });
    const [advisors, setAdvisors] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!advisorId) {
            const fetchAdvisors = async () => {
                try {
                    const res = await axios.get('http://localhost:5000/api/auth/advisors', {
                        headers: { 'x-auth-token': localStorage.getItem('token') }
                    });
                    setAdvisors(res.data);
                } catch (err) {
                    console.error(err);
                }
            };
            fetchAdvisors();
        } else {
            setFormData(prev => ({ ...prev, advisorId }));
        }
    }, [advisorId]);

    const { date, reason } = formData;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/appointments', formData, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            toast.success('Consultation request sent!');
            setFormData({ advisorId: advisorId || '', date: '', reason: '' });
            if (onAppointmentAdded) onAppointmentAdded();
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to book slot');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Calendar className="h-20 w-20" />
                </div>

                <h3 className="text-xl font-bold mb-1 text-gray-900 tracking-tight flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                    Request Consultation
                </h3>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-8">Schedule a session with your advisor</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!advisorId && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Assigned Advisor</label>
                            <div className="relative group">
                                <Shield className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                <select
                                    name="advisorId"
                                    value={formData.advisorId}
                                    onChange={(e) => setFormData({ ...formData, advisorId: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none"
                                    required
                                >
                                    <option value="">-- Choose Advisor --</option>
                                    {advisors.map(adv => (
                                        <option key={adv._id} value={adv._id}>{adv.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Select Date</label>
                        <div className="relative group">
                            <Clock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Context / Reason</label>
                        <div className="relative group">
                            <MessageCircle className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                            <textarea
                                value={reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                placeholder="What would you like to discuss?"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all min-h-[120px] resize-none"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <span>Confirm Request</span>
                                <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AppointmentForm;
