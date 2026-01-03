import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import './SignIn.css';

export const SignUp: React.FC = () => {
    const [employeeId, setEmployeeId] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'admin' | 'employee'>('employee');
    const [errors, setErrors] = useState<{
        employeeId?: string;
        email?: string;
        password?: string;
    }>({});

    const { register, loading } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const getPasswordStrength = (pwd: string): { strength: number; label: string; color: string } => {
        let strength = 0;
        if (pwd.length >= 6) strength++;
        if (pwd.length >= 10) strength++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
        if (/\d/.test(pwd)) strength++;
        if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

        if (strength <= 1) return { strength: 1, label: 'Weak', color: 'var(--error-red)' };
        if (strength <= 3) return { strength: 2, label: 'Medium', color: 'var(--warning-yellow)' };
        return { strength: 3, label: 'Strong', color: 'var(--success-green)' };
    };

    const passwordStrength = getPasswordStrength(password);

    const validate = () => {
        const newErrors: { employeeId?: string; email?: string; password?: string } = {};

        if (!employeeId) {
            newErrors.employeeId = 'Employee ID is required';
        }

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email format is invalid';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            // Register stores the user in localStorage
            await register(employeeId, email, password, role);

            // Show success message
            showToast('success', 'Registration successful! Please sign in with your credentials.');

            // Redirect to sign-in page (NOT auto-login)
            navigate('/signin');
        } catch (error: any) {
            console.error('Registration error:', error);
            showToast('error', error.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="auth-container">
            <Card className="auth-card">
                <div className="auth-logo">
                    <div className="logo-circle">HR</div>
                </div>

                <h1 className="auth-title">Create Account</h1>
                <p className="auth-subtitle">Register as an HR Officer or Employee</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <Input
                        type="text"
                        label="Employee ID"
                        placeholder="Enter employee ID"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        error={errors.employeeId}
                        required
                    />

                    <Input
                        type="email"
                        label="Email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={errors.email}
                        required
                    />

                    <div>
                        <Input
                            type="password"
                            label="Password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={errors.password}
                            required
                        />
                        {password && (
                            <div className="password-strength">
                                <div className="strength-bar">
                                    <div
                                        className="strength-fill"
                                        style={{
                                            width: `${(passwordStrength.strength / 3) * 100}%`,
                                            backgroundColor: passwordStrength.color,
                                        }}
                                    />
                                </div>
                                <span className="strength-label" style={{ color: passwordStrength.color }}>
                                    {passwordStrength.label}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="role-selection">
                        <label className="input-label">Role *</label>
                        <div className="radio-group">
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="role"
                                    value="admin"
                                    checked={role === 'admin'}
                                    onChange={() => setRole('admin')}
                                />
                                <span>Admin / HR Officer</span>
                            </label>
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="role"
                                    value="employee"
                                    checked={role === 'employee'}
                                    onChange={() => setRole('employee')}
                                />
                                <span>Employee</span>
                            </label>
                        </div>
                    </div>

                    <Button type="submit" variant="primary" fullWidth loading={loading}>
                        Sign Up
                    </Button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/signin" className="auth-link">Sign In</Link>
                </p>
            </Card>
        </div>
    );
};
