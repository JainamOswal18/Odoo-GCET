import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Briefcase, 
    Calendar,
    DollarSign,
    FileText,
    Download,
    Upload,
    Edit,
    Save,
    X
} from 'lucide-react';
import './EmployeeProfile.css';

interface Document {
    id: string;
    name: string;
    type: string;
    uploadDate: string;
    size: string;
}

export const EmployeeProfile: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [profileImage, setProfileImage] = useState<string>('');
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '+91 98765 43210',
        address: '123 Main Street, City, State - 400001',
        dateOfBirth: '1995-06-15',
        emergencyContact: '+91 98765 12345',
    });
    const [documents, setDocuments] = useState<Document[]>([]);

    useEffect(() => {
        loadProfileData();
    }, [user]);

    const loadProfileData = () => {
        // Load profile image
        const savedImage = localStorage.getItem(`profile_image_${user?.employeeId}`);
        if (savedImage) {
            setProfileImage(savedImage);
        } else {
            // Generate default avatar
            const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&size=200&background=667eea&color=fff`;
            setProfileImage(defaultAvatar);
        }

        // Load documents
        const savedDocs = localStorage.getItem(`documents_${user?.employeeId}`);
        if (savedDocs) {
            setDocuments(JSON.parse(savedDocs));
        } else {
            // Default documents
            setDocuments([
                { id: '1', name: 'Resume.pdf', type: 'PDF', uploadDate: '2024-01-15', size: '245 KB' },
                { id: '2', name: 'ID_Proof.pdf', type: 'PDF', uploadDate: '2024-01-15', size: '189 KB' },
                { id: '3', name: 'Education_Certificate.pdf', type: 'PDF', uploadDate: '2024-01-15', size: '312 KB' },
            ]);
        }
    };

    const handleSave = () => {
        // Update user data
        const registeredUsers = localStorage.getItem('registeredUsers');
        if (registeredUsers) {
            const users = JSON.parse(registeredUsers);
            const updatedUsers = users.map((u: any) => 
                u.employeeId === user?.employeeId 
                    ? { ...u, ...formData }
                    : u
            );
            localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
        }

        showToast('success', 'Profile updated successfully!');
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: '+91 98765 43210',
            address: '123 Main Street, City, State - 400001',
            dateOfBirth: '1995-06-15',
            emergencyContact: '+91 98765 12345',
        });
        setIsEditing(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setProfileImage(result);
                localStorage.setItem(`profile_image_${user?.employeeId}`, result);
                showToast('success', 'Profile picture updated!');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDocumentUpload = () => {
        showToast('info', 'Document upload feature will be available soon');
    };

    const handleDownloadDocument = (docName: string) => {
        showToast('info', `Downloading ${docName}...`);
    };

    const getSalaryDetails = () => {
        const payroll = localStorage.getItem('payroll_records');
        if (payroll) {
            const records = JSON.parse(payroll);
            const myPayroll = records.find((r: any) => r.employeeId === user?.employeeId);
            if (myPayroll) {
                return {
                    basic: myPayroll.basicSalary,
                    allowances: myPayroll.allowances,
                    deductions: myPayroll.deductions,
                    bonus: myPayroll.bonus,
                    net: myPayroll.netSalary
                };
            }
        }
        return {
            basic: 35000,
            allowances: 8000,
            deductions: 2000,
            bonus: 4000,
            net: 45000
        };
    };

    const salary = getSalaryDetails();

    return (
        <DashboardLayout>
            <div className="employee-profile">
                <div className="profile-header">
                    <h1>My Profile</h1>
                    {!isEditing ? (
                        <Button 
                            variant="primary" 
                            onClick={() => setIsEditing(true)}
                        >
                            <Edit size={18} />
                            Edit Profile
                        </Button>
                    ) : (
                        <div className="edit-actions">
                            <Button 
                                variant="secondary" 
                                onClick={handleCancel}
                            >
                                <X size={18} />
                                Cancel
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={handleSave}
                            >
                                <Save size={18} />
                                Save Changes
                            </Button>
                        </div>
                    )}
                </div>

                <div className="profile-content">
                    {/* Personal Details Card */}
                    <Card className="profile-card">
                        <div className="card-header-section">
                            <h2><User size={20} /> Personal Details</h2>
                        </div>
                        
                        <div className="profile-picture-section">
                            <div className="profile-picture-wrapper">
                                <img 
                                    src={profileImage} 
                                    alt="Profile" 
                                    className="profile-picture"
                                />
                                {isEditing && (
                                    <label className="upload-overlay">
                                        <Upload size={24} />
                                        <span>Change Photo</span>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="profile-fields">
                            <div className="field-group">
                                <label><User size={16} /> Full Name</label>
                                {isEditing ? (
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                ) : (
                                    <p>{formData.name}</p>
                                )}
                            </div>

                            <div className="field-group">
                                <label><Mail size={16} /> Email</label>
                                {isEditing ? (
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                ) : (
                                    <p>{formData.email}</p>
                                )}
                            </div>

                            <div className="field-group">
                                <label><Phone size={16} /> Phone Number</label>
                                {isEditing ? (
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                ) : (
                                    <p>{formData.phone}</p>
                                )}
                            </div>

                            <div className="field-group">
                                <label><MapPin size={16} /> Address</label>
                                {isEditing ? (
                                    <Input
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                ) : (
                                    <p>{formData.address}</p>
                                )}
                            </div>

                            <div className="field-group">
                                <label><Calendar size={16} /> Date of Birth</label>
                                {isEditing ? (
                                    <Input
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                    />
                                ) : (
                                    <p>{new Date(formData.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                )}
                            </div>

                            <div className="field-group">
                                <label><Phone size={16} /> Emergency Contact</label>
                                {isEditing ? (
                                    <Input
                                        value={formData.emergencyContact}
                                        onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                                    />
                                ) : (
                                    <p>{formData.emergencyContact}</p>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Job Details Card */}
                    <Card className="profile-card">
                        <div className="card-header-section">
                            <h2><Briefcase size={20} /> Job Details</h2>
                        </div>
                        
                        <div className="profile-fields">
                            <div className="field-group">
                                <label>Employee ID</label>
                                <p className="field-value-highlight">{user?.employeeId}</p>
                            </div>

                            <div className="field-group">
                                <label>Department</label>
                                <p>{user?.department}</p>
                            </div>

                            <div className="field-group">
                                <label>Position</label>
                                <p>{user?.position || 'Software Engineer'}</p>
                            </div>

                            <div className="field-group">
                                <label>Date of Joining</label>
                                <p>{new Date('2024-01-15').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>

                            <div className="field-group">
                                <label>Employment Type</label>
                                <p>Full Time</p>
                            </div>

                            <div className="field-group">
                                <label>Reporting Manager</label>
                                <p>John Doe</p>
                            </div>
                        </div>
                    </Card>

                    {/* Salary Structure Card */}
                    <Card className="profile-card">
                        <div className="card-header-section">
                            <h2><DollarSign size={20} /> Salary Structure</h2>
                        </div>
                        
                        <div className="salary-breakdown">
                            <div className="salary-item">
                                <span className="salary-label">Basic Salary</span>
                                <span className="salary-value">₹{salary.basic.toLocaleString()}</span>
                            </div>
                            <div className="salary-item">
                                <span className="salary-label">Allowances</span>
                                <span className="salary-value positive">+₹{salary.allowances.toLocaleString()}</span>
                            </div>
                            <div className="salary-item">
                                <span className="salary-label">Bonus</span>
                                <span className="salary-value positive">+₹{salary.bonus.toLocaleString()}</span>
                            </div>
                            <div className="salary-item">
                                <span className="salary-label">Deductions</span>
                                <span className="salary-value negative">-₹{salary.deductions.toLocaleString()}</span>
                            </div>
                            <div className="salary-item total">
                                <span className="salary-label">Net Salary</span>
                                <span className="salary-value">₹{salary.net.toLocaleString()}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Documents Card */}
                    <Card className="profile-card documents-card">
                        <div className="card-header-section">
                            <h2><FileText size={20} /> Documents</h2>
                            <Button 
                                variant="secondary" 
                                onClick={handleDocumentUpload}
                            >
                                <Upload size={18} />
                                Upload Document
                            </Button>
                        </div>
                        
                        <div className="documents-list">
                            {documents.length === 0 ? (
                                <div className="empty-state">
                                    <FileText size={48} />
                                    <p>No documents uploaded</p>
                                </div>
                            ) : (
                                documents.map((doc) => (
                                    <div key={doc.id} className="document-item">
                                        <div className="document-icon">
                                            <FileText size={24} />
                                        </div>
                                        <div className="document-info">
                                            <h4>{doc.name}</h4>
                                            <p>{doc.type} • {doc.size} • Uploaded {new Date(doc.uploadDate).toLocaleDateString()}</p>
                                        </div>
                                        <button 
                                            className="document-download"
                                            onClick={() => handleDownloadDocument(doc.name)}
                                        >
                                            <Download size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};
