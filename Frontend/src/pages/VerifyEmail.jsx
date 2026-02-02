import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AuthLayout from '../components/layouts/AuthLayout';
import Button from '../components/ui/Button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');
    // Use a ref to prevent double execution in React Strict Mode
    const verifyCalled = React.useRef(false);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token provided.');
            return;
        }

        if (verifyCalled.current) return;
        verifyCalled.current = true;

        const verify = async () => {
            try {
                // Check if user is already verified first to avoid errors? 
                // Alternatively, the backend should handle idempotent requests gracefully.
                const response = await api.get(`/auth/verify-email/${token}`);
                setStatus('success');
                setMessage(response.data.message || 'Email verified successfully!');
            } catch (error) {
                console.error('Verification error:', error);

                // Detailed error handling
                if (error.response) {
                    // Server responded with a status code outside 2xx
                    setStatus('error');
                    setMessage(error.response.data.message || 'Verification failed. The link may be invalid or expired.');
                } else if (error.request) {
                    // Request was made but no response received
                    setStatus('error');
                    setMessage('Unable to connect to the server. Please check your internet connection.');
                } else {
                    // Something happened in setting up the request
                    setStatus('error');
                    setMessage('An error occurred while setting up the request.');
                }
            }
        };

        verify();
    }, [token]);

    const renderContent = () => {
        if (status === 'verifying') {
            return (
                <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="w-16 h-16 text-primary-600 animate-spin mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900">Verifying your email...</h3>
                    <p className="text-gray-500 mt-2">Please wait a moment while we confirm your identity.</p>
                </div>
            );
        }

        if (status === 'success') {
            return (
                <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                        {message}
                    </p>
                    <Button className="w-full sm:w-auto px-8" onClick={() => navigate('/login')}>
                        Continue to Login
                    </Button>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                    {message}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Button variant="secondary" onClick={() => navigate('/login')}>
                        Back to Login
                    </Button>
                    <Button variant="primary" onClick={() => navigate('/signup')}>
                        Register Again
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <AuthLayout
            title="Email Verification"
            subtitle="Confirming your identity securely."
        >
            {renderContent()}
        </AuthLayout>
    );
};

export default VerifyEmail;
