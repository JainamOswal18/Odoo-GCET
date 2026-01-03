import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import api from '../services/api';
import './SignIn.css';

export const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        if (!tokenParam) {
            showToast('error', 'Invalid reset link');
            navigate('/signin');
        } else {
            setToken(tokenParam);
        }
    }, [searchParams, navigate, showToast]);

    const getPasswordStrength = (pwd: string): { strength: number; label: string; color: string } => {
        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (pwd.length >= 12) strength++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
        if (/\d/.test(pwd)) strength++;
        if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

        if (strength <= 1) return { strength: 1, label: 'Weak', color: '#EF4444' };
        if (strength <= 3) return { strength: 2, label: 'Medium', color: '#F59E0B' };
        return { strength: 3, label: 'Strong', color: '#10B981' };
    };

    const passwordStrength = getPasswordStrength(password);

    const validate = () => {
        const newErrors: { password?: string; confirmPassword?: string } = {};

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/.test(password)) {
            newErrors.password = 'Password must include uppercase, lowercase, number, and special character';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate() || !token) return;

        setLoading(true);

        try {
            await api.resetPassword(token, password);
            showToast('success', 'Password reset successfully! Please sign in.');
            navigate('/signin');
        } catch (error: any) {
            showToast('error', error.message || 'Failed to reset password. The link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <Card className="auth-card">
                <div className="auth-logo">
                    <div className="logo-circle">HR</div>
                </div>

                <h1 className="auth-title">Reset Password</h1>
                <p className="auth-subtitle">Enter your new password</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div>
                        <Input
                            type="password"
                            label="New Password"
                            placeholder="Create a strong password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={errors.password}
                            required
                        />
                        {password && (
                            <div style={{ marginTop: '8px' }}>
                                <div style={{
                                    height: '4px',
                                    background: '#E5E7EB',
                                    borderRadius: '2px',
                                    overflow: 'hidden',
                                    marginBottom: '4px',
                                }}>
                                    <div
                                        style={{
                                            width: `${(passwordStrength.strength / 3) * 100}%`,
                                            height: '100%',
                                            backgroundColor: passwordStrength.color,
                                            transition: 'all 0.3s ease',
                                        }}
                                    />
                                </div>
                                <span style={{ 
                                    fontSize: '12px', 
                                    color: passwordStrength.color,
                                    fontWeight: '500',
                                }}>
                                    {passwordStrength.label}
                                </span>
                            </div>
                        )}
                    </div>

                    <Input
                        type="password"
                        label="Confirm Password"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={errors.confirmPassword}
                        required
                    />

                    <div style={{
                        background: 'rgba(217, 70, 239, 0.1)',
                        border: '1px solid rgba(217, 70, 239, 0.3)',
                        borderRadius: '8px',
                        padding: '12px',
                        fontSize: '13px',
                        marginBottom: '8px',
                    }}>
                        <p style={{ margin: '0 0 6px 0', fontWeight: '600' }}>Password Requirements:</p>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            <li>At least 8 characters</li>
                            <li>One uppercase letter</li>
                            <li>One lowercase letter</li>
                            <li>One number</li>
                            <li>One special character (@$!%*?&#)</li>
                        </ul>
                    </div>

                    <Button type="submit" variant="primary" fullWidth loading={loading}>
                        Reset Password
                    </Button>
                </form>

                <p className="auth-footer">
                    <Link to="/signin" className="auth-link">Back to Sign In</Link>
                </p>
            </Card>
        </div>
    );
};
