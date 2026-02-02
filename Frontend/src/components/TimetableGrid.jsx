import React from 'react';
import { Edit2, Trash2, Plus, Coffee, Info, Copy } from 'lucide-react';

const PERIODS = [
    { id: 1, time: '9.10 - 9.50' },
    { id: 2, time: '9.50 - 10.40' },
    { id: 3, time: '11.00 - 11.50' },
    { id: 4, time: '11.50 - 12.40' },
    { id: 5, time: '1.30 - 2.15' },
    { id: 6, time: '2.15 - 3.00' },
    { id: 7, time: '3.15 - 4.00' },
    { id: 8, time: '4.00 - 4.45' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TimetableGrid = ({ timetableData, onAdd, onEdit, onDelete, onDuplicate, isEditable }) => {

    const getEntry = (day, periodId) => {
        return timetableData.find(t =>
            t.day === day &&
            periodId >= t.period_number &&
            periodId <= (t.end_period || t.period_number)
        );
    };

    const isStartOfSpan = (day, periodId) => {
        const entry = getEntry(day, periodId);
        return entry && entry.period_number === periodId;
    };

    const isInSpan = (day, periodId) => {
        const entry = getEntry(day, periodId);
        return entry && entry.period_number !== periodId;
    };

    const getSpanCount = (entry) => {
        if (!entry.end_period || entry.end_period === entry.period_number) return 1;
        return entry.end_period - entry.period_number + 1;
    };

    return (
        <div className="bg-white min-w-full inline-block align-middle overflow-x-auto shadow-xl rounded-2xl border border-gray-200">
            <table className="min-w-[1200px] w-full border-collapse text-xs">
                <thead>
                    {/* Hours Row */}
                    <tr className="bg-[#f8fafc] border-b border-gray-200">
                        <th className="p-4 text-left w-24 font-black uppercase tracking-widest text-[10px] text-gray-400 bg-gray-50/50 sticky left-0 z-20 border-r border-gray-200">Hours</th>
                        <th className="w-20 border-r border-gray-200 bg-gray-50/30"></th>
                        {PERIODS.map(period => (
                            <th key={period.id} className="p-3 text-center font-black text-gray-900 border-r border-gray-200 text-sm">
                                {period.id}
                            </th>
                        ))}
                    </tr>
                    {/* Time Row */}
                    <tr className="bg-white border-b border-gray-200 font-bold">
                        <th className="p-4 text-left w-24 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white sticky left-0 z-20 border-r border-gray-200">Day</th>
                        <th className="p-2 text-center w-20 border-r border-gray-200 bg-gray-50/20 text-[9px] font-black text-primary-600 uppercase tracking-tighter">9:00 - 9:10</th>
                        {PERIODS.map(period => (
                            <th key={period.id} className="p-2 text-center min-w-[130px] border-r border-gray-100 text-[10px] font-bold text-gray-500 bg-[#fdfdfe]">
                                {period.time}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                    {DAYS.map((day) => (
                        <tr key={day} className="group border-b border-gray-200">
                            {/* Day Header */}
                            <td className="p-3 font-black text-gray-800 uppercase tracking-tighter sticky left-0 bg-white z-10 border-r border-gray-300 text-center w-24 group-hover:bg-gray-50 transition-colors">
                                {day.substring(0, 3)}
                            </td>

                            {/* Meditation Vertical Column */}
                            <td className={`p-1 border-r border-gray-300 text-center vertical-text w-20 bg-gray-50/30 group-hover:bg-gray-50 transition-colors`}>
                                <div className="[writing-mode:vertical-lr] rotate-180 mx-auto font-bold text-gray-400 text-[10px] tracking-widest uppercase">
                                    Meditation & News Reading
                                </div>
                            </td>

                            {/* Period Cells */}
                            {PERIODS.map((period) => {
                                const entry = getEntry(day, period.id);

                                // If this period is in the middle of a span, don't render a cell (it's handled by colSpan of the start)
                                if (isInSpan(day, period.id)) {
                                    return null;
                                }

                                const spanCount = entry ? getSpanCount(entry) : 1;

                                return (
                                    <td
                                        key={period.id}
                                        colSpan={spanCount}
                                        className={`p-1 border-r border-gray-200 h-28 align-top relative group/cell transition-all
                                            ${!entry && isEditable ? 'hover:bg-indigo-50/30 cursor-pointer' : ''}
                                        `}
                                        onClick={() => !entry && isEditable && onAdd(day, period.id)}
                                    >
                                        {entry ? (
                                            <div className={`
                                                h-full w-full rounded-lg p-2 flex flex-col justify-between transition-all duration-200 shadow-sm border-2
                                                ${entry.type === 'Theory'
                                                    ? 'bg-blue-50/80 border-blue-200 hover:border-blue-400'
                                                    : 'bg-emerald-50/80 border-emerald-200 hover:border-emerald-400'}
                                                relative group/item
                                            `}>
                                                <div className="flex flex-col gap-0.5">
                                                    <div className={`font-black text-[12px] leading-tight ${entry.type === 'Theory' ? 'text-blue-900' : 'text-emerald-900'}`}>
                                                        {entry.course_code}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-gray-600 line-clamp-2 uppercase">
                                                        ({entry.subject_name})
                                                    </div>
                                                </div>

                                                <div className="mt-auto flex justify-between items-end">
                                                    <div className="text-[9px] font-black text-gray-500 bg-white/60 px-1.5 py-0.5 rounded border border-gray-200 uppercase">
                                                        {entry.venue}
                                                    </div>
                                                    {isEditable && (
                                                        <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); onEdit(entry); }}
                                                                className="p-1 bg-white hover:bg-indigo-50 text-indigo-600 rounded shadow-sm border border-indigo-100"
                                                                title="Edit"
                                                            >
                                                                <Edit2 className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); onDuplicate && onDuplicate(entry); }}
                                                                className="p-1 bg-white hover:bg-emerald-50 text-emerald-600 rounded shadow-sm border border-emerald-100"
                                                                title="Duplicate"
                                                            >
                                                                <Copy className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                                                                className="p-1 bg-white hover:bg-red-50 text-red-600 rounded shadow-sm border border-red-100"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            isEditable && (
                                                <div className="h-full w-full flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity">
                                                    <Plus className="w-4 h-4 text-indigo-400" />
                                                </div>
                                            )
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Footer with Break Legend */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 grid grid-cols-3 gap-4 text-[10px] font-bold text-gray-500">
                <div className="flex items-center gap-2">
                    <Coffee className="w-3 h-3" /> FN Break: 10.40 am - 11.00 am
                </div>
                <div className="flex items-center gap-2">
                    <Coffee className="w-3 h-3" /> Lunch Break: 12.40 pm - 01.30 pm
                </div>
                <div className="flex items-center gap-2">
                    <Coffee className="w-3 h-3" /> AN Break: 03.00 pm - 03.15 pm (Except Sat)
                </div>
            </div>
        </div>
    );
};

export default TimetableGrid;
