import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import './SignIn.css';

export const SignUp: React.FC = () => {
    const [formData, setFormData] = useState({
        companyName: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    });
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showCredentials, setShowCredentials] = useState(false);
    const [generatedCredentials, setGeneratedCredentials] = useState<{
        loginId: string;
        password: string;
    } | null>(null);

    const { register, loading, user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    // Check if user is admin
    React.useEffect(() => {
        if (user && user.role !== 'Admin') {
            showToast('error', 'Only administrators can register new employees');
            navigate('/dashboard');
        }
    }, [user, navigate, showToast]);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email format is invalid';
        }

        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
            newErrors.phone = 'Invalid phone number format';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            const credentials = await register({ 
                ...formData, 
                avatar: avatar || undefined 
            });
            setGeneratedCredentials(credentials);
            setShowCredentials(true);
            showToast('success', 'Employee registered successfully!');
            
            // Reset form
            setFormData({
                companyName: '',
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
            });
            setAvatar(null);
            setAvatarPreview(null);
        } catch (error: any) {
            showToast('error', error.message || 'Registration failed. Please try again.');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        // Clear error for this field
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors({ ...errors, avatar: 'File size must be less than 5MB' });
                return;
            }
            // Validate file type
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                setErrors({ ...errors, avatar: 'Only JPEG and PNG images are allowed' });
                return;
            }
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
            setErrors({ ...errors, avatar: '' });
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        showToast('success', `${label} copied to clipboard!`);
    };

    return (
        <div className="auth-container">
            <Card className="auth-card signup-card">
                <div className="auth-logo">
                    <div className="logo-circle">HR</div>
                </div>

                <h1 className="auth-title">Register New Employee</h1>
                <p className="auth-subtitle">Create a new employee account</p>

                <div className="auth-note" style={{
                    background: 'rgba(217, 70, 239, 0.1)',
                    border: '1px solid rgba(217, 70, 239, 0.3)',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '20px',
                }}>
                    <div style={{ fontWeight: '600', marginBottom: '8px' }}>📝 Note</div>
                    <ul style={{ fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px', margin: 0 }}>
                        <li>Only HR officers or Admins can register new employees</li>
                        <li>Login ID will be auto-generated in format: <strong>OI[Name][Year][Serial]</strong></li>
                        <li>Initial password will be auto-generated and displayed after registration</li>
                        <li>Employee can login and change their password after first login</li>
                    </ul>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <Input
                        type="text"
                        label="Company Name"
                        name="companyName"
                        placeholder="Enter company name"
                        value={formData.companyName}
                        onChange={handleChange}
                        error={errors.companyName}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Input
                            type="text"
                            label="First Name"
                            name="firstName"
                            placeholder="First name"
                            value={formData.firstName}
                            onChange={handleChange}
                            error={errors.firstName}
                            required
                        />

                        <Input
                            type="text"
                            label="Last Name"
                            name="lastName"
                            placeholder="Last name"
                            value={formData.lastName}
                            onChange={handleChange}
                            error={errors.lastName}
                            required
                        />
                    </div>

                    <Input
                        type="email"
                        label="Email"
                        name="email"
                        placeholder="employee@company.com"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        required
                    />

                    <Input
                        type="tel"
                        label="Phone"
                        name="phone"
                        placeholder="+91 9876543210"
                        value={formData.phone}
                        onChange={handleChange}
                        error={errors.phone}
                        required
                    />

                    <div className="input-group">
                        <label className="input-label">Avatar (Optional)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {avatarPreview && (
                                <img 
                                    src={avatarPreview} 
                                    alt="Avatar preview" 
                                    style={{ 
                                        width: '80px', 
                                        height: '80px', 
                                        borderRadius: '50%', 
                                        objectFit: 'cover',
                                        border: '2px solid #D946EF'
                                    }} 
                                />
                            )}
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/jpg"
                                onChange={handleAvatarChange}
                                className="input-field"
                                style={{ flex: 1 }}
                            />
                        </div>
                        {errors.avatar && (
                            <span style={{ color: 'var(--error-red)', fontSize: '14px', marginTop: '4px' }}>
                                {errors.avatar}
                            </span>
                        )}
                        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                            Max size: 5MB. Formats: JPEG, PNG
                        </p>
                    </div>

                    <Button type="submit" variant="primary" fullWidth loading={loading}>
                        Register Employee
                    </Button>
                </form>

                <p className="auth-footer">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate('/dashboard')}
                        type="button"
                    >
                        Back to Dashboard
                    </Button>
                </p>
            </Card>

            {/* Credentials Modal */}
            {showCredentials && generatedCredentials && (
                <Modal
                    isOpen={showCredentials}
                    onClose={() => {
                        setShowCredentials(false);
                        setGeneratedCredentials(null);
                    }}
                    title="Employee Credentials Generated"
                >
                    <div style={{ padding: '20px' }}>
                        <div style={{
                            background: '#10B981',
                            color: 'white',
                            padding: '12px',
                            borderRadius: '6px',
                            marginBottom: '16px',
                            textAlign: 'center',
                        }}>
                            ✅ Employee account created successfully!
                        </div>

                        <div style={{
                            background: '#FEF3C7',
                            color: '#92400E',
                            padding: '12px',
                            borderRadius: '6px',
                            marginBottom: '20px',
                            fontSize: '14px',
                        }}>
                            ⚠️ Please save these credentials securely. Share them with the employee.
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Login ID:</label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <strong style={{
                                        flex: 1,
                                        padding: '10px',
                                        background: '#f3f4f6',
                                        borderRadius: '4px',
                                    }}>{generatedCredentials.loginId}</strong>
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(generatedCredentials.loginId, 'Login ID')}
                                        style={{
                                            padding: '8px 12px',
                                            background: '#D946EF',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        📋 Copy
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Initial Password:</label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <strong style={{
                                        flex: 1,
                                        padding: '10px',
                                        background: '#f3f4f6',
                                        borderRadius: '4px',
                                    }}>{generatedCredentials.password}</strong>
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(generatedCredentials.password, 'Password')}
                                        style={{
                                            padding: '8px 12px',
                                            background: '#D946EF',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        📋 Copy
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            background: '#EFF6FF',
                            padding: '16px',
                            borderRadius: '6px',
                            marginBottom: '20px',
                        }}>
                            <h4 style={{ marginTop: 0, marginBottom: '12px' }}>Next Steps:</h4>
                            <ol style={{ marginTop: 0, marginBottom: 0, paddingLeft: '20px', fontSize: '14px' }}>
                                <li>Share the Login ID and password with the employee</li>
                                <li>Employee should login and change their password immediately</li>
                                <li>Keep a record of the Login ID for future reference</li>
                            </ol>
                        </div>

                        <Button
                            variant="primary"
                            fullWidth
                            onClick={() => {
                                setShowCredentials(false);
                                setGeneratedCredentials(null);
                            }}
                        >
                            Done
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};
