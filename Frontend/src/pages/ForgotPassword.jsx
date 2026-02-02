import React, { useState } from 'react';
import api from '../api/axios';
import { Mail, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await api.post('/auth/forgot-password', { email });
            setStatus('success');
            setMessage('Password reset link sent to your email.');
        } catch (error) {
            setStatus('error');
            setMessage('Failed to send reset link. User not found.');
        }
    };

    const renderContent = () => {
        if (status === 'success') {
            return (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-green-50 border border-green-100 text-green-700 p-4 rounded-lg flex items-center">
                        <span className="mr-2">✉️</span> {message}
                    </div>
                    <p className="text-sm text-gray-500 text-center">
                        Check your email for the link. It may expire in 15 minutes.
                    </p>
                    <Link to="/login" className="block w-full">
                        <Button className="w-full" variant="outline">Back to Login</Button>
                    </Link>
                </div>
            );
        }

        return (
            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                <Link to="/login" className="inline-flex items-center text-sm text-gray-400 hover:text-gray-600 mb-2 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to Login
                </Link>

                <div className="space-y-2">
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="name@college.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        icon={Mail}
                        error={status === 'error' && message}
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    isLoading={status === 'loading'}
                >
                    Send Reset Link
                </Button>
            </form>
        );
    };

    return (
        <AuthLayout
            title="Reset Password"
            subtitle="Enter your email to receive a password reset link."
        >
            {renderContent()}
        </AuthLayout>
    );
};

export default ForgotPassword;
