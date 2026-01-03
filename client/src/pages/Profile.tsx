import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import './Profile.css';

export const Profile: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [searchParams] = useSearchParams();
    const viewEmployeeId = searchParams.get('employeeId');
    
    const [isEditing, setIsEditing] = useState(false);
    const [viewingEmployee, setViewingEmployee] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '+91 98765 43210',
        address: '123 Main Street, City, State',
        department: 'Engineering',
        designation: 'Software Engineer',
        dateOfJoining: '2024-01-15',
        employeeId: user?.employeeId || '',
        salary: 45000,
    });

    useEffect(() => {
        if (viewEmployeeId && user?.role === 'admin') {
            loadEmployeeData(viewEmployeeId);
        } else {
            loadCurrentUserData();
        }
    }, [viewEmployeeId, user]);

    const loadEmployeeData = (empId: string) => {
        const registeredUsers = localStorage.getItem('registeredUsers');
        if (registeredUsers) {
            const users = JSON.parse(registeredUsers);
            const employee = users.find((u: any) => u.employeeId === empId);
            if (employee) {
                setViewingEmployee(employee);
                setFormData({
                    name: employee.name,
                    email: employee.email,
                    phone: employee.phone || '+91 98765 43210',
                    address: employee.address || '123 Main Street, City, State',
                    department: employee.department || 'Engineering',
                    designation: employee.position || 'Software Engineer',
                    dateOfJoining: employee.joinDate || '2024-01-15',
                    employeeId: employee.employeeId,
                    salary: employee.salary || 45000,
                });
            }
        }
    };

    const loadCurrentUserData = () => {
        setViewingEmployee(user);
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: '+91 98765 43210',
            address: '123 Main Street, City, State',
            department: 'Engineering',
            designation: 'Software Engineer',
            dateOfJoining: '2024-01-15',
            employeeId: user?.employeeId || '',
            salary: 45000,
        });
    };

    const canEdit = () => {
        // Admin can edit all fields for any employee
        if (user?.role === 'admin') return true;
        // Employee can only edit their own limited fields
        if (!viewEmployeeId || viewEmployeeId === user?.employeeId) return true;
        return false;
    };

    const isViewingOwnProfile = !viewEmployeeId || viewEmployeeId === user?.employeeId;

    const handleSave = () => {
        if (user?.role === 'admin' && viewEmployeeId) {
            // Admin updating another employee
            const registeredUsers = localStorage.getItem('registeredUsers');
            if (registeredUsers) {
                const users = JSON.parse(registeredUsers);
                const updatedUsers = users.map((u: any) => 
                    u.employeeId === viewEmployeeId 
                        ? { ...u, ...formData }
                        : u
                );
                localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
            }
        }
        showToast('success', 'Profile updated successfully!');
        setIsEditing(false);
    };

    const handleCancel = () => {
        if (viewEmployeeId && user?.role === 'admin') {
            loadEmployeeData(viewEmployeeId);
        } else {
            loadCurrentUserData();
        }
        setIsEditing(false);
    };

    const displayUser = viewingEmployee || user;

    return (
        <DashboardLayout>
            <div className="profile-container">
                <div className="profile-header">
                    <h1>{isViewingOwnProfile ? 'My Profile' : `${displayUser?.name}'s Profile`}</h1>
                    {!isEditing && canEdit() && (
                        <Button variant="primary" onClick={() => setIsEditing(true)}>
                            Edit Profile
                        </Button>
                    )}
                </div>

                <div className="profile-content">
                    <Card className="profile-card">
                        <div className="profile-avatar-section">
                            <div className="profile-avatar">
                                {displayUser?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="profile-basic-info">
                                <h2>{displayUser?.name}</h2>
                                <p className="profile-role">{formData.designation}</p>
                                <p className="profile-id">Employee ID: {displayUser?.employeeId}</p>
                            </div>
                        </div>

                        <div className="profile-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            disabled={user?.role !== 'admin' && !isViewingOwnProfile}
                                        />
                                    ) : (
                                        <div className="form-value">{formData.name}</div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Employee ID</label>
                                    <div className="form-value">{formData.employeeId}</div>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email</label>
                                    <div className="form-value">{formData.email}</div>
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    ) : (
                                        <div className="form-value">{formData.phone}</div>
                                    )}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Department</label>
                                    {isEditing && user?.role === 'admin' ? (
                                        <Input
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        />
                                    ) : (
                                        <div className="form-value">{formData.department}</div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Designation</label>
                                    {isEditing && user?.role === 'admin' ? (
                                        <Input
                                            value={formData.designation}
                                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                        />
                                    ) : (
                                        <div className="form-value">{formData.designation}</div>
                                    )}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date of Joining</label>
                                    <div className="form-value">
                                        {new Date(formData.dateOfJoining).toLocaleDateString()}
                                    </div>
                                </div>
                                {user?.role === 'admin' && (
                                    <div className="form-group">
                                        <label>Salary</label>
                                        {isEditing ? (
                                            <Input
                                                type="number"
                                                value={formData.salary}
                                                onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                                            />
                                        ) : (
                                            <div className="form-value">₹{formData.salary.toLocaleString()}</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label>Address</label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    ) : (
                                        <div className="form-value">{formData.address}</div>
                                    )}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date of Joining</label>
                                    <div className="form-value">
                                        {new Date(formData.dateOfJoining).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <div className="form-value">{user?.role === 'admin' ? 'Admin / HR Officer' : 'Employee'}</div>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="profile-actions">
                                    <Button variant="primary" onClick={handleSave}>
                                        Save Changes
                                    </Button>
                                    <Button variant="secondary" onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};
