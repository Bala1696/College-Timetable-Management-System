import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import TimetableGrid from '../components/TimetableGrid';
import { TimetableModal } from '../components/TimetableModal';
import { Plus, Clock, Calendar, Filter, FlaskConical, GraduationCap } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

import SettingsModal from '../components/SettingsModal';

const FacultyDashboard = ({ user, isGuest = false }) => {
    const navigate = useNavigate();
    const [timetableData, setTimetableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ semester: 'I', section: 'A' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        fetchTimetable();
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

    const handleAddClick = (day, periodId) => {
        if (isGuest) return;
        setModalData({
            semester: filters.semester,
            section: filters.section,
            day: day,
            period_number: periodId,
            end_period: periodId,
            start_time: '',
            end_time: '',
            course_code: '',
            subject_name: '',
            faculty_name: user?.username || '',
            venue: '',
            type: 'Theory',
            batch: 'Both'
        });
        setIsModalOpen(true);
    };

    const handleEditClick = (entry) => {
        if (isGuest) return;
        setModalData(entry);
        setIsModalOpen(true);
    };

    const handleDuplicateClick = (entry) => {
        if (isGuest) return;
        const { id, createdAt, updatedAt, ...duplicateData } = entry;
        setModalData(duplicateData);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (isGuest) return;
        if (window.confirm('Delete this class?')) {
            try {
                await api.delete(`/timetables/${id}`);
                fetchTimetable();
            } catch (error) {
                console.error(error);
            }
        }
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
            console.error('Export failed', error);
            alert('Export failed');
        }
    };

    return (
        <div className="space-y-8">
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            <Card className={`bg-gradient-to-br ${isGuest ? 'from-slate-700 to-slate-900' : 'from-indigo-600 to-indigo-800'} text-white border-none shadow-premium`}>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-white">
                            {isGuest ? 'Department Timetable' : 'Faculty Workspace'}
                        </h1>
                        <p className="text-indigo-100 mt-2 text-lg">
                            {isGuest
                                ? 'View and track academic schedules for the AI & DS Department.'
                                : 'Manage your academic schedule and course deliveries effectively.'}
                        </p>
                    </div>
                    {!isGuest && (
                        <div className="flex gap-3">
                            <Button
                                onClick={() => setIsSettingsOpen(true)}
                                className="bg-white/10 text-white hover:bg-white/20 border-white/20 shadow-lg backdrop-blur-sm"
                                size="lg"
                            >
                                <Filter className="w-5 h-5 mr-2" />
                                Settings
                            </Button>
                            <Button
                                onClick={() => handleAddClick('Monday', 1)}
                                className="bg-white text-indigo-700 hover:bg-indigo-50 border-none shadow-lg"
                                size="lg"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add Class Manually
                            </Button>
                            <Button
                                onClick={() => navigate('/lab-dashboard')}
                                className="bg-white/10 text-white hover:bg-white/20 border-white/20 shadow-lg backdrop-blur-sm"
                                size="lg"
                            >
                                <FlaskConical className="w-5 h-5 mr-2" />
                                Lab View
                            </Button>
                            <Button
                                onClick={() => navigate('/students')}
                                className="bg-white/10 text-white hover:bg-white/20 border-white/20 shadow-lg backdrop-blur-sm"
                                size="lg"
                            >
                                <GraduationCap className="w-5 h-5 mr-2" />
                                Students
                            </Button>
                        </div>
                    )}
                </div>
            </Card>

            <Card className="border-0 shadow-lg shadow-gray-200/50 ring-1 ring-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-gray-100 pb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 font-display">
                            <span className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <Calendar className="w-5 h-5" />
                            </span>
                            Active Timetable
                        </h2>
                        <p className="text-sm text-gray-500 mt-1 pl-11">Viewing schedule for Semester {filters.semester} - Section {filters.section}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-200 shadow-sm">
                            <select
                                value={filters.semester}
                                onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                                className="bg-transparent border-none text-sm font-semibold focus:ring-0 text-gray-700 py-2 pl-3 pr-8 cursor-pointer hover:text-primary-600 transition-colors"
                            >
                                {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].map(s => (
                                    <option key={s} value={s}>Semester {s}</option>
                                ))}
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
                            isEditable={!isGuest && user?.role !== 'student'} // View only for guest or students
                            onAdd={handleAddClick}
                            onEdit={handleEditClick}
                            onDuplicate={handleDuplicateClick}
                            onDelete={handleDeleteClick}
                        />
                    )}
                </div>
            </Card>

            {!isGuest && (
                <TimetableModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleModalSubmit}
                    initialData={modalData}
                />
            )}
        </div>
    );
};

export default FacultyDashboard;
