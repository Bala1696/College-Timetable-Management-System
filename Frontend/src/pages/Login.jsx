import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Lock, Mail } from 'lucide-react';
import { validate, authSchemas } from '../utils/validation';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Joi Validation
        const validationErrors = validate({ email, password }, authSchemas.login);
        if (validationErrors) {
            setError(Object.values(validationErrors)[0]);
            return;
        }

        setIsLoading(true);
        const result = await login(email, password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message || 'Invalid credentials');
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Sign in to your account to continue accessing the system."
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-center animate-shake">
                        ⚠️ {error}
                    </div>
                )}

                <div className="space-y-4">
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        icon={Mail}
                        autoComplete="email"
                    />

                    <div className="space-y-1.5">
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            icon={Lock}
                            autoComplete="current-password"
                        />
                        <div className="flex justify-end">
                            <Link
                                to="/forgot-password"
                                className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    isLoading={isLoading}
                >
                    Sign in
                </Button>

                {/* "Create an account" link removed to maintain invitation-only access */}
            </form>
        </AuthLayout>
    );
};

export default Login;
