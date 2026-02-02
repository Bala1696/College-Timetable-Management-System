import React, { useState } from 'react';
import { X, LogOut, Lock } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { validate, authSchemas } from '../utils/validation';

const SettingsModal = ({ isOpen, onClose }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
        setError('');
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Confirm Password Match (UX Helper)
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            setError("New passwords don't match");
            return;
        }

        // Joi Validation
        const validationErrors = validate(
            { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword },
            authSchemas.changePassword
        );
        if (validationErrors) {
            setError(Object.values(validationErrors)[0]);
            return;
        }

        try {
            await api.post('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setSuccess('Password changed successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-gray-900">Settings</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Change Password Section */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-gray-500" />
                        Change Password
                    </h3>

                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
                    {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4">{success}</div>}

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <Input
                            type="password"
                            name="currentPassword"
                            placeholder="Current Password"
                            value={passwordData.currentPassword}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            type="password"
                            name="newPassword"
                            placeholder="New Password"
                            value={passwordData.newPassword}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            type="password"
                            name="confirmNewPassword"
                            placeholder="Confirm New Password"
                            value={passwordData.confirmNewPassword}
                            onChange={handleChange}
                            required
                        />
                        <Button type="submit" className="w-full">Update Password</Button>
                    </form>
                </div>

                <div className="border-t border-gray-100 pt-4">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
