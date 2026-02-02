import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FlaskConical, Clock, Calendar, Layout, ArrowRight, User as UserIcon, GraduationCap } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const SupportingStaffDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [labStats, setLabStats] = useState({ totalClasses: 0, pendingTasks: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await api.get('/timetables');
            const labClasses = response.data.filter(item => item.type === 'Lab');
            setLabStats({
                totalClasses: labClasses.length,
                activeLabs: new Set(labClasses.map(c => c.venue)).size
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Hero Section */}
            <Card className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white border-none shadow-premium overflow-hidden relative">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                                Support Personnel
                            </span>
                        </div>
                        <h1 className="text-4xl font-black font-display text-white tracking-tight">
                            Staff Dashboard
                        </h1>
                        <p className="text-emerald-50 mt-3 text-lg font-medium max-w-xl">
                            Managing technical laboratory resources and ensuring optimal environment for practical learning.
                        </p>
                    </div>
                    <div className="flex items-center bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-xl">
                        <div className="text-center px-4 border-r border-white/10">
                            <div className="text-3xl font-black text-white">{labStats.totalClasses || 0}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">Lab Slots</div>
                        </div>
                        <div className="text-center px-4">
                            <div className="text-3xl font-black text-white">{labStats.activeLabs || 0}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">Active Labs</div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Action Area */}
                <div className="lg:col-span-2 space-y-8">
                    <Card title="Laboratory Management" subtitle="Quick access to lab resources">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div
                                onClick={() => navigate('/lab-dashboard')}
                                className="group cursor-pointer p-6 bg-gray-50 hover:bg-white rounded-3xl border border-gray-100 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 relative overflow-hidden"
                            >
                                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
                                    <FlaskConical className="w-32 h-32 text-emerald-900" />
                                </div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                                        <FlaskConical className="w-6 h-6" />
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">Lab Timetable</h3>
                                <p className="text-sm text-gray-500 font-medium">View and manage schedules for all computing laboratories.</p>
                            </div>

                            <div
                                onClick={() => navigate('/students')}
                                className="group cursor-pointer p-6 bg-gray-50 hover:bg-white rounded-3xl border border-gray-100 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 relative overflow-hidden"
                            >
                                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
                                    <GraduationCap className="w-32 h-32 text-indigo-900" />
                                </div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-4 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                                        <GraduationCap className="w-6 h-6" />
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">Student Database</h3>
                                <p className="text-sm text-gray-500 font-medium">Access student enrollment lists and generate reports.</p>
                            </div>

                            <div className="group p-6 bg-gray-50 rounded-3xl border border-gray-100 opacity-60">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-4 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/20">
                                        <Layout className="w-6 h-6" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">Resource Inventory</h3>
                                <p className="text-sm text-gray-500 font-medium italic">Advanced resource tracking coming soon in next update.</p>
                            </div>
                        </div>
                    </Card>

                    <Card title="Weekly Overview" className="overflow-hidden">
                        <div className="p-12 text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h4 className="text-lg font-bold text-gray-900">Department Schedule</h4>
                            <p className="text-gray-500 max-w-xs mx-auto mt-2">The integrated master schedule is available via the laboratory viewport.</p>
                            <Button
                                variant="outline"
                                onClick={() => navigate('/lab-dashboard')}
                                className="mt-6 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            >
                                Open Laboratory View
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    <Card className="bg-white border-0 shadow-xl shadow-gray-200/40 p-8 rounded-[32px]">
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                            <div className="h-16 w-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center border border-white ring-4 ring-gray-50 shadow-inner">
                                <UserIcon className="h-8 w-8 text-gray-500" />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-gray-900 leading-tight">{user?.username}</h4>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Active Personnel</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-gray-50 text-gray-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 rounded-xl transition-colors">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Shift Status</p>
                                    <p className="text-sm font-bold text-gray-900">Morning (9:10 - 4:45)</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Quick Shortcuts</h5>
                                <div className="space-y-3">
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                                        <button
                                            key={day}
                                            onClick={() => navigate('/lab-dashboard')}
                                            className="w-full flex items-center justify-between p-3 hover:bg-emerald-50 rounded-xl transition-all group"
                                        >
                                            <span className="text-sm font-bold text-gray-600 group-hover:text-emerald-700">{day} Schedule</span>
                                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SupportingStaffDashboard;
