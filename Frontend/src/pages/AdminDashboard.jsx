import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import TimetableGrid from '../components/TimetableGrid';
import { BookOpen, Users, Clock, Filter, Download, Plus, FlaskConical, GraduationCap } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

import SettingsModal from '../components/SettingsModal';
import { TimetableModal } from '../components/TimetableModal';

const StatsCard = ({ title, value, icon: Icon, color, bg }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all duration-300 group">
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1 group-hover:text-gray-700 transition-colors">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900 font-display">{value}</h3>
        </div>
        <div className={`p-4 rounded-xl ${bg} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 ${color}`} />
        </div>
    </div>

);

const AdminDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [timetableData, setTimetableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ semester: 'I', section: 'A' });
    const [stats, setStats] = useState({ courses: 0, faculty: 0, staff: 0, users: 0 });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);

    useEffect(() => {
        fetchTimetable();
        fetchStats();
    }, [filters]);

    const fetchTimetable = async () => {
        setLoading(true);
        try {
            const response = await api.get('/timetables', { params: filters });
            setTimetableData(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Keep default values on error
        }
    };

    const handleAddClick = (day, p) => {
        setModalData({
            semester: filters.semester,
            section: filters.section,
            day,
            period_number: p,
            end_period: p,
            start_time: '',
            end_time: '',
            course_code: '',
            subject_name: '',
            faculty_name: '',
            venue: '',
            type: 'Theory',
            batch: 'Both'
        });
        setIsModalOpen(true);
    };

    const handleDuplicate = (entry) => {
        const { id, createdAt, updatedAt, ...duplicateData } = entry;
        setModalData(duplicateData);
        setIsModalOpen(true);
    };

    const handleModalSubmit = async (data) => {
        try {
            const { repeatDays, ...baseData } = data;

            if (data.id) {
                await api.put(`/timetables/${data.id}`, baseData);
                setIsModalOpen(false);
                fetchTimetable();
            } else {
                const daysToCreate = [baseData.day, ...(repeatDays || [])];
                const uniqueDays = [...new Set(daysToCreate)];

                let successCount = 0;
                let errors = [];

                for (const day of uniqueDays) {
                    try {
                        await api.post('/timetables', { ...baseData, day });
                        successCount++;
                    } catch (err) {
                        errors.push(`${day}: ${err.response?.data?.message || err.message}`);
                    }
                }

                if (errors.length > 0) {
                    alert(`Created ${successCount} entries. Errors:\n${errors.join('\n')}`);
                }

                if (successCount > 0) {
                    setIsModalOpen(false);
                    fetchTimetable();
                }
            }
        } catch (error) {
            alert('Error saving. Please check conflicts.');
        }
    };

    const handleExport = async (type) => {
        try {
            const response = await api.get(`/export/${type}`, {
                params: filters,
                responseType: 'blob'
            });

            const blob = new Blob([response.data], {
                type: type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `timetable_${filters.semester}_${filters.section}.${type === 'pdf' ? 'pdf' : 'docx'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export timetable. Please try again.');
        }
    };

    return (
        <div className="space-y-8">
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-display">Dashboard Overview</h1>
                    <p className="text-gray-500 mt-1">Welcome back, Administrator. Here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50 shadow-sm"
                        onClick={() => setIsSettingsOpen(true)}
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Settings
                    </Button>
                    <Button onClick={() => handleAddClick('Monday', 1)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add New
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Active Courses"
                    value={stats.courses}
                    icon={BookOpen}
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
                <StatsCard
                    title="Faculty Members"
                    value={stats.faculty}
                    icon={Users}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                />
                <StatsCard
                    title="Support Staff"
                    value={stats.staff}
                    icon={Users}
                    color="text-purple-600"
                    bg="bg-purple-50"
                />
                <StatsCard
                    title="Weekly Periods"
                    value={stats.periods}
                    icon={Clock}
                    color="text-orange-600"
                    bg="bg-orange-50"
                />
            </div>

            {/* Timetable Section */}
            <Card className="border-0 shadow-lg shadow-gray-200/50 ring-1 ring-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-gray-100 pb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 font-display">
                            <span className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <Clock className="w-5 h-5" />
                            </span>
                            Master Timetable
                        </h2>
                        <p className="text-sm text-gray-500 mt-1 pl-11">View and manage academic schedules across all departments</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Custom Select Dropdown UI could go here, using standard select for now but styled */}
                        <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-200 shadow-sm">
                            <select
                                value={filters.semester}
                                onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                                className="bg-transparent border-none text-sm font-semibold focus:ring-0 text-gray-700 py-2 pl-3 pr-8 cursor-pointer hover:text-primary-600 transition-colors"
                            >
                                <option value="I">Semester I</option>
                                <option value="II">Semester II</option>
                                <option value="III">Semester III</option>
                                <option value="IV">Semester IV</option>
                                <option value="V">Semester V</option>
                                <option value="VI">Semester VI</option>
                                <option value="VII">Semester VII</option>
                                <option value="VIII">Semester VIII</option>
                            </select>
                            <div className="w-px h-5 bg-gray-300 mx-1"></div>
                            <select
                                value={filters.section}
                                onChange={(e) => setFilters({ ...filters, section: e.target.value })}
                                className="bg-transparent border-none text-sm font-semibold focus:ring-0 text-gray-700 py-2 pl-3 pr-8 cursor-pointer hover:text-primary-600 transition-colors"
                            >
                                <option value="A">Section A</option>
                                <option value="B">Section B</option>
                            </select>
                        </div>

                        <Button variant="secondary" size="icon" onClick={() => handleExport('pdf')} title="Export PDF">
                            <span className="font-bold text-xs text-red-600">PDF</span>
                        </Button>
                        <Button variant="secondary" size="icon" onClick={() => handleExport('word')} title="Export Word">
                            <span className="font-bold text-xs text-blue-600">DOC</span>
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-100">
                    {loading ? (
                        <div className="p-20 text-center">
                            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-500 font-medium">Loading timetable...</p>
                        </div>
                    ) : (
                        <TimetableGrid
                            timetableData={timetableData}
                            isEditable={true}
                            onAdd={handleAddClick}
                            onEdit={(entry) => {
                                setModalData(entry);
                                setIsModalOpen(true);
                            }}
                            onDuplicate={handleDuplicate}
                            onDelete={async (id) => {
                                if (window.confirm('Delete this class?')) {
                                    try {
                                        await api.delete(`/timetables/${id}`);
                                        fetchTimetable();
                                    } catch (error) {
                                        console.error(error);
                                    }
                                }
                            }}
                        />
                    )}
                </div>
            </Card>

            <TimetableModal
                isOpen={isSettingsOpen ? false : isModalOpen} // Simple toggle logic
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={modalData}
            />

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Quick Actions" subtitle="Common administrative tasks">
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <Button variant="outline" onClick={() => navigate('/admin/faculty')} className="h-auto py-4 flex flex-col gap-2 hover:border-primary-500 hover:bg-primary-50">
                            <Users className="w-6 h-6 text-primary-600" />
                            <span>Manage Faculty</span>
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/admin/staff')} className="h-auto py-4 flex flex-col gap-2 hover:border-purple-500 hover:bg-purple-50">
                            <Users className="w-6 h-6 text-purple-600" />
                            <span>Manage Staff</span>
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/lab-dashboard')} className="h-auto py-4 flex flex-col gap-2 hover:border-orange-500 hover:bg-orange-50">
                            <FlaskConical className="w-6 h-6 text-orange-600" />
                            <span>Laboratory Timetable</span>
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/students')} className="h-auto py-4 flex flex-col gap-2 hover:border-indigo-500 hover:bg-indigo-50">
                            <GraduationCap className="w-6 h-6 text-indigo-600" />
                            <span>Student Management</span>
                        </Button>
                    </div>
                </Card>

                <Card title="System Status" subtitle="Overview of system health">
                    <div className="space-y-4 mt-2">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-green-900">Database Connection</span>
                            </div>
                            <span className="text-xs font-bold text-green-700 bg-white px-2 py-1 rounded">Active</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm font-medium text-blue-900">Email Service</span>
                            </div>
                            <span className="text-xs font-bold text-blue-700 bg-white px-2 py-1 rounded">Ready</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
