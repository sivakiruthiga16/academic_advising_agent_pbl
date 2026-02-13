import { GraduationCap, Bell, Search, User } from 'lucide-react';

const Navbar = ({ userRole, setUserRole }) => {
    if (!userRole) return null;

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 px-6 py-3">
            <div className="flex justify-between items-center">
                {/* Search / Breadcrumbs Area */}
                <div className="flex items-center gap-6 flex-grow">
                    <div className="relative w-full max-w-md hidden md:block">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Universal search..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Info Area */}
                <div className="flex items-center gap-5">
                    <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-all relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                    </button>

                    <div className="h-8 w-[1px] bg-gray-100 hidden sm:block" />

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-black text-gray-900 leading-none uppercase tracking-tighter">Authorized Session</p>
                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1 italic">{userRole} access activated</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
                            <User className="h-5 w-5" />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
