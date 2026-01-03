import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import './SignIn.css';

export const SignIn: React.FC = () => {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState<{ loginId?: string; password?: string }>({});

    const { login, loading } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const validate = () => {
        const newErrors: { loginId?: string; password?: string } = {};

        if (!loginId) {
            newErrors.loginId = 'Login ID or Email is required';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            await login(loginId, password);
            showToast('success', 'Login successful! Welcome back.');
            navigate('/dashboard');
        } catch (error: any) {
            showToast('error', error.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="auth-container">
            <Card className="auth-card">
                <div className="auth-logo">
                    <div className="logo-circle">HR</div>
                </div>

                <h1 className="auth-title">Sign In to HRMS</h1>
                <p className="auth-subtitle">Enter your credentials to continue</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <Input
                        type="text"
                        label="Login ID / Email"
                        placeholder="Enter your Login ID or Email"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        error={errors.loginId}
                        required
                    />

                    <Input
                        type="password"
                        label="Password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={errors.password}
                        required
                    />

                    <div className="auth-remember">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span>Remember me</span>
                        </label>
                        <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
                    </div>

                    <Button type="submit" variant="primary" fullWidth loading={loading}>
                        Sign In
                    </Button>
                </form>

                <p className="auth-footer">
                    Don't have an account? Contact your HR administrator
                </p>
            </Card>
        </div>
    );
};
