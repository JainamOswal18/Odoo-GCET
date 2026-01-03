import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import api from '../services/api';
import './SignIn.css';

export const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const { showToast } = useToast();

    const validate = () => {
        if (!email) {
            setError('Email is required');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Email format is invalid');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        try {
            await api.forgotPassword(email);
            setSubmitted(true);
            showToast('success', 'Password reset link sent! Check your email.');
        } catch (error: any) {
            showToast('error', error.message || 'Failed to send reset link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="auth-container">
                <Card className="auth-card">
                    <div className="auth-logo">
                        <div className="logo-circle">HR</div>
                    </div>

                    <h1 className="auth-title">Check Your Email</h1>
                    <p className="auth-subtitle">Password reset link has been sent</p>

                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '8px',
                        padding: '20px',
                        marginBottom: '20px',
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📧</div>
                        <p style={{ margin: 0, color: '#059669', fontWeight: '500' }}>
                            If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
                        </p>
                    </div>

                    <div style={{
                        background: 'rgba(217, 70, 239, 0.1)',
                        border: '1px solid rgba(217, 70, 239, 0.3)',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '20px',
                        fontSize: '14px',
                    }}>
                        <p style={{ margin: '0 0 8px 0' }}><strong>Next Steps:</strong></p>
                        <ol style={{ margin: 0, paddingLeft: '20px' }}>
                            <li>Check your email inbox (and spam folder)</li>
                            <li>Click the reset link in the email</li>
                            <li>The link expires in 1 hour</li>
                        </ol>
                    </div>

                    <Link to="/signin">
                        <Button variant="primary" fullWidth>
                            Back to Sign In
                        </Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <Card className="auth-card">
                <div className="auth-logo">
                    <div className="logo-circle">HR</div>
                </div>

                <h1 className="auth-title">Forgot Password?</h1>
                <p className="auth-subtitle">Enter your email to receive a reset link</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <Input
                        type="email"
                        label="Email"
                        placeholder="Enter your registered email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={error}
                        required
                    />

                    <Button type="submit" variant="primary" fullWidth loading={loading}>
                        Send Reset Link
                    </Button>
                </form>

                <p className="auth-footer">
                    Remember your password? <Link to="/signin" className="auth-link">Sign In</Link>
                </p>
            </Card>
        </div>
    );
};
