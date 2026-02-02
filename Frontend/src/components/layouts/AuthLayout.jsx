import React from 'react';
import { BookOpen } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen w-full flex bg-gray-50">
            {/* Left Side - Hero/Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-secondary-800 opacity-90" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80')] bg-cover bg-center mix-blend-overlay" />

                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-12 text-center text-white">
                    <div className="h-16 w-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-8 ring-1 ring-white/20 shadow-2xl">
                        <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4 font-display">AI&DS Timetable System</h1>
                    <p className="text-lg text-primary-100 max-w-md">
                        Manage schedules, faculties, and academic resources efficiently with our intelligent coordination platform.
                    </p>
                </div>

                {/* Decorative Circles */}
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary-500/30 rounded-full blur-3xl" />
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
                <div className="w-full max-w-md space-y-8 animate-fade-in text-center sm:text-left">
                    <div className="lg:hidden flex justify-center mb-6">
                        <div className="h-12 w-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                    </div>

                    <div className="text-center sm:text-left">
                        <h2 className="text-2xl font-bold text-gray-900 font-display">{title}</h2>
                        {subtitle && <p className="mt-2 text-sm text-gray-500">{subtitle}</p>}
                    </div>

                    {children}

                    <div className="mt-8 text-center text-xs text-gray-400">
                        &copy; {new Date().getFullYear()} College Timetable System. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
