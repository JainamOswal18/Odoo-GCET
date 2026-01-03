import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useToast } from '../../context/ToastContext';
import { CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';
import './LeaveApproval.css';

interface LeaveRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    type: string;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    appliedOn: string;
    status: 'pending' | 'approved' | 'rejected';
    adminComment?: string;
}

export const LeaveApproval: React.FC = () => {
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [comment, setComment] = useState('');
    const { showToast } = useToast();

    useEffect(() => {
        loadAllLeaveRequests();
    }, []);

    const loadAllLeaveRequests = () => {
        const registeredUsers = localStorage.getItem('registeredUsers');
        if (!registeredUsers) return;

        const users = JSON.parse(registeredUsers);
        const allRequests: LeaveRequest[] = [];

        users.forEach((user: any) => {
            if (user.role === 'employee') {
                const userLeaves = localStorage.getItem(`leave_requests_${user.employeeId}`);
                if (userLeaves) {
                    const leaves = JSON.parse(userLeaves);
                    leaves.forEach((leave: any) => {
                        allRequests.push({
                            ...leave,
                            employeeName: user.name
                        });
                    });
                }
            }
        });

        // Sort by applied date (newest first)
        allRequests.sort((a, b) => new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime());
        setLeaveRequests(allRequests);
    };

    const handleApprove = (request: LeaveRequest) => {
        updateLeaveStatus(request, 'approved');
    };

    const handleReject = (request: LeaveRequest) => {
        updateLeaveStatus(request, 'rejected');
    };

    const updateLeaveStatus = (request: LeaveRequest, status: 'approved' | 'rejected') => {
        // Update in localStorage
        const userLeaves = localStorage.getItem(`leave_requests_${request.employeeId}`);
        if (userLeaves) {
            const leaves = JSON.parse(userLeaves);
            const updatedLeaves = leaves.map((leave: any) =>
                leave.id === request.id
                    ? { ...leave, status, adminComment: comment || undefined }
                    : leave
            );
            localStorage.setItem(`leave_requests_${request.employeeId}`, JSON.stringify(updatedLeaves));
        }

        // Update state
        setLeaveRequests(prev =>
            prev.map(req =>
                req.id === request.id
                    ? { ...req, status, adminComment: comment || undefined }
                    : req
            )
        );

        showToast('success', `Leave request ${status} successfully`);
        setSelectedRequest(null);
        setComment('');
    };

    const filteredRequests = filter === 'all'
        ? leaveRequests
        : leaveRequests.filter(req => req.status === filter);

    const stats = {
        total: leaveRequests.length,
        pending: leaveRequests.filter(r => r.status === 'pending').length,
        approved: leaveRequests.filter(r => r.status === 'approved').length,
        rejected: leaveRequests.filter(r => r.status === 'rejected').length
    };

    return (
        <DashboardLayout>
            <div className="leave-approval">
                <div className="page-header">
                    <div>
                        <h1><Clock size={32} /> Leave Approvals</h1>
                        <p>Review and manage employee leave requests</p>
                    </div>
                </div>

                <div className="stats-row">
                    <Card className="stat-mini" hoverable onClick={() => setFilter('all')}>
                        <div className="stat-mini-content">
                            <span className="stat-mini-label">Total Requests</span>
                            <span className="stat-mini-value">{stats.total}</span>
                        </div>
                    </Card>
                    <Card className="stat-mini" hoverable onClick={() => setFilter('pending')}>
                        <div className="stat-mini-content">
                            <span className="stat-mini-label">Pending</span>
                            <span className="stat-mini-value" style={{ color: '#f59e0b' }}>{stats.pending}</span>
                        </div>
                    </Card>
                    <Card className="stat-mini" hoverable onClick={() => setFilter('approved')}>
                        <div className="stat-mini-content">
                            <span className="stat-mini-label">Approved</span>
                            <span className="stat-mini-value" style={{ color: '#10b981' }}>{stats.approved}</span>
                        </div>
                    </Card>
                    <Card className="stat-mini" hoverable onClick={() => setFilter('rejected')}>
                        <div className="stat-mini-content">
                            <span className="stat-mini-label">Rejected</span>
                            <span className="stat-mini-value" style={{ color: '#ef4444' }}>{stats.rejected}</span>
                        </div>
                    </Card>
                </div>

                <Card>
                    <div className="filter-tabs">
                        <button
                            className={filter === 'all' ? 'active' : ''}
                            onClick={() => setFilter('all')}
                        >
                            All Requests
                        </button>
                        <button
                            className={filter === 'pending' ? 'active' : ''}
                            onClick={() => setFilter('pending')}
                        >
                            Pending
                        </button>
                        <button
                            className={filter === 'approved' ? 'active' : ''}
                            onClick={() => setFilter('approved')}
                        >
                            Approved
                        </button>
                        <button
                            className={filter === 'rejected' ? 'active' : ''}
                            onClick={() => setFilter('rejected')}
                        >
                            Rejected
                        </button>
                    </div>

                    <div className="leave-requests-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Leave Type</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Days</th>
                                    <th>Reason</th>
                                    <th>Applied On</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>
                                            No leave requests found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRequests.map((request) => (
                                        <tr key={request.id}>
                                            <td>
                                                <strong>{request.employeeName}</strong>
                                                <br />
                                                <small>{request.employeeId}</small>
                                            </td>
                                            <td>{request.type}</td>
                                            <td>{new Date(request.startDate).toLocaleDateString()}</td>
                                            <td>{new Date(request.endDate).toLocaleDateString()}</td>
                                            <td>{request.days}</td>
                                            <td>{request.reason}</td>
                                            <td>{new Date(request.appliedOn).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`status-badge ${request.status}`}>
                                                    {request.status}
                                                </span>
                                            </td>
                                            <td>
                                                {request.status === 'pending' ? (
                                                    <div className="action-btns">
                                                        <button
                                                            className="approve-btn"
                                                            onClick={() => {
                                                                setSelectedRequest(request);
                                                                setComment('');
                                                            }}
                                                            title="Review"
                                                        >
                                                            <MessageSquare size={16} /> Review
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="status-text">
                                                        {request.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {selectedRequest && (
                    <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2>Review Leave Request</h2>
                            <div className="request-details">
                                <p><strong>Employee:</strong> {selectedRequest.employeeName} ({selectedRequest.employeeId})</p>
                                <p><strong>Leave Type:</strong> {selectedRequest.type}</p>
                                <p><strong>Duration:</strong> {new Date(selectedRequest.startDate).toLocaleDateString()} - {new Date(selectedRequest.endDate).toLocaleDateString()}</p>
                                <p><strong>Days:</strong> {selectedRequest.days}</p>
                                <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                            </div>
                            <div className="comment-section">
                                <label>Admin Comment (Optional)</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Add a comment for the employee..."
                                    rows={4}
                                />
                            </div>
                            <div className="modal-actions">
                                <Button variant="secondary" onClick={() => setSelectedRequest(null)}>
                                    Cancel
                                </Button>
                                <Button variant="danger" onClick={() => handleReject(selectedRequest)}>
                                    <XCircle size={20} /> Reject
                                </Button>
                                <Button variant="success" onClick={() => handleApprove(selectedRequest)}>
                                    <CheckCircle size={20} /> Approve
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};
