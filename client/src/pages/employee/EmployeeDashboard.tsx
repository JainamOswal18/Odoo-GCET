import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card } from '../../components/Card';
import { 
    User, 
    Clock, 
    Calendar, 
    LogOut, 
    FileText, 
    TrendingUp,
    AlertCircle,
    CheckCircle 
} from 'lucide-react';
import './EmployeeDashboard.css';

interface AttendanceRecord {
    date: string;
    status: string;
    checkIn?: string;
    checkOut?: string;
}

interface LeaveRequest {
    status: string;
    type: string;
    startDate: string;
    endDate: string;
}

interface Activity {
    icon: React.ReactNode;
    title: string;
    description: string;
    time: string;
    type: 'info' | 'success' | 'warning';
}

export const EmployeeDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, [user]);

    const loadDashboardData = () => {
        // Load attendance
        const attendance = localStorage.getItem(`attendance_${user?.employeeId}`);
        if (attendance) {
            setAttendanceRecords(JSON.parse(attendance));
        }

        // Load leave requests
        const leaves = localStorage.getItem(`leave_requests_${user?.employeeId}`);
        if (leaves) {
            setLeaveRequests(JSON.parse(leaves));
        }

        // Check if currently checked in
        const activeSession = localStorage.getItem(`active_session_${user?.employeeId}`);
        setIsCheckedIn(!!activeSession);

        // Generate recent activities
        generateActivities(attendance, leaves);
    };

    const generateActivities = (attendanceData: string | null, leaveData: string | null) => {
        const activities: Activity[] = [];

        if (attendanceData) {
            const records: AttendanceRecord[] = JSON.parse(attendanceData);
            const recentRecords = records.slice(0, 2);
            recentRecords.forEach(record => {
                activities.push({
                    icon: <CheckCircle size={20} />,
                    title: 'Attendance Marked',
                    description: `${record.status} - ${record.checkIn || 'N/A'} to ${record.checkOut || 'In Progress'}`,
                    time: new Date(record.date).toLocaleDateString(),
                    type: 'success'
                });
            });
        }

        if (leaveData) {
            const requests: LeaveRequest[] = JSON.parse(leaveData);
            const recentLeaves = requests.slice(0, 2);
            recentLeaves.forEach(leave => {
                const type = leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'warning' : 'info';
                activities.push({
                    icon: <Calendar size={20} />,
                    title: `Leave Request ${leave.status}`,
                    description: `${leave.type} from ${new Date(leave.startDate).toLocaleDateString()}`,
                    time: 'Recently',
                    type
                });
            });
        }

        if (activities.length === 0) {
            activities.push({
                icon: <AlertCircle size={20} />,
                title: 'Welcome!',
                description: 'Start by marking your attendance or applying for leave',
                time: 'Today',
                type: 'info'
            });
        }

        setRecentActivities(activities);
    };

    const calculateStats = () => {
        const totalDays = 22;
        const present = attendanceRecords.filter(r => r.status === 'present').length;
        const attendanceRate = totalDays > 0 ? Math.round((present / totalDays) * 100) : 0;
        const pendingLeaves = leaveRequests.filter(r => r.status === 'pending').length;
        
        return { attendanceRate, present, totalDays, pendingLeaves };
    };

    const stats = calculateStats();

    const quickAccessCards = [
        {
            icon: <User size={32} />,
            title: 'My Profile',
            description: 'View and update your personal information',
            color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            path: '/profile'
        },
        {
            icon: <Clock size={32} />,
            title: 'Attendance',
            description: isCheckedIn ? 'Currently checked in' : 'Mark your attendance',
            color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            path: '/attendance',
            badge: isCheckedIn ? 'Active' : null
        },
        {
            icon: <Calendar size={32} />,
            title: 'Leave Requests',
            description: `${stats.pendingLeaves} pending requests`,
            color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            path: '/leave',
            badge: stats.pendingLeaves > 0 ? `${stats.pendingLeaves}` : null
        },
        {
            icon: <FileText size={32} />,
            title: 'Salary Slip',
            description: 'View your salary details',
            color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            path: '/salary'
        }
    ];

    return (
        <DashboardLayout>
            <div className="employee-dashboard">
                {/* Welcome Header */}
                <div className="dashboard-welcome">
                    <div className="welcome-content">
                        <h1>Welcome back, {user?.name}! 👋</h1>
                        <p className="welcome-subtitle">
                            {user?.department} • {user?.position || 'Employee'}
                        </p>
                    </div>
                    <button 
                        className="logout-btn"
                        onClick={logout}
                        title="Logout"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>

                {/* Quick Stats */}
                <div className="quick-stats">
                    <Card className="stat-mini">
                        <div className="stat-mini-icon" style={{ background: 'var(--success-green)' }}>
                            <TrendingUp size={24} />
                        </div>
                        <div className="stat-mini-content">
                            <div className="stat-mini-value">{stats.attendanceRate}%</div>
                            <div className="stat-mini-label">Attendance</div>
                        </div>
                    </Card>
                    <Card className="stat-mini">
                        <div className="stat-mini-icon" style={{ background: 'var(--primary-purple)' }}>
                            <Clock size={24} />
                        </div>
                        <div className="stat-mini-content">
                            <div className="stat-mini-value">{stats.present}/{stats.totalDays}</div>
                            <div className="stat-mini-label">Days Present</div>
                        </div>
                    </Card>
                    <Card className="stat-mini">
                        <div className="stat-mini-icon" style={{ background: 'var(--warning-yellow)' }}>
                            <Calendar size={24} />
                        </div>
                        <div className="stat-mini-content">
                            <div className="stat-mini-value">{stats.pendingLeaves}</div>
                            <div className="stat-mini-label">Pending Leaves</div>
                        </div>
                    </Card>
                </div>

                {/* Quick Access Cards */}
                <div className="quick-access-section">
                    <h2 className="section-title">Quick Access</h2>
                    <div className="quick-access-grid">
                        {quickAccessCards.map((card, index) => (
                            <Card 
                                key={index}
                                className="quick-access-card"
                                hoverable
                                onClick={() => navigate(card.path)}
                            >
                                <div className="card-icon-wrapper" style={{ background: card.color }}>
                                    {card.icon}
                                </div>
                                <div className="card-content">
                                    <h3 className="card-title">{card.title}</h3>
                                    <p className="card-description">{card.description}</p>
                                </div>
                                {card.badge && (
                                    <div className="card-badge">{card.badge}</div>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="recent-activity-section">
                    <h2 className="section-title">Recent Activity & Alerts</h2>
                    <Card className="activity-card">
                        {recentActivities.length === 0 ? (
                            <div className="empty-state">
                                <AlertCircle size={48} />
                                <p>No recent activities</p>
                            </div>
                        ) : (
                            <div className="activity-list">
                                {recentActivities.map((activity, index) => (
                                    <div key={index} className={`activity-item activity-${activity.type}`}>
                                        <div className="activity-icon">{activity.icon}</div>
                                        <div className="activity-content">
                                            <h4 className="activity-title">{activity.title}</h4>
                                            <p className="activity-description">{activity.description}</p>
                                        </div>
                                        <div className="activity-time">{activity.time}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};
