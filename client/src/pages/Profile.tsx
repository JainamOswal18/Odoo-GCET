import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import './Profile.css';

interface EmployeeData {
    id: string;
    userId: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    dateOfBirth: string | null;
    gender: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    country: string | null;
    department: string | null;
    designation: string | null;
    dateOfJoining: string;
    salary: number | null;
    profilePicture: string | null;
    role: string;
    // Bank details (to be stored as JSON in database or parsed from additional fields)
    bankAccountNumber?: string;
    bankName?: string;
    bankIfscCode?: string;
    panNumber?: string;
    uanNumber?: string;
}

type TabType = 'resume' | 'private' | 'salary' | 'security';

export const Profile: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const viewEmployeeId = searchParams.get('employeeId');
    
    const [activeTab, setActiveTab] = useState<TabType>('resume');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        department: '',
        designation: '',
        dateOfJoining: '',
        salary: 0,
        // Bank details
        bankAccountNumber: '',
        bankName: '',
        bankIfscCode: '',
        panNumber: '',
        uanNumber: '',
    });

    useEffect(() => {
        if (viewEmployeeId && user?.role === 'Admin') {
            loadEmployeeData(viewEmployeeId);
        } else if (user?.employeeUUID) {
            loadEmployeeData(user.employeeUUID);
        } else {
            setLoading(false);
        }
    }, [viewEmployeeId, user?.employeeUUID]);

    const loadEmployeeData = async (empId: string) => {
        try {
            setLoading(true);
            const response = await api.getEmployeeProfile(empId);
            const employee = response as any;
            setEmployeeData(employee);
            setFormData({
                firstName: employee.firstName || '',
                lastName: employee.lastName || '',
                email: employee.email || '',
                phone: employee.phone || '',
                dateOfBirth: employee.dateOfBirth || '',
                gender: employee.gender || '',
                address: employee.address || '',
                city: employee.city || '',
                state: employee.state || '',
                zipCode: employee.zipCode || '',
                country: employee.country || '',
                department: employee.department || '',
                designation: employee.designation || '',
                dateOfJoining: employee.dateOfJoining || '',
                salary: employee.salary || 0,
                bankAccountNumber: employee.bankAccountNumber || '',
                bankName: employee.bankName || '',
                bankIfscCode: employee.bankIfscCode || '',
                panNumber: employee.panNumber || '',
                uanNumber: employee.uanNumber || '',
            });
        } catch (error: any) {
            showToast('error', error.message || 'Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const canEdit = () => {
        if (user?.role === 'Admin') return true;
        if (!viewEmployeeId || viewEmployeeId === user?.employeeUUID) return true;
        return false;
    };

    const isViewingOwnProfile = !viewEmployeeId || viewEmployeeId === user?.employeeUUID;

    const handleSave = async () => {
        if (!employeeData) return;

        try {
            // Filter out fields that cannot be updated (email, dateOfJoining)
            const { email, dateOfJoining, ...updateData } = formData;
            await api.updateEmployeeProfile(employeeData.id, updateData);
            showToast('success', 'Profile updated successfully!');
            setIsEditing(false);
            await loadEmployeeData(employeeData.id);
        } catch (error: any) {
            showToast('error', error.message || 'Failed to update profile');
        }
    };

    const handleCancel = () => {
        if (employeeData) {
            setFormData({
                firstName: employeeData.firstName || '',
                lastName: employeeData.lastName || '',
                email: employeeData.email || '',
                phone: employeeData.phone || '',
                dateOfBirth: employeeData.dateOfBirth || '',
                gender: employeeData.gender || '',
                address: employeeData.address || '',
                city: employeeData.city || '',
                state: employeeData.state || '',
                zipCode: employeeData.zipCode || '',
                country: employeeData.country || '',
                department: employeeData.department || '',
                designation: employeeData.designation || '',
                dateOfJoining: employeeData.dateOfJoining || '',
                salary: employeeData.salary || 0,
                bankAccountNumber: employeeData.bankAccountNumber || '',
                bankName: employeeData.bankName || '',
                bankIfscCode: employeeData.bankIfscCode || '',
                panNumber: employeeData.panNumber || '',
                uanNumber: employeeData.uanNumber || '',
            });
        }
        setIsEditing(false);
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="profile-container">
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div className="loading-spinner">Loading profile...</div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!employeeData) {
        return (
            <DashboardLayout>
                <div className="profile-container">
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <p>Employee not found</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const fullName = `${employeeData.firstName} ${employeeData.lastName}`;

    const renderResumeTab = () => (
        <div className="tab-content">
            <div className="form-section">
                <h3>Job Information</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label>Job Position</label>
                        {isEditing && user?.role === 'Admin' ? (
                            <Input
                                value={formData.designation}
                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                            />
                        ) : (
                            <div className="form-value">{formData.designation || 'Not assigned'}</div>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <div className="form-value">{formData.email}</div>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Mobile</label>
                        {isEditing ? (
                            <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        ) : (
                            <div className="form-value">{formData.phone || 'Not provided'}</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h3>Company Details</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label>Department</label>
                        {isEditing && user?.role === 'Admin' ? (
                            <Input
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            />
                        ) : (
                            <div className="form-value">{formData.department || 'Not assigned'}</div>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Manager</label>
                        <div className="form-value">Not assigned</div>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Location</label>
                        {isEditing ? (
                            <Input
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            />
                        ) : (
                            <div className="form-value">{formData.city || 'Not provided'}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPrivateInfoTab = () => (
        <div className="tab-content">
            <div className="form-section">
                <h3>Personal Information</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label>Date of Birth</label>
                        {isEditing ? (
                            <Input
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            />
                        ) : (
                            <div className="form-value">
                                {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : 'Not provided'}
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Residing Address</label>
                        {isEditing ? (
                            <Input
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        ) : (
                            <div className="form-value">{formData.address || 'Not provided'}</div>
                        )}
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Nationality</label>
                        {isEditing ? (
                            <Input
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            />
                        ) : (
                            <div className="form-value">{formData.country || 'Not provided'}</div>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Personal Email</label>
                        <div className="form-value">{formData.email}</div>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Gender</label>
                        {isEditing ? (
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                className="form-select"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    fontSize: '0.95rem',
                                    backgroundColor: 'white'
                                }}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        ) : (
                            <div className="form-value">{formData.gender || 'Not provided'}</div>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Marital Status</label>
                        <div className="form-value">Not provided</div>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Date of Joining</label>
                        <div className="form-value">
                            {formData.dateOfJoining ? new Date(formData.dateOfJoining).toLocaleDateString() : 'Not provided'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSalaryInfoTab = () => (
        <div className="tab-content">
            <div className="form-section">
                <h3>Bank Details</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label>Account Number</label>
                        {isEditing ? (
                            <Input
                                value={formData.bankAccountNumber}
                                onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                            />
                        ) : (
                            <div className="form-value">{formData.bankAccountNumber || 'Not provided'}</div>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Bank Name</label>
                        {isEditing ? (
                            <Input
                                value={formData.bankName}
                                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                            />
                        ) : (
                            <div className="form-value">{formData.bankName || 'Not provided'}</div>
                        )}
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>IFSC Code</label>
                        {isEditing ? (
                            <Input
                                value={formData.bankIfscCode}
                                onChange={(e) => setFormData({ ...formData, bankIfscCode: e.target.value })}
                            />
                        ) : (
                            <div className="form-value">{formData.bankIfscCode || 'Not provided'}</div>
                        )}
                    </div>
                    <div className="form-group">
                        <label>PAN No</label>
                        {isEditing ? (
                            <Input
                                value={formData.panNumber}
                                onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                            />
                        ) : (
                            <div className="form-value">{formData.panNumber || 'Not provided'}</div>
                        )}
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>UAN NO</label>
                        {isEditing ? (
                            <Input
                                value={formData.uanNumber}
                                onChange={(e) => setFormData({ ...formData, uanNumber: e.target.value })}
                            />
                        ) : (
                            <div className="form-value">{formData.uanNumber || 'Not provided'}</div>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Emp Code</label>
                        <div className="form-value">{employeeData.employeeId}</div>
                    </div>
                </div>
            </div>

            {user?.role === 'Admin' && (
                <div className="form-section">
                    <h3>Salary Information</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Monthly Salary</label>
                            {isEditing ? (
                                <Input
                                    type="number"
                                    value={formData.salary}
                                    onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                                />
                            ) : (
                                <div className="form-value">₹{formData.salary?.toLocaleString() || 'Not set'}</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderSecurityTab = () => (
        <div className="tab-content">
            <div className="form-section">
                <h3>Change Password</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label>Current Password</label>
                        <Input type="password" placeholder="Enter current password" />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>New Password</label>
                        <Input type="password" placeholder="Enter new password" />
                    </div>
                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <Input type="password" placeholder="Confirm new password" />
                    </div>
                </div>
                <Button variant="primary">Update Password</Button>
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            <div className="profile-container">
                <div className="profile-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {viewEmployeeId && (
                            <Button 
                                variant="secondary" 
                                onClick={() => navigate('/admin/employees')}
                                style={{ padding: '0.5rem' }}
                            >
                                <ArrowLeft size={20} />
                            </Button>
                        )}
                        <h1>{isViewingOwnProfile ? 'My Profile' : `${fullName}'s Profile`}</h1>
                    </div>
                    {!isEditing && canEdit() && activeTab !== 'security' && (
                        <Button variant="primary" onClick={() => setIsEditing(true)}>
                            Edit Profile
                        </Button>
                    )}
                </div>

                <div className="profile-content">
                    <Card className="profile-card">
                        <div className="profile-header-section">
                            <div className="profile-avatar-section">
                                <div className="profile-avatar-large">
                                    {employeeData.firstName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="profile-basic-info">
                                    <h2>{fullName}</h2>
                                    <p className="profile-subtitle">{formData.designation || 'Employee'}</p>
                                    <p className="profile-id">Employee ID: {employeeData.employeeId}</p>
                                </div>
                            </div>
                        </div>

                        <div className="profile-tabs">
                            <button
                                className={`tab-button ${activeTab === 'resume' ? 'active' : ''}`}
                                onClick={() => setActiveTab('resume')}
                            >
                                Resume
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'private' ? 'active' : ''}`}
                                onClick={() => setActiveTab('private')}
                            >
                                Private Info
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'salary' ? 'active' : ''}`}
                                onClick={() => setActiveTab('salary')}
                            >
                                Salary Info
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
                                onClick={() => setActiveTab('security')}
                            >
                                Security
                            </button>
                        </div>

                        <div className="profile-tab-content">
                            {activeTab === 'resume' && renderResumeTab()}
                            {activeTab === 'private' && renderPrivateInfoTab()}
                            {activeTab === 'salary' && renderSalaryInfoTab()}
                            {activeTab === 'security' && renderSecurityTab()}
                        </div>

                        {isEditing && activeTab !== 'security' && (
                            <div className="profile-actions">
                                <Button variant="primary" onClick={handleSave}>
                                    Save Changes
                                </Button>
                                <Button variant="secondary" onClick={handleCancel}>
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};
