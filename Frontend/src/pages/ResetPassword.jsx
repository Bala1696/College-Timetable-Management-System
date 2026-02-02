import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Lock } from 'lucide-react';
import AuthLayout from '../components/layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage("Passwords don't match");
            setStatus('error'); // Set error status locally for UI feedback
            return;
        }

        setStatus('loading');
        try {
            await api.post(`/auth/reset-password/${token}`, { password });
            setStatus('success');
            setMessage('Password reset successfully. Redirecting...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setStatus('error');
            setMessage('Failed to reset password. Link may be expired.');
        }
    };

    return (
        <AuthLayout
            title="Set New Password"
            subtitle="Please enter your new password below."
        >
            {status === 'success' ? (
                <div className="bg-green-50 border border-green-100 text-green-700 p-4 rounded-lg text-center animate-fade-in">
                    ✅ {message}
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                    {status === 'error' && message && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 animate-shake">
                            {message}
                        </div>
                    )}

                    <Input
                        label="New Password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        icon={Lock}
                    />

                    <Input
                        label="Confirm Password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        icon={Lock}
                    />

                    <Button
                        type="submit"
                        className="w-full"
                        isLoading={status === 'loading'}
                    >
                        Reset Password
                    </Button>
                </form>
            )}
        </AuthLayout>
    );
};

export default ResetPassword;
