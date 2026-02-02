import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import FacultyDashboard from './FacultyDashboard';
import SupportingStaffDashboard from './SupportingStaffDashboard';
import { LogOut, User, Menu, Bell } from 'lucide-react';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [isScrolled, setIsScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans pb-20">
            {/* Global Navbar */}
            <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-glass border-b border-gray-200/50' : 'bg-white border-b border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/20">
                            C
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight hidden md:block font-display">
                            College Timetable
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100">
                            <Bell className="w-5 h-5" />
                        </button>

                        <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

                        {user ? (
                            <div className="flex items-center gap-3 pl-2">
                                <div className="text-right hidden md:block">
                                    <div className="text-sm font-semibold text-gray-900 leading-none">{user?.username}</div>
                                    <div className="text-xs text-primary-600 font-medium mt-0.5 uppercase tracking-wide">{user?.role}</div>
                                </div>
                                <div className="h-10 w-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border border-white ring-2 ring-gray-100 shadow-sm relative group">
                                    <User className="h-5 w-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
                                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={logout}
                                    className="ml-2 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                    title="Logout"
                                >
                                    <LogOut className="h-5 w-5" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login">
                                    <Button variant="primary" size="sm">
                                        Sign In
                                    </Button>
                                </Link>
                                {/* "Create Account" link removed as per user request */}
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto pt-24 px-4 md:px-8 animate-fade-in">
                {user ? (
                    user.role === 'admin' || user.role === 'hod' ? (
                        <AdminDashboard user={user} />
                    ) : user.role === 'supporting_staff' ? (
                        <SupportingStaffDashboard user={user} />
                    ) : (
                        <FacultyDashboard user={user} />
                    )
                ) : (
                    <FacultyDashboard user={null} isGuest={true} />
                )}
            </main>
        </div>
    );
};

export default Dashboard;
