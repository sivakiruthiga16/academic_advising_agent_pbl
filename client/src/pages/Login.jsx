import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GraduationCap, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, googleLogin } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const role = await login(formData.email, formData.password);
            
            if (role === 'admin') {
                toast.success('Welcome Admin!');
                navigate('/admin');
            } else {
                toast.success('Welcome back!');
                if (role === 'advisor') navigate('/advisor');
                else if (role === 'student') navigate('/student');
            }

        } catch (err) {
            toast.error(err.response?.data?.msg || 'Login Failed');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const token = await result.user.getIdToken();
            
            const role = await googleLogin(token);
            if (role === 'admin') {
                toast.success('Welcome Admin!');
                navigate('/admin');
            } else {
                toast.success('Google Login Successful!');
                if (role === 'advisor') navigate('/advisor');
                else if (role === 'student') navigate('/student');
            }
        } catch (err) {
            console.error("Google Login Detailed Error:", err);
            const errorMsg = err.response?.data?.msg || err.message || 'Google Login Failed';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-300">
                <div className="bg-indigo-600 p-8 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -m-8 w-24 h-24 bg-indigo-500 rounded-full blur-2xl"></div>

                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-xl backdrop-blur-md mb-4 border border-white/30">
                        <GraduationCap className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Sign In</h2>
                    <p className="text-indigo-100 mt-2 font-medium">Academic Advising Agent</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none bg-gray-50/50 hover:bg-white"
                                    placeholder="name@university.edu"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-semibold text-gray-600">Password</label>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none bg-gray-50/50 hover:bg-white"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 flex items-center justify-center space-x-4">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-sm text-gray-400 font-medium">OR</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700 disabled:opacity-70"
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                            <span>Sign in with Google</span>
                        </button>
                    </div>

                    {/* Registration link removed */}
                </div>
            </div>
        </div>
    );
};

export default Login;
