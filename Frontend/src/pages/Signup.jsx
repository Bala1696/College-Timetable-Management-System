import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { validate, authSchemas } from '../utils/validation';

const Signup = () => {
    const [searchParams] = useSearchParams();
    const invitationToken = searchParams.get('invitation_token');

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'faculty'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Joi Validation
        const schema = invitationToken ? authSchemas.joinInvitation : authSchemas.signup;
        const dataToValidate = invitationToken
            ? { username: formData.username, password: formData.password }
            : formData;

        const validationErrors = validate(dataToValidate, schema);
        if (validationErrors) {
            setError(Object.values(validationErrors)[0]);
            return;
        }

        setLoading(true);
        try {
            if (invitationToken) {
                await api.post('/auth/join-invitation', {
                    token: invitationToken,
                    username: formData.username,
                    password: formData.password
                });
            } else {
                await api.post('/auth/register', formData);
            }

            alert('Account set up successful! Please check your email to verify your account.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title={invitationToken ? "Complete Your Registration" : "Create Account"}
            subtitle={invitationToken ? "Finalize your account setup for the AI & DS Department." : "Join the academic management system today."}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 animate-shake">
                        {error}
                    </div>
                )}

                <Input
                    label="Full Name / Display Name"
                    name="username"
                    placeholder="John Doe"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />

                {!invitationToken && (
                    <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        placeholder="john@college.edu"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                )}

                <Input
                    label="Password"
                    type="password"
                    name="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                {!invitationToken && (
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">I am a...</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'faculty' })}
                                className={`p-3 text-sm font-medium rounded-lg border transition-all ${formData.role === 'faculty'
                                    ? 'bg-primary-50 border-primary-500 text-primary-700 ring-1 ring-primary-500'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Faculty Member
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'supporting_staff' })}
                                className={`p-3 text-sm font-medium rounded-lg border transition-all ${formData.role === 'supporting_staff'
                                    ? 'bg-primary-50 border-primary-500 text-primary-700 ring-1 ring-primary-500'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Supporting Staff
                            </button>
                        </div>
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full mt-2"
                    size="lg"
                    isLoading={loading}
                >
                    {invitationToken ? "Complete Signup" : "Create Account"}
                </Button>

                <p className="text-center text-sm text-gray-600 pt-2">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline">
                        Sign in instead
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default Signup;
