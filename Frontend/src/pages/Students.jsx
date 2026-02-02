import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users,
    Search,
    Download,
    Plus,
    Edit2,
    Trash2,
    ChevronLeft,
    FileText,
    Table as TableIcon,
    FileSpreadsheet,
    GraduationCap
} from "lucide-react";
import {
    getStudentsApi,
    createStudentApi,
    updateStudentApi,
    deleteStudentApi,
    exportExcelApi,
    exportPDFApi,
    exportWordApi,
} from "../api/studentApi";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";

const YEARS = ["I", "II", "III", "IV"];

export default function Students() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const role = user?.role?.toUpperCase();
    const token = localStorage.getItem("token");

    const [year, setYear] = useState("I");
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    const [form, setForm] = useState({
        rollNumber: "",
        studentName: "",
        remarks: "",
    });
    const [editId, setEditId] = useState(null);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await getStudentsApi(year, token);
            setStudents(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Fetch failed", error);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
        setEditId(null);
        setForm({ rollNumber: "", studentName: "", remarks: "" });
    }, [year]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!["ADMIN", "FACULTY", "SUPPORTING_STAFF"].includes(role)) {
            return alert("Access denied");
        }

        const payload = { ...form, year };

        try {
            if (editId) {
                await updateStudentApi(editId, payload, token);
            } else {
                await createStudentApi(payload, token);
            }

            setForm({ rollNumber: "", studentName: "", remarks: "" });
            setEditId(null);
            fetchStudents();
        } catch (err) {
            alert(err.response?.data?.message || "Operation failed");
        }
    };

    const handleDelete = async (id) => {
        if (role !== "ADMIN") return;
        if (!window.confirm("Are you sure you want to delete this student?")) return;

        try {
            await deleteStudentApi(id, token);
            fetchStudents();
        } catch {
            alert("Failed to delete student");
        }
    };

    const handleExport = async (type) => {
        try {
            let res;
            if (type === "excel") res = await exportExcelApi(year, token);
            if (type === "pdf") res = await exportPDFApi(year, token);
            if (type === "word") res = await exportWordApi(year, token);

            const mimeTypes = {
                excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                pdf: 'application/pdf',
                word: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            };

            const blob = new Blob([res.data], { type: mimeTypes[type] });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `students-${year}.${type === "excel" ? "xlsx" : type === "word" ? "docx" : "pdf"}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            alert("Failed to export file");
        }
    };

    const filtered = students.filter(
        (s) =>
            s.studentName?.toLowerCase().includes(search.toLowerCase()) ||
            s.rollNumber?.toLowerCase().includes(search.toLowerCase())
    );

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
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100">
                                    Academic Records
                                </span>
                                <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Student Management
                                </span>
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 font-display tracking-tight leading-none mb-3">
                                Student Repository
                            </h1>
                            <p className="text-gray-500 font-medium max-w-lg">
                                Manage academic profiles, enrollment data, and generate filtered reports across all active academic years.
                            </p>
                        </div>
                    </div>

                    <div className="flex bg-white/70 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-gray-200/60 overflow-x-auto max-w-full">
                        {YEARS.map(y => (
                            <button
                                key={y}
                                onClick={() => setYear(y)}
                                className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all whitespace-nowrap uppercase tracking-wider ${year === y
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 ring-1 ring-primary-500/50'
                                    : 'text-gray-500 hover:bg-gray-100/50 hover:text-gray-700'
                                    }`}
                            >
                                {y} Year
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Bar */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-end">
                    <div className="xl:col-span-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            placeholder="Search by name or roll..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none shadow-sm"
                        />
                    </div>

                    <div className="xl:col-span-2">
                        {["ADMIN", "FACULTY", "SUPPORTING_STAFF"].includes(role) && (
                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                    <input
                                        placeholder="Roll No"
                                        value={form.rollNumber}
                                        onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
                                        className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        placeholder="Student Name"
                                        value={form.studentName}
                                        onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                                        className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        placeholder="Remarks"
                                        value={form.remarks}
                                        onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                                        className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                                    />
                                </div>
                                <Button type="submit" className="px-8 shadow-lg shadow-primary-500/20">
                                    {editId ? "Update" : "Add Student"}
                                </Button>
                            </form>
                        )}
                    </div>

                    <div className="xl:col-span-1 flex justify-end gap-2">
                        <button
                            onClick={() => handleExport("excel")}
                            title="Excel Export"
                            className="p-3 bg-white hover:bg-emerald-50 text-emerald-600 rounded-2xl border border-gray-200 hover:border-emerald-200 shadow-sm transition-all"
                        >
                            <FileSpreadsheet className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => handleExport("pdf")}
                            title="PDF Export"
                            className="p-3 bg-white hover:bg-red-50 text-red-600 rounded-2xl border border-gray-200 hover:border-red-200 shadow-sm transition-all"
                        >
                            <FileText className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => handleExport("word")}
                            title="Word Export"
                            className="p-3 bg-white hover:bg-blue-50 text-blue-600 rounded-2xl border border-gray-200 hover:border-blue-200 shadow-sm transition-all"
                        >
                            <TableIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <Card className="border-0 shadow-premium p-0 overflow-hidden rounded-[32px] bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">S.No</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Roll Number</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Full Name</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Remarks</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Management</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="py-24 text-center">
                                            <div className="animate-spin w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full mx-auto mb-4"></div>
                                            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">Loading Database...</p>
                                        </td>
                                    </tr>
                                ) : filtered.length > 0 ? (
                                    filtered.map((s, index) => (
                                        <tr key={s.id} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-6 text-sm font-bold text-gray-400 tabular-nums">{index + 1}</td>
                                            <td className="px-8 py-6 font-display font-black text-gray-900">{s.rollNumber}</td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold shadow-inner">
                                                        {s.studentName.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-700">{s.studentName}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm text-gray-500 font-medium italic">{s.remarks || "—"}</td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {["ADMIN", "FACULTY", "SUPPORTING_STAFF"].includes(role) && (
                                                        <button
                                                            onClick={() => {
                                                                setEditId(s.id);
                                                                setForm({
                                                                    rollNumber: s.rollNumber,
                                                                    studentName: s.studentName,
                                                                    remarks: s.remarks || "",
                                                                });
                                                            }}
                                                            className="p-2.5 bg-white text-yellow-600 hover:bg-yellow-50 rounded-xl border border-gray-100 transition-all font-bold"
                                                            title="Edit Record"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {role === "ADMIN" && (
                                                        <button
                                                            onClick={() => handleDelete(s.id)}
                                                            className="p-2.5 bg-white text-red-600 hover:bg-red-50 rounded-xl border border-gray-100 transition-all font-bold"
                                                            title="Delete Permanently"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-24 text-center">
                                            <GraduationCap className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                            <h3 className="text-lg font-bold text-gray-400">No records found for {year} Year</h3>
                                            <p className="text-sm text-gray-400 mt-1 italic">Try adjusting your filters or adding a new student.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
