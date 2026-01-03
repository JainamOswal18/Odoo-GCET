import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import './Leave.css';

interface LeaveRequest {
    id: string;
    type: string;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    appliedOn: string;
}

export const Leave: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [showModal, setShowModal] = useState(false);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [formData, setFormData] = useState({
        type: 'paid',
        startDate: '',
        endDate: '',
        reason: '',
    });

    // Load leave requests from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(`leave_requests_${user?.employeeId}`);
        if (stored) {
            setLeaveRequests(JSON.parse(stored));
        }
    }, [user]);

    const calculateDays = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const days = calculateDays(formData.startDate, formData.endDate);
        
        const newRequest: LeaveRequest = {
            id: Date.now().toString(),
            type: formData.type === 'paid' ? 'Paid Leave' : formData.type === 'sick' ? 'Sick Leave' : 'Casual Leave',
            startDate: formData.startDate,
            endDate: formData.endDate,
            days,
            reason: formData.reason,
            status: 'pending',
            appliedOn: new Date().toISOString().split('T')[0],
        };

        const updated = [newRequest, ...leaveRequests];
        setLeaveRequests(updated);
        localStorage.setItem(`leave_requests_${user?.employeeId}`, JSON.stringify(updated));
        
        showToast('success', 'Leave request submitted successfully!');
        setShowModal(false);
        setFormData({ type: 'paid', startDate: '', endDate: '', reason: '' });
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: { label: 'Pending', class: 'status-pending' },
            approved: { label: 'Approved', class: 'status-approved' },
            rejected: { label: 'Rejected', class: 'status-rejected' },
        };
        return badges[status as keyof typeof badges];
    };

    // Calculate leave balance based on requests
    const calculateLeaveBalance = () => {
        const approvedLeaves = leaveRequests.filter(r => r.status === 'approved');
        const paidUsed = approvedLeaves.filter(r => r.type === 'Paid Leave').reduce((sum, r) => sum + r.days, 0);
        const sickUsed = approvedLeaves.filter(r => r.type === 'Sick Leave').reduce((sum, r) => sum + r.days, 0);
        const casualUsed = approvedLeaves.filter(r => r.type === 'Casual Leave').reduce((sum, r) => sum + r.days, 0);

        return {
            paid: Math.max(0, 15 - paidUsed),
            sick: Math.max(0, 10 - sickUsed),
            casual: Math.max(0, 5 - casualUsed),
            total: Math.max(0, 30 - paidUsed - sickUsed - casualUsed),
        };
    };

    const leaveBalance = calculateLeaveBalance();

    return (
        <DashboardLayout>
            <div className="leave-container">
                <div className="leave-header">
                    <h1>Leave Management</h1>
                    <Button variant="primary" onClick={() => setShowModal(true)}>
                        Apply for Leave
                    </Button>
                </div>

                <div className="leave-balance-section">
                    <h2 className="section-title">Leave Balance</h2>
                    <div className="balance-cards">
                        <Card className="balance-card">
                            <div className="balance-icon" style={{ background: 'var(--primary-purple)' }}>🏖️</div>
                            <div className="balance-content">
                                <div className="balance-label">Paid Leave</div>
                                <div className="balance-value">{leaveBalance.paid} days</div>
                            </div>
                        </Card>
                        <Card className="balance-card">
                            <div className="balance-icon" style={{ background: 'var(--error-red)' }}>🤒</div>
                            <div className="balance-content">
                                <div className="balance-label">Sick Leave</div>
                                <div className="balance-value">{leaveBalance.sick} days</div>
                            </div>
                        </Card>
                        <Card className="balance-card">
                            <div className="balance-icon" style={{ background: 'var(--warning-yellow)' }}>📅</div>
                            <div className="balance-content">
                                <div className="balance-label">Casual Leave</div>
                                <div className="balance-value">{leaveBalance.casual} days</div>
                            </div>
                        </Card>
                        <Card className="balance-card total">
                            <div className="balance-icon" style={{ background: 'var(--success-green)' }}>✓</div>
                            <div className="balance-content">
                                <div className="balance-label">Total Available</div>
                                <div className="balance-value">{leaveBalance.total} days</div>
                            </div>
                        </Card>
                    </div>
                </div>

                <Card className="leave-requests-card">
                    <div className="card-header">
                        <h2>Leave Requests</h2>
                    </div>
                    <div className="leave-requests-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Leave Type</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Days</th>
                                    <th>Reason</th>
                                    <th>Applied On</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaveRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                            No leave requests yet. Click "Apply for Leave" to create your first request.
                                        </td>
                                    </tr>
                                ) : (
                                    leaveRequests.map((request) => {
                                        const badge = getStatusBadge(request.status);
                                        return (
                                            <tr key={request.id}>
                                                <td>{request.type}</td>
                                                <td>{new Date(request.startDate).toLocaleDateString('en-US')}</td>
                                                <td>{new Date(request.endDate).toLocaleDateString('en-US')}</td>
                                                <td>{request.days}</td>
                                                <td>{request.reason}</td>
                                                <td>{new Date(request.appliedOn).toLocaleDateString('en-US')}</td>
                                                <td>
                                                    <span className={`status-badge ${badge.class}`}>
                                                        {badge.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {showModal && (
                <Modal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title="Apply for Leave"
                >
                    <form onSubmit={handleSubmit} className="leave-form">
                        <div className="form-group">
                            <label>Leave Type *</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                required
                                className="form-select"
                            >
                                <option value="paid">Paid Leave</option>
                                <option value="sick">Sick Leave</option>
                                <option value="casual">Casual Leave</option>
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Start Date *</label>
                                <Input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>End Date *</label>
                                <Input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Reason *</label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                placeholder="Enter reason for leave"
                                required
                                className="form-textarea"
                                rows={4}
                            />
                        </div>

                        <div className="form-actions">
                            <Button type="submit" variant="primary">
                                Submit Request
                            </Button>
                            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </DashboardLayout>
    );
};
