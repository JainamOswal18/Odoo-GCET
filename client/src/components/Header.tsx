import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, Settings, LogOut, User, ChevronDown } from 'lucide-react';
import './Header.css';

interface HeaderProps {
    onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<number>(0);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Load pending leave count for admin
        if (user?.role === 'admin') {
            loadPendingNotifications();
        }
    }, [user, location]);

    const loadPendingNotifications = () => {
        const registeredUsers = localStorage.getItem('registeredUsers');
        if (registeredUsers) {
            const users = JSON.parse(registeredUsers);
            let pendingCount = 0;
            
            users.forEach((u: any) => {
                if (u.role === 'employee') {
                    const leaveRequests = localStorage.getItem(`leave_requests_${u.employeeId}`);
                    if (leaveRequests) {
                        const requests = JSON.parse(leaveRequests);
                        pendingCount += requests.filter((r: any) => r.status === 'pending').length;
                    }
                }
            });
            
            setNotifications(pendingCount);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/signin');
    };

    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('/admin/employees')) return 'Employee Management';
        if (path.includes('/admin/leave-approvals')) return 'Leave Approvals';
        if (path.includes('/admin/attendance')) return 'Attendance Overview';
        if (path.includes('/admin/payroll')) return 'Payroll Management';
        if (path.includes('/dashboard')) return user?.role === 'admin' ? 'Admin Dashboard' : 'Employee Dashboard';
        if (path.includes('/profile')) return 'My Profile';
        if (path.includes('/attendance')) return 'Attendance';
        if (path.includes('/leave')) return 'Leave Management';
        if (path.includes('/salary')) return 'Salary Details';
        return 'Dashboard';
    };

    return (
        <header className="header">
            <div className="header-left">
                <button className="menu-toggle" onClick={onMenuClick} aria-label="Toggle menu">
                    ☰
                </button>
                <div className="header-title">
                    <h1 className="page-title">{getPageTitle()}</h1>
                    <p className="page-subtitle">
                        {user?.role === 'admin' ? 'Administrator' : user?.department || 'Employee'}
                    </p>
                </div>
            </div>

            <div className="header-right">
                <button className="header-icon-btn search-btn" aria-label="Search">
                    <Search size={20} />
                </button>

                <div className="notification-wrapper">
                    <button 
                        className="header-icon-btn notification-btn" 
                        aria-label="Notifications"
                        onClick={() => {
                            setShowNotifications(!showNotifications);
                            if (user?.role === 'admin') {
                                navigate('/admin/leave-approvals');
                            }
                        }}
                    >
                        <Bell size={20} />
                        {notifications > 0 && (
                            <span className="notification-badge">{notifications}</span>
                        )}
                    </button>
                </div>

                <div className="user-menu">
                    <button
                        className="user-menu-trigger"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <div className="user-avatar-header">
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="user-info-header">
                            <span className="user-name-header">{user?.name}</span>
                            <span className="user-role-header">{user?.role === 'admin' ? 'Admin' : 'Employee'}</span>
                        </div>
                        <ChevronDown size={16} className="dropdown-arrow-icon" />
                    </button>

                    {showDropdown && (
                        <>
                            <div
                                className="user-menu-overlay"
                                onClick={() => setShowDropdown(false)}
                            />
                            <div className="user-menu-dropdown">
                                <div className="dropdown-header">
                                    <div className="dropdown-user-info">
                                        <div className="dropdown-user-avatar">
                                            {user?.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <div className="dropdown-user-name">{user?.name}</div>
                                            <div className="dropdown-user-email">{user?.email}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="dropdown-divider" />
                                <button
                                    className="dropdown-item"
                                    onClick={() => {
                                        navigate('/profile');
                                        setShowDropdown(false);
                                    }}
                                >
                                    <User size={18} /> My Profile
                                </button>
                                <button
                                    className="dropdown-item"
                                    onClick={() => {
                                        navigate('/settings');
                                        setShowDropdown(false);
                                    }}
                                >
                                    <Settings size={18} /> Settings
                                </button>
                                <div className="dropdown-divider" />
                                <button
                                    className="dropdown-item logout-item"
                                    onClick={handleLogout}
                                >
                                    <LogOut size={18} /> Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};
