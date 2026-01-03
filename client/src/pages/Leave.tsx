import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import api from '../services/api';
import './Leave.css';

interface TimeOffRequest {
    id: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    numberOfDays: number;
    remarks: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    createdAt: string;
}

interface LeaveBalance {
    paidLeaveBalance: number;
    sickLeaveBalance: number;
    unpaidLeaveBalance: number;
}

export const Leave: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
    const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>({
        paidLeaveBalance: 24,
        sickLeaveBalance: 7,
        unpaidLeaveBalance: 0
    });
    const [formData, setFormData] = useState({
        type: 'Paid',
        startDate: '',
        endDate: '',
        reason: '',
    });

    // Fetch leave requests and balance from backend
    useEffect(() => {
        if (user?.employeeUUID) {
            loadLeaveData();
        } else {
            setLoading(false);
        }
    }, [user?.employeeUUID]);

    const loadLeaveData = async () => {
        try {
            setLoading(true);
            const [requestsData, balanceData] = await Promise.all([
                api.getLeaveRequests(user!.employeeUUID),
                api.getLeaveBalance(user!.employeeUUID)
            ]);
            
            setTimeOffRequests((requestsData as any).leaveRequests || []);
            setLeaveBalance((balanceData as any) || {
                paidLeaveBalance: 0,
                sickLeaveBalance: 0,
                unpaidLeaveBalance: 0
            });
        } catch (error: any) {
            showToast('error', error.message || 'Failed to load leave data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user?.employeeUUID) {
            showToast('error', 'Employee ID not found');
            return;
        }

        try {
            setSubmitting(true);
            
            await api.applyLeave(user.employeeUUID, {
                leaveType: formData.type,
                startDate: formData.startDate,
                endDate: formData.endDate,
                remarks: formData.reason
            });

            showToast('success', 'Time off request submitted successfully!');
            setShowModal(false);
            setFormData({ type: 'Paid', startDate: '', endDate: '', reason: '' });
            
            // Reload data
            await loadLeaveData();
        } catch (error: any) {
            showToast('error', error.message || 'Failed to submit time off request');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            Pending: { label: 'Pending', class: 'status-pending' },
            Approved: { label: 'Approved', class: 'status-approved' },
            Rejected: { label: 'Rejected', class: 'status-rejected' },
        };
        return badges[status as keyof typeof badges] || badges.Pending;
    };

    const getLeaveTypeDisplay = (leaveType: string) => {
        const types: { [key: string]: string } = {
            'Paid': 'Paid Time Off',
            'Sick': 'Sick Leave',
            'Unpaid': 'Unpaid Leaves'
        };
        return types[leaveType] || leaveType;
    };

    // Calculate unpaid used from approved unpaid leaves
    const unpaidUsed = timeOffRequests
        .filter(r => r.status === 'Approved' && r.leaveType === 'Unpaid')
        .reduce((sum, r) => sum + r.numberOfDays, 0);

    const timeOffBalance = {
        paid: leaveBalance.paidLeaveBalance,
        sick: leaveBalance.sickLeaveBalance,
        unpaid: unpaidUsed,
        total: leaveBalance.paidLeaveBalance + leaveBalance.sickLeaveBalance
    };

    return (
        <DashboardLayout>
            <div className="leave-container">
                <div className="leave-header">
                    <h1>Time Off</h1>
                    <Button variant="primary" onClick={() => setShowModal(true)}>
                        NEW
                    </Button>
                </div>

                <div className="leave-balance-section">
                    <h2 className="section-title">Time Off Balance</h2>
                    <div className="balance-cards">
                        <Card className="balance-card">
                            <div className="balance-icon" style={{ background: 'var(--primary-purple)' }}>🏖️</div>
                            <div className="balance-content">
                                <div className="balance-label">Paid Time Off</div>
                                <div className="balance-value">{timeOffBalance.paid} Days Available</div>
                            </div>
                        </Card>
                        <Card className="balance-card">
                            <div className="balance-icon" style={{ background: 'var(--error-red)' }}>🤒</div>
                            <div className="balance-content">
                                <div className="balance-label">Sick time off</div>
                                <div className="balance-value">{timeOffBalance.sick} Days Available</div>
                            </div>
                        </Card>
                        <Card className="balance-card">
                            <div className="balance-icon" style={{ background: 'var(--warning-yellow)' }}>📅</div>
                            <div className="balance-content">
                                <div className="balance-label">Unpaid Leaves</div>
                                <div className="balance-value">{timeOffBalance.unpaid} Days Used</div>
                            </div>
                        </Card>
                        <Card className="balance-card total">
                            <div className="balance-icon" style={{ background: 'var(--success-green)' }}>✓</div>
                            <div className="balance-content">
                                <div className="balance-label">Total Available</div>
                                <div className="balance-value">{timeOffBalance.total} days</div>
                            </div>
                        </Card>
                    </div>
                </div>

                <Card className="leave-requests-card">
                    <div className="card-header">
                        <h2>Time Off Requests</h2>
                    </div>
                    <div className="leave-requests-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Time off Type</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                                            <div className="spinner spinner-lg" />
                                        </td>
                                    </tr>
                                ) : timeOffRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                            No time off requests yet. Click "NEW" to create your first request.
                                        </td>
                                    </tr>
                                ) : (
                                    timeOffRequests.map((request) => {
                                        const badge = getStatusBadge(request.status);
                                        return (
                                            <tr key={request.id}>
                                                <td>{user?.name || 'Employee'}</td>
                                                <td>{new Date(request.startDate).toLocaleDateString('en-GB')}</td>
                                                <td>{new Date(request.endDate).toLocaleDateString('en-GB')}</td>
                                                <td>{getLeaveTypeDisplay(request.leaveType)}</td>
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
                    title="Time off Type Request"
                >
                    <form onSubmit={handleSubmit} className="leave-form">
                        <div className="form-group">
                            <label>Time off Type *</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                required
                                className="form-select"
                                disabled={submitting}
                            >
                                <option value="Paid">Paid Time Off</option>
                                <option value="Sick">Sick Leave</option>
                                <option value="Unpaid">Unpaid Leaves</option>
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Start Date (Validity Period) *</label>
                                <Input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    required
                                    disabled={submitting}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="form-group">
                                <label>End Date (Validity Period) *</label>
                                <Input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    required
                                    disabled={submitting}
                                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Reason (Allocation) *</label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                placeholder="Enter reason for time off"
                                required
                                disabled={submitting}
                                className="form-textarea"
                                rows={4}
                            />
                        </div>

                        <div className="form-actions">
                            <Button type="submit" variant="primary" loading={submitting}>
                                Submit
                            </Button>
                            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} disabled={submitting}>
                                Discard
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </DashboardLayout>
    );
};
