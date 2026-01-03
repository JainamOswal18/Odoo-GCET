import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

interface NavItem {
    path: string;
    label: string;
    icon: string;
}

const adminNavItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/signup', label: 'Register Employee', icon: '➕' },
    { path: '/admin/employees', label: 'Employees', icon: '👥' },
    { path: '/admin/attendance', label: 'Attendance', icon: '📅' },
    { path: '/admin/leave-approvals', label: 'Leave Management', icon: '🕐' },
    { path: '/admin/payroll', label: 'Payroll', icon: '💰' },
    { path: '/admin/reports', label: 'Reports', icon: '📊' },
    { path: '/profile', label: 'Profile', icon: '👤' },
];

const employeeNavItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/attendance', label: 'Attendance', icon: '📅' },
    { path: '/leave', label: 'Leave', icon: '🕐' },
    { path: '/salary', label: 'Salary', icon: '💰' },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const navItems = user?.role === 'Admin' ? adminNavItems : employeeNavItems;

    return (
        <>
            {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
            <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="logo-circle-small">HR</div>
                        <span className="logo-text">HRMS</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                            }
                            onClick={onClose}
                        >
                            <span className="sidebar-icon">{item.icon}</span>
                            <span className="sidebar-label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile-card">
                        <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
                        <div className="user-info">
                            <div className="user-name">{user?.name}</div>
                            <div className="user-email">{user?.email}</div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};
