import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TimetableGrid from '../components/TimetableGrid';
import { TimetableModal } from '../components/TimetableModal';
import { FlaskConical, Clock, Filter, Download, Plus, ChevronLeft, Calendar, Info } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const LAB_ROOMS = [
    'GEN AI LABORATORY',
    'DATA SCIENCE LABORATORY',
    'MACHINE LEARNING LABORATORY',
    'DEEP LEARNING LABORATORY',
];

const LaboratoryDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [timetableData, setTimetableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLab, setSelectedLab] = useState(LAB_ROOMS[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [filters, setFilters] = useState({
        semester: 'All', // Show all classes in this lab regardless of semester
        section: 'All'
    });

    useEffect(() => {
        fetchLabTimetable();
    }, [selectedLab]);

    const fetchLabTimetable = async () => {
        setLoading(true);
        try {
            const response = await api.get('/timetables');
            const filtered = response.data.filter(item => item.venue === selectedLab);
            setTimetableData(filtered);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClick = (day, periodId) => {
        setModalData({
            semester: 'I',
            section: 'A',
            day: day,
            period_number: periodId,
            end_period: periodId,
            start_time: '',
            end_time: '',
            course_code: '',
            subject_name: '',
            faculty_name: user?.username || '',
            venue: selectedLab,
            type: 'Lab',
            batch: 'Both'
        });
        setIsModalOpen(true);
    };

    const handleEditClick = (entry) => {
        setModalData(entry);
        setIsModalOpen(true);
    };

    const handleDuplicateClick = (entry) => {
        const { id, createdAt, updatedAt, ...duplicateData } = entry;
        setModalData(duplicateData);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Delete this lab class?')) {
            try {
                await api.delete(`/timetables/${id}`);
                fetchLabTimetable();
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
                fetchLabTimetable();
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
                    fetchLabTimetable();
                }
            }
        } catch (error) {
            alert('Error saving. Please check conflicts.');
        }
    };

    const handleExport = async (type) => {
        try {
            // Similar to general export but with lab-specific context
            const response = await api.get(`/export/${type}`, {
                params: { venue: selectedLab },
                responseType: 'blob'
            });
            const blob = new Blob([response.data], {
                type: type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${selectedLab.replace(/ /g, '_')}_Timetable.${type === 'pdf' ? 'pdf' : 'docx'}`);
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
        <div className="min-h-screen bg-[#fafbfc] pb-24 pt-28 px-4 md:px-12 font-sans">
            <div className="max-w-[1400px] mx-auto space-y-10">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex items-start gap-5">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="mt-1 p-2.5 bg-white hover:bg-gray-50 rounded-2xl transition-all text-gray-400 hover:text-primary-600 shadow-sm border border-gray-100 group"
                        >
                            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 bg-primary-50 text-primary-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-primary-100">
                                    Laboratory Management
                                </span>
                                <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Resource View
                                </span>
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 font-display tracking-tight leading-none mb-3">
                                Laboratory Timetable
                            </h1>
                            <p className="text-gray-500 font-medium max-w-lg">
                                Real-time scheduling and resource allocation for specialized computing laboratories.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        {['admin', 'hod', 'faculty', 'supporting_staff'].includes(user?.role) && (
                            <Button
                                onClick={() => handleAddClick('Monday', 1)}
                                className="w-full sm:w-auto px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl shadow-xl shadow-primary-500/25 border-0 font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Schedule Lab Hour
                            </Button>
                        )}

                        <div className="flex bg-white/70 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-gray-200/60 overflow-x-auto max-w-full">
                            {LAB_ROOMS.map(lab => (
                                <button
                                    key={lab}
                                    onClick={() => setSelectedLab(lab)}
                                    className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all whitespace-nowrap uppercase tracking-wider ${selectedLab === lab
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 ring-1 ring-primary-500/50'
                                        : 'text-gray-500 hover:bg-gray-100/50 hover:text-gray-700'
                                        }`}
                                >
                                    {lab.split(' ')[0]}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <Card className="border-0 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-gray-100/80 p-0 overflow-hidden rounded-[32px] bg-white">
                    <div className="p-10 border-b border-gray-100 bg-[#fdfdfe] relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-40"></div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-primary-600 rounded-2xl shadow-lg shadow-primary-500/20 text-white">
                                        <FlaskConical className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-primary-600 font-black tracking-[0.2em] text-[10px] uppercase">
                                            Department of AI & Data Science
                                        </div>
                                        <h2 className="text-3xl font-black text-gray-900 font-display tracking-tight mt-0.5">
                                            {selectedLab}
                                        </h2>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm font-bold text-gray-400 pl-14">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-primary-500" />
                                        AY 2025-26
                                    </div>
                                    <div className="h-4 w-px bg-gray-200"></div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-indigo-500" />
                                        Even Semester
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 lg:self-end">
                                <Button
                                    variant="secondary"
                                    onClick={() => handleExport('pdf')}
                                    className="px-5 py-2.5 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold shadow-sm transition-all text-xs"
                                >
                                    <Download className="w-4 h-4 mr-2 text-red-500" />
                                    PDF Export
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => handleExport('word')}
                                    className="px-5 py-2.5 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold shadow-sm transition-all text-xs"
                                >
                                    <Download className="w-4 h-4 mr-2 text-blue-500" />
                                    DOC Export
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 bg-white">
                        {loading ? (
                            <div className="py-24 text-center">
                                <div className="relative inline-block">
                                    <div className="animate-spin w-14 h-14 border-[5px] border-primary-100 border-t-primary-600 rounded-full mx-auto"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                                    </div>
                                </div>
                                <p className="text-gray-400 font-bold mt-6 tracking-widest uppercase text-[10px]">Updating Resource Schedule...</p>
                            </div>
                        ) : (
                            <div className="rounded-[24px] border border-gray-100 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
                                <TimetableGrid
                                    timetableData={timetableData}
                                    isEditable={['admin', 'hod', 'faculty', 'supporting_staff'].includes(user?.role)}
                                    isLabView={true}
                                    onAdd={handleAddClick}
                                    onEdit={handleEditClick}
                                    onDuplicate={handleDuplicateClick}
                                    onDelete={handleDeleteClick}
                                />
                            </div>
                        )}
                    </div>
                </Card>

                {/* Additional Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <Card className="p-8 border-0 shadow-xl shadow-gray-200/40 bg-gradient-to-br from-primary-600 to-primary-800 text-white relative overflow-hidden group rounded-[28px]">
                        <div className="absolute -top-10 -right-10 opacity-10 group-hover:scale-125 transition-transform duration-700">
                            <FlaskConical className="w-48 h-48" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                                    <Filter className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary-100">Lab Statistics</span>
                            </div>
                            <h4 className="text-primary-100 font-bold text-xs uppercase tracking-[0.2em] mb-1">Total Utilization</h4>
                            <div className="text-5xl font-black mb-2 tracking-tighter tabular-nums">{timetableData.length}</div>
                            <p className="text-primary-100/70 text-sm font-medium">Unique clusters scheduled this week</p>
                        </div>
                    </Card>

                    {user?.role !== 'supporting_staff' && (
                        <Card className="p-8 border-0 shadow-xl shadow-gray-200/40 bg-white border-l-4 border-indigo-500 rounded-[28px]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-gray-900 font-black text-lg font-display leading-tight">Operational Hours</h4>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Lab Accessibility</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-sm font-bold text-gray-600">Standard Shifts</span>
                                    <span className="text-xs font-black text-indigo-600 bg-white px-3 py-1 rounded-lg">9:10 AM — 4:45 PM</span>
                                </div>
                            </div>
                        </Card>
                    )}

                    <Card className="p-8 border-0 shadow-xl shadow-gray-200/40 bg-white border-l-4 border-emerald-500 rounded-[28px]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                <Info className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-gray-900 font-black text-lg font-display leading-tight">Key Legend</h4>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Visual Identifiers</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col gap-1">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mb-1"></div>
                                <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest text-[9px]">Theory Session</span>
                            </div>
                            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col gap-1">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full mb-1"></div>
                                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest text-[9px]">Lab Practice</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <TimetableModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={modalData}
            />
        </div>
    );
};

export default LaboratoryDashboard;
