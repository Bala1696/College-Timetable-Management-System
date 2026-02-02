import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { validate, timetableSchema } from '../utils/validation';
import api from '../api/axios';

const PERIOD_TIMES = {
    1: { start: '09:10 AM', end: '09:50 AM' },
    2: { start: '09:50 AM', end: '10:40 AM' },
    3: { start: '11:00 AM', end: '11:50 AM' },
    4: { start: '11:50 AM', end: '12:40 PM' },
    5: { start: '01:30 PM', end: '02:15 PM' },
    6: { start: '02:15 PM', end: '03:00 PM' },
    7: { start: '03:15 PM', end: '04:00 PM' },
    8: { start: '04:00 PM', end: '04:45 PM' }
};

const LAB_ROOMS = [
    'GEN AI LABORATORY',
    'DATA SCIENCE LABORATORY',
    'MACHINE LEARNING LABORATORY',
    'DEEP LEARNING LABORATORY'
];

const TimetableFormData = {
    semester: 'I',
    section: 'A',
    day: 'Monday',
    period_number: 1,
    end_period: 1,
    start_time: '09:10 AM',
    end_time: '09:50 AM',
    course_code: '',
    subject_name: '',
    faculty_name: '',
    lab_name: '', // New field for specific lab room
    venue: '',
    type: 'Theory',
    batch: 'Both',
    repeatDays: []
};

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-900 opacity-75 backdrop-blur-sm"></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                    <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-lg leading-6 font-bold text-gray-900">{title}</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="p-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const TimetableModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState(TimetableFormData);
    const [error, setError] = useState('');
    const [facultyList, setFacultyList] = useState([]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const res = await api.get('/admin/faculty');
                setFacultyList(res.data);
            } catch (err) {
                console.error("Failed to fetch faculty", err);
            }

            if (initialData) {
                setFormData(prev => ({ ...prev, ...initialData }));
                setError('');
            } else {
                setFormData(TimetableFormData);
            }
        };

        if (isOpen) {
            loadInitialData();
        }
    }, [isOpen, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValue = (name === 'period_number' || name === 'end_period') ? parseInt(value) : value;
        setError('');

        setFormData(prev => {
            const updated = { ...prev, [name]: newValue };
            if (name === 'period_number' && updated.end_period < newValue) {
                updated.end_period = newValue;
            }
            return updated;
        });
    };

    const handleDayToggle = (day) => {
        setFormData(prev => {
            const repeatDays = prev.repeatDays.includes(day)
                ? prev.repeatDays.filter(d => d !== day)
                : [...prev.repeatDays, day];
            return { ...prev, repeatDays };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Joi Validation
        const validationErrors = validate(formData, timetableSchema);
        if (validationErrors) {
            setError(Object.values(validationErrors)[0]);
            return;
        }

        // Automatically set times based on periods
        const finalData = { ...formData };
        finalData.start_time = PERIOD_TIMES[formData.period_number].start;
        finalData.end_time = PERIOD_TIMES[formData.end_period || formData.period_number].end;
        onSubmit(finalData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? 'Edit Class' : 'Add Class'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs border border-red-100 animate-shake">
                        {error}
                    </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                        <select name="semester" value={formData.semester} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
                            {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].map(s => (
                                <option key={s} value={s}>Semester {s}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                        <select name="section" value={formData.section} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
                            {['A', 'B'].map(s => (
                                <option key={s} value={s}>Section {s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                        <input type="text" name="course_code" value={formData.course_code} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                        <input type="text" name="subject_name" value={formData.subject_name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" required />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Name</label>
                    <select
                        name="faculty_name"
                        value={formData.faculty_name}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        required
                    >
                        <option value="">Select Faculty</option>
                        {facultyList.map(f => (
                            <option key={f.id} value={f.name}>{f.name}</option>
                        ))}
                    </select>
                </div>

                {formData.type === 'Lab' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lab Room</label>
                        <select
                            name="venue"
                            value={formData.venue}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            required
                        >
                            <option value="">Select Laboratory</option>
                            {LAB_ROOMS.map(lab => (
                                <option key={lab} value={lab}>{lab}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Period</label>
                        <select name="period_number" value={formData.period_number} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                                <option key={p} value={p}>Period {p}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Period (Optional)</label>
                        <select name="end_period" value={formData.end_period || formData.period_number} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                                <option key={p} value={p} disabled={p < formData.period_number}>Period {p}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                        <select name="day" value={formData.day} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select name="type" value={formData.type} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
                            <option value="Theory">Theory</option>
                            <option value="Lab">Lab</option>
                        </select>
                    </div>
                </div>

                {!initialData?.id && (
                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                        <label className="block text-xs font-black uppercase tracking-widest text-indigo-600 mb-3">Repeat class on other days</label>
                        <div className="flex flex-wrap gap-2">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => handleDayToggle(d)}
                                    disabled={d === formData.day}
                                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border ${formData.day === d
                                        ? 'bg-indigo-100 border-indigo-200 text-indigo-400 cursor-not-allowed'
                                        : formData.repeatDays.includes(d)
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                            : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600'
                                        }`}
                                >
                                    {d.substring(0, 3)}
                                </button>
                            ))}
                        </div>
                        <p className="text-[9px] text-gray-400 mt-2 italic font-medium">Selecting days will create duplicate entries for those days.</p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    {formData.type === 'Theory' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Venue (Room)</label>
                            <input type="text" name="venue" value={formData.venue} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" required />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                        <select name="batch" value={formData.batch} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
                            <option value="Both">Both</option>
                            <option value="Odd">Odd</option>
                            <option value="Even">Even</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all">
                        Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-500/30 transition-all">
                        {initialData?.id ? 'Update Class' : 'Add Class'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
