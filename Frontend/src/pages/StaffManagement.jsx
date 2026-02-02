import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { Pencil, Trash2, Plus, Download, X, Search } from 'lucide-react';

const StaffManagement = () => {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // User role check
    const userRole = JSON.parse(atob(localStorage.getItem('token').split('.')[1])).role;
    const canEdit = ['admin', 'supporting_staff'].includes(userRole); // Assuming functionality based on RBAC
    const canDelete = ['admin'].includes(userRole);

    const [formData, setFormData] = useState({
        name: '',
        designation: '',
        qualification: '',
        experience: '',
        email: '',
        mobileNo: '',
        profilePhoto: null
    });

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const response = await api.get('/admin/staff');
            setStaffList(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching staff', error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'profilePhoto' && files && files[0]) {
            const file = files[0];
            const allowedTypes = /image\/(jpeg|jpg|png|gif)/;

            if (!allowedTypes.test(file.type)) {
                alert('Invalid file type. Only JPEG, JPG, PNG, and GIF are allowed.');
                e.target.value = ''; // Clear the input
                setFormData({ ...formData, profilePhoto: null });
                return;
            }

            setFormData({ ...formData, profilePhoto: file });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'profilePhoto') {
                    if (formData[key]) data.append(key, formData[key]);
                } else {
                    data.append(key, formData[key]);
                }
            });

            if (isEditing) {
                await api.put(`/admin/staff/${formData.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/admin/staff', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            fetchStaff();
            closeModal();
        } catch (error) {
            console.error('Error saving staff', error);
            alert(error.response?.data?.message || 'Error saving staff');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this staff member?')) return;
        try {
            await api.delete(`/admin/staff/${id}`);
            fetchStaff();
        } catch (error) {
            console.error('Error deleting staff', error);
            alert('Error deleting staff');
        }
    };

    const openModal = (staff = null) => {
        if (staff) {
            setFormData(staff);
            setIsEditing(true);
        } else {
            setFormData({
                name: '',
                designation: '',
                qualification: '',
                experience: '',
                email: '',
                mobileNo: '',
                profilePhoto: null
            });
            setIsEditing(false);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    // Filter
    const filteredStaff = staffList.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Supporting Staff Management</h1>
                    <p className="text-gray-500">Manage support staff, technicians and other employees.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => openModal()}><Plus className="w-4 h-4 mr-2" /> Add Staff</Button>
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 uppercase">
                            <tr>
                                <th className="px-6 py-3">S.No</th>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Designation</th>
                                <th className="px-6 py-3">Qualification</th>
                                <th className="px-6 py-3">Contact</th>
                                <th className="px-6 py-3">Experience</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="7" className="text-center p-4">Loading...</td></tr>
                            ) : filteredStaff.length === 0 ? (
                                <tr><td colSpan="7" className="text-center p-4">No staff found</td></tr>
                            ) : (
                                filteredStaff.map((staff, index) => (
                                    <tr key={staff.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">{index + 1}</td>
                                        <td className="px-6 py-4 font-medium flex items-center gap-3">
                                            {staff.profilePhoto ? (
                                                <img src={`http://localhost:5000/uploads/${staff.profilePhoto}`} alt={staff.name} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                    {staff.name.charAt(0)}
                                                </div>
                                            )}
                                            {staff.name}
                                        </td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-semibold">{staff.designation}</span></td>
                                        <td className="px-6 py-4">{staff.qualification}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span>{staff.email}</span>
                                                <span className="text-xs text-gray-500">{staff.mobileNo}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{staff.experience || '-'}</td>
                                        <td className="px-6 py-4 flex gap-2">
                                            {canEdit && (
                                                <button onClick={() => openModal(staff)} className="text-blue-600 hover:text-blue-800">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button onClick={() => handleDelete(staff.id)} className="text-red-600 hover:text-red-800">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">{isEditing ? 'Edit Staff' : 'Add New Staff'}</h2>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="label">Full Name</label>
                                <Input name="name" value={formData.name} onChange={handleInputChange} required />
                            </div>
                            <div>
                                <label className="label">Designation</label>
                                <Input name="designation" value={formData.designation} onChange={handleInputChange} required />
                            </div>
                            <div>
                                <label className="label">Qualification</label>
                                <Input name="qualification" value={formData.qualification} onChange={handleInputChange} required />
                            </div>
                            <div>
                                <label className="label">Email Address</label>
                                <Input type="email" name="email" value={formData.email} onChange={handleInputChange} required disabled={isEditing} />
                            </div>
                            <div>
                                <label className="label">Mobile Number</label>
                                <Input name="mobileNo" value={formData.mobileNo} onChange={handleInputChange} required />
                            </div>
                            <div>
                                <label className="label">Experience</label>
                                <Input name="experience" value={formData.experience} onChange={handleInputChange} placeholder="e.g. 5 Years" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="label">Profile Photo</label>
                                <input type="file" name="profilePhoto" onChange={handleInputChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
                                <Button type="submit">{isEditing ? 'Update Staff' : 'Add Staff'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;
