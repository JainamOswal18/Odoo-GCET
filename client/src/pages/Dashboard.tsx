import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Dashboard.css';

interface AttendanceRecord {
    date: string;
    status: string;
}

interface LeaveRequest {
    status: string;
    type: string;
    days: number;
}

interface Activity {
    icon: string;
    text: string;
    time: string;
}

export const Dashboard: React.FC = () => {
    const { user } = useAuth();

    if (user?.role === 'Admin') {
        return <AdminDashboard />;
    }

    return <EmployeeDashboard />;
};

interface ActiveSession {
    checkInTime: number;
    date: string;
}

const EmployeeDashboard: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        // Load attendance data
        const attendance = localStorage.getItem(`attendance_${user?.employeeId}`);
        if (attendance) {
            setAttendanceData(JSON.parse(attendance));
        }

        // Load leave requests
        const leaves = localStorage.getItem(`leave_requests_${user?.employeeId}`);
        if (leaves) {
            setLeaveRequests(JSON.parse(leaves));
        }

        // Check if currently checked in
        const activeSession = localStorage.getItem(`active_session_${user?.employeeId}`);
        if (activeSession) {
            const session: ActiveSession = JSON.parse(activeSession);
            setIsCheckedIn(true);
            const elapsed = Math.floor((Date.now() - session.checkInTime) / 1000);
            setElapsedTime(elapsed);
        }
    }, [user]);

    // Timer effect
    useEffect(() => {
        let interval: number | undefined;
        if (isCheckedIn) {
            interval = window.setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (interval) window.clearInterval(interval);
        };
    }, [isCheckedIn]);

    // Generate dynamic activities from real data
    const generateActivities = (): Activity[] => {
        const activities: Activity[] = [];
        
        // Add recent attendance records
        const recentAttendance = attendanceData.slice(-3);
        recentAttendance.forEach(record => {
            activities.push({
                icon: '✓',
                text: `Attendance marked: ${record.status}`,
                time: new Date(record.date).toLocaleDateString()
            });
        });

        // Add recent leave requests
        const recentLeaves = leaveRequests.slice(-2);
        recentLeaves.forEach(leave => {
            const statusIcon = leave.status === 'approved' ? '✅' : leave.status === 'rejected' ? '❌' : '📝';
            activities.push({
                icon: statusIcon,
                text: `${leave.type}: ${leave.status}`,
                time: 'Recently'
            });
        });

        // Add default activities if no data
        if (activities.length === 0) {
            activities.push(
                { icon: '👋', text: 'Welcome to your dashboard!', time: 'Today' },
                { icon: '📊', text: 'Check your attendance records', time: 'Suggestion' },
                { icon: '🏖️', text: 'Apply for leave when needed', time: 'Suggestion' }
            );
        }

        return activities;
    };

    const activities = generateActivities();
    const itemsPerPage = 3;
    const totalPages = Math.ceil(activities.length / itemsPerPage);
    const displayedActivities = activities.slice(
        currentActivityIndex * itemsPerPage,
        (currentActivityIndex + 1) * itemsPerPage
    );

    const nextActivities = () => {
        setCurrentActivityIndex((prev) => (prev + 1) % totalPages);
    };

    const prevActivities = () => {
        setCurrentActivityIndex((prev) => (prev - 1 + totalPages) % totalPages);
    };

    // Calculate stats from real data
    const totalWorkingDays = 22;
    const presentDays = attendanceData.filter(r => r.status === 'present').length;
    const attendancePercentage = totalWorkingDays > 0 ? Math.round((presentDays / totalWorkingDays) * 100) : 0;
    const pendingLeaves = leaveRequests.filter(r => r.status === 'pending').length;
    
    const approvedLeaves = leaveRequests.filter(r => r.status === 'approved');
    const paidUsed = approvedLeaves.filter(r => r.type === 'Paid Leave').reduce((sum, r) => sum + r.days, 0);
    const sickUsed = approvedLeaves.filter(r => r.type === 'Sick Leave').reduce((sum, r) => sum + r.days, 0);
    const totalLeaveBalance = Math.max(0, 30 - paidUsed - sickUsed);
    const paidBalance = Math.max(0, 15 - paidUsed);
    const sickBalance = Math.max(0, 10 - sickUsed);

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleToggleAttendance = () => {
        if (!isCheckedIn) {
            // Check In
            const now = Date.now();
            const session: ActiveSession = {
                checkInTime: now,
                date: new Date().toISOString().split('T')[0]
            };
            localStorage.setItem(`active_session_${user?.employeeId}`, JSON.stringify(session));
            setIsCheckedIn(true);
            setElapsedTime(0);
            showToast('success', 'Checked in successfully!');
        } else {
            // Check Out
            const sessionData = localStorage.getItem(`active_session_${user?.employeeId}`);
            if (sessionData) {
                const session: ActiveSession = JSON.parse(sessionData);
                const checkInTime = new Date(session.checkInTime);
                const checkOutTime = new Date();
                const hoursWorked = (elapsedTime / 3600).toFixed(1);

                const newRecord: AttendanceRecord = {
                    date: session.date,
                    status: 'present',
                };

                const updated = [newRecord, ...attendanceData];
                setAttendanceData(updated);
                localStorage.setItem(`attendance_${user?.employeeId}`, JSON.stringify(updated));
                localStorage.removeItem(`active_session_${user?.employeeId}`);
                
                setIsCheckedIn(false);
                setElapsedTime(0);
                showToast('success', `Checked out successfully! Worked ${hoursWorked} hours`);
            }
        }
    };

    return (
        <DashboardLayout>
            <div className="dashboard-header">
                <h1>Hello, {user?.name}! 👋</h1>
                <div className="attendance-toggle-section">
                    {isCheckedIn && (
                        <div className="timer-display-dashboard">
                            <span className="timer-icon">⏱️</span>
                            <span className="timer-value">{formatTime(elapsedTime)}</span>
                        </div>
                    )}
                    <Button 
                        variant={isCheckedIn ? "secondary" : "primary"}
                        onClick={handleToggleAttendance}
                    >
                        {isCheckedIn ? '✓ Check Out' : 'Check In'}
                    </Button>
                </div>
            </div>

            <div className="stats-grid">
                <Card className="stat-card" hoverable>
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>📊</div>
                    <div className="stat-content">
                        <div className="stat-label">Attendance This Month</div>
                        <div className="stat-value">{attendancePercentage}%</div>
                        <div className="stat-subtext">{presentDays}/{totalWorkingDays} days</div>
                    </div>
                </Card>

                <Card className="stat-card" hoverable>
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>🕐</div>
                    <div className="stat-content">
                        <div className="stat-label">Pending Leave Requests</div>
                        <div className="stat-value">{pendingLeaves}</div>
                        <div className="stat-subtext">Awaiting approval</div>
                    </div>
                </Card>

                <Card className="stat-card" hoverable>
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>🏖️</div>
                    <div className="stat-content">
                        <div className="stat-label">Leave Balance</div>
                        <div className="stat-value">{totalLeaveBalance} days</div>
                        <div className="stat-subtext">Paid: {paidBalance}, Sick: {sickBalance}</div>
                    </div>
                </Card>

                <Card className="stat-card" hoverable>
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>💰</div>
                    <div className="stat-content">
                        <div className="stat-label">This Month Salary</div>
                        <div className="stat-value">₹45,000</div>
                        <div className="stat-subtext">Net pay</div>
                    </div>
                </Card>
            </div>

            <div className="quick-actions">
                <h2 className="section-title">Quick Actions</h2>
                <div className="action-buttons">
                    <Button variant="primary" onClick={() => navigate('/leave')}>
                        Apply for Leave
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/attendance')}>
                        View Attendance
                    </Button>
                    <Button variant="tertiary" onClick={() => navigate('/salary')}>
                        View Salary Slip
                    </Button>
                </div>
            </div>

            <div className="recent-activity">
                <div className="activity-header">
                    <h2 className="section-title">Recent Activity</h2>
                    {activities.length > itemsPerPage && (
                        <div className="carousel-controls">
                            <button 
                                className="carousel-btn" 
                                onClick={prevActivities}
                                aria-label="Previous activities"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="carousel-indicator">
                                {currentActivityIndex + 1} / {totalPages}
                            </span>
                            <button 
                                className="carousel-btn" 
                                onClick={nextActivities}
                                aria-label="Next activities"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
                <Card>
                    <div className="activity-list">
                        {displayedActivities.map((activity, index) => (
                            <div 
                                key={`${currentActivityIndex}-${index}`} 
                                className="activity-item"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <span className="activity-icon">{activity.icon}</span>
                                <span className="activity-text">{activity.text}</span>
                                <span className="activity-time">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [pendingLeaves, setPendingLeaves] = useState(0);
    const [todayAttendance, setTodayAttendance] = useState({ present: 0, total: 0, percentage: 0 });
    const [recentLeaveRequests, setRecentLeaveRequests] = useState<any[]>([]);

    useEffect(() => {
        loadAdminDashboardData();
    }, []);

    const loadAdminDashboardData = () => {
        const registeredUsers = localStorage.getItem('registeredUsers');
        if (!registeredUsers) return;

        const users = JSON.parse(registeredUsers);
        const employees = users.filter((u: any) => u.role === 'employee');
        setTotalEmployees(employees.length);

        // Calculate pending leaves
        let pending = 0;
        const allLeaveRequests: any[] = [];
        
        employees.forEach((emp: any) => {
            const leaves = localStorage.getItem(`leave_requests_${emp.employeeId}`);
            if (leaves) {
                const empLeaves = JSON.parse(leaves);
                empLeaves.forEach((leave: any) => {
                    if (leave.status === 'pending') {
                        pending++;
                        allLeaveRequests.push({
                            ...leave,
                            employeeName: emp.name,
                            employeeId: emp.employeeId
                        });
                    }
                });
            }
        });
        
        setPendingLeaves(pending);
        setRecentLeaveRequests(allLeaveRequests.slice(-5).reverse());

        // Calculate today's attendance
        const today = new Date().toDateString();
        let presentCount = 0;
        
        employees.forEach((emp: any) => {
            const attendance = localStorage.getItem(`attendance_${emp.employeeId}`);
            if (attendance) {
                const records = JSON.parse(attendance);
                const todayRecord = records.find((r: any) => new Date(r.date).toDateString() === today);
                if (todayRecord && todayRecord.status === 'present') {
                    presentCount++;
                }
            }
        });

        setTodayAttendance({
            present: presentCount,
            total: employees.length,
            percentage: employees.length > 0 ? Math.round((presentCount / employees.length) * 100) : 0
        });
    };

    return (
        <DashboardLayout>
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
            </div>

            <div className="stats-grid">
                <Card className="stat-card" hoverable onClick={() => navigate('/admin/employees')}>
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>👥</div>
                    <div className="stat-content">
                        <div className="stat-label">Total Employees</div>
                        <div className="stat-value">{totalEmployees}</div>
                        <div className="stat-subtext">Active users</div>
                    </div>
                </Card>

                <Card className="stat-card" hoverable onClick={() => navigate('/admin/attendance')}>
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>📊</div>
                    <div className="stat-content">
                        <div className="stat-label">Today's Attendance</div>
                        <div className="stat-value">{todayAttendance.percentage}%</div>
                        <div className="stat-subtext">{todayAttendance.present}/{todayAttendance.total} present</div>
                    </div>
                </Card>

                <Card className="stat-card" hoverable onClick={() => navigate('/admin/leave-approvals')}>
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>🕐</div>
                    <div className="stat-content">
                        <div className="stat-label">Pending Approvals</div>
                        <div className="stat-value">{pendingLeaves}</div>
                        <div className="stat-subtext">Leave requests</div>
                    </div>
                </Card>

                <Card className="stat-card" hoverable onClick={() => navigate('/admin/payroll')}>
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)' }}>💰</div>
                    <div className="stat-content">
                        <div className="stat-label">Payroll Status</div>
                        <div className="stat-value">Active</div>
                        <div className="stat-subtext">January 2026</div>
                    </div>
                </Card>
            </div>

            <div className="admin-section">
                <h2 className="section-title">Pending Leave Approvals</h2>
                <Card>
                    {recentLeaveRequests.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                            No pending leave requests
                        </div>
                    ) : (
                        <div className="approval-list">
                            {recentLeaveRequests.map((request) => (
                                <div key={request.id} className="approval-item">
                                    <div className="approval-user">
                                        <div className="user-avatar-small">
                                            {request.employeeName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="approval-name">{request.employeeName}</div>
                                            <div className="approval-details">
                                                {request.type} • {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()} ({request.days} days)
                                            </div>
                                        </div>
                                    </div>
                                    <div className="approval-actions">
                                        <Button size="small" variant="primary" onClick={() => navigate('/admin/leave-approvals')}>
                                            Review
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {recentLeaveRequests.length > 0 && (
                        <div style={{ marginTop: 'var(--spacing-3)', textAlign: 'center' }}>
                            <Button variant="secondary" onClick={() => navigate('/admin/leave-approvals')}>
                                View All Requests
                            </Button>
                        </div>
                    )}
                </Card>
            </div>

            <div className="quick-actions">
                <h2 className="section-title">Quick Actions</h2>
                <div className="action-buttons">
                    <Button variant="primary" onClick={() => navigate('/admin/employees')}>
                        View All Employees
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/admin/attendance')}>
                        Manage Attendance
                    </Button>
                    <Button variant="tertiary" onClick={() => navigate('/admin/leave-approvals')}>
                        Leave Approvals
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
};
