import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import api from '../services/api';
import './Attendance.css';

interface AttendanceRecord {
    id: string;
    date: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    status: 'Present' | 'Absent' | 'Half-day' | 'Leave';
}

interface ActiveSession {
    checkInTime: number;
    date: string;
}

export const Attendance: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [selectedMonth, setSelectedMonth] = useState('January 2026');
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    // Load attendance records from backend
    useEffect(() => {
        if (user?.employeeUUID) {
            loadAttendanceData();
            checkActiveSession();
        } else {
            setLoading(false);
        }
    }, [user?.employeeUUID]);

    const loadAttendanceData = async () => {
        if (!user?.employeeUUID) {
            console.error('employeeUUID is missing. Please logout and login again.');
            showToast('error', 'Please logout and login again to load attendance data');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const startDate = '2026-01-01';
            const endDate = '2026-12-31';
            console.log('Fetching attendance for:', user.employeeUUID);
            const response = await api.getAttendance(user.employeeUUID, { startDate, endDate });
            console.log('Attendance response:', response);
            setAttendanceRecords((response as any).attendance || []);
        } catch (error: any) {
            console.error('Attendance fetch error:', error);
            showToast('error', error.message || 'Failed to load attendance data');
        } finally {
            setLoading(false);
        }
    };

    const checkActiveSession = () => {
        const activeSession = localStorage.getItem(`active_session_${user?.employeeId}`);
        if (activeSession) {
            const session: ActiveSession = JSON.parse(activeSession);
            // Check if it's today's session
            const today = new Date().toISOString().split('T')[0];
            if (session.date === today) {
                setIsCheckedIn(true);
                const elapsed = Math.floor((Date.now() - session.checkInTime) / 1000);
                setElapsedTime(elapsed);
            } else {
                // Clear old session
                localStorage.removeItem(`active_session_${user?.employeeId}`);
            }
        }
    };

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

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleToggle = async () => {
        if (!user?.employeeUUID) {
            showToast('error', 'Employee ID not found');
            return;
        }

        try {
            if (!isCheckedIn) {
                // Check In
                await api.checkIn(user.employeeUUID);
                
                const now = Date.now();
                const session: ActiveSession = {
                    checkInTime: now,
                    date: new Date().toISOString().split('T')[0]
                };
                localStorage.setItem(`active_session_${user.employeeId}`, JSON.stringify(session));
                setIsCheckedIn(true);
                setElapsedTime(0);
                showToast('success', 'Checked in successfully!');
                
                // Reload attendance data
                await loadAttendanceData();
            } else {
                // Check Out
                await api.checkOut(user.employeeUUID);
                
                const hoursWorked = (elapsedTime / 3600).toFixed(1);
                localStorage.removeItem(`active_session_${user.employeeId}`);
                
                setIsCheckedIn(false);
                setElapsedTime(0);
                showToast('success', `Checked out successfully! Worked ${hoursWorked} hours`);
                
                // Reload attendance data
                await loadAttendanceData();
            }
        } catch (error: any) {
            showToast('error', error.message || 'Failed to process attendance');
        }
    };

    const calculateStats = () => {
        const totalDays = 22;
        const present = attendanceRecords.filter(r => r.status === 'Present' && r.checkInTime && r.checkOutTime).length;
        const leaves = attendanceRecords.filter(r => r.status === 'Leave').length;
        const halfDays = attendanceRecords.filter(r => r.status === 'Half-day').length;
        const absent = attendanceRecords.filter(r => r.status === 'Absent').length;
        const attendanceRate = present > 0 ? Math.round((present / totalDays) * 100) : 0;

        return { totalDays, present, absent, leaves: leaves + halfDays, attendanceRate };
    };

    const calculateHoursWorked = (checkInTime: string | null, checkOutTime: string | null): string => {
        if (!checkInTime || !checkOutTime) return '-';
        
        const checkIn = new Date(checkInTime);
        const checkOut = new Date(checkOutTime);
        const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
        return `${hours.toFixed(1)}h`;
    };

    const formatTime12Hour = (isoTime: string | null): string => {
        if (!isoTime) return '-';
        return new Date(isoTime).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    };

    const stats = calculateStats();

    const getStatusBadge = (status: string) => {
        const badges = {
            Present: { label: 'Present', class: 'status-present' },
            Absent: { label: 'Absent', class: 'status-absent' },
            'Half-day': { label: 'Half Day', class: 'status-half-day' },
            Leave: { label: 'Leave', class: 'status-leave' },
        };
        return badges[status as keyof typeof badges] || badges.Present;
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="attendance-container">
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div className="loading-spinner">Loading attendance data...</div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="attendance-container">
                <div className="attendance-header">
                    <h1>My Attendance</h1>
                    <div className="attendance-actions">
                        <select 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="month-selector"
                        >
                            <option>January 2026</option>
                            <option>December 2025</option>
                            <option>November 2025</option>
                        </select>
                        
                        <div className="attendance-toggle">
                            {isCheckedIn && (
                                <div className="timer-display">
                                    <span className="timer-label">Working:</span>
                                    <span className="timer-value">{formatTime(elapsedTime)}</span>
                                </div>
                            )}
                            <Button 
                                variant={isCheckedIn ? "secondary" : "primary"}
                                onClick={handleToggle}
                                className="toggle-btn"
                            >
                                {isCheckedIn ? '✓ Check Out' : 'Check In'}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="attendance-stats">
                    <Card className="stat-card">
                        <div className="stat-content">
                            <div className="stat-label">Total Working Days</div>
                            <div className="stat-value">{stats.totalDays}</div>
                        </div>
                    </Card>
                    <Card className="stat-card">
                        <div className="stat-content">
                            <div className="stat-label">Days Present</div>
                            <div className="stat-value" style={{ color: 'var(--success-green)' }}>{stats.present}</div>
                        </div>
                    </Card>
                    <Card className="stat-card">
                        <div className="stat-content">
                            <div className="stat-label">Days Absent</div>
                            <div className="stat-value" style={{ color: 'var(--error-red)' }}>{stats.absent}</div>
                        </div>
                    </Card>
                    <Card className="stat-card">
                        <div className="stat-content">
                            <div className="stat-label">On Leave</div>
                            <div className="stat-value" style={{ color: 'var(--warning-yellow)' }}>{stats.leaves}</div>
                        </div>
                    </Card>
                    <Card className="stat-card">
                        <div className="stat-content">
                            <div className="stat-label">Attendance Rate</div>
                            <div className="stat-value" style={{ color: 'var(--primary-purple)' }}>{stats.attendanceRate}%</div>
                        </div>
                    </Card>
                </div>

                <Card className="attendance-table-card">
                    <div className="table-header">
                        <h2>Attendance Records</h2>
                    </div>
                    <div className="attendance-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Hours Worked</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                            No attendance records yet. Check in to start tracking!
                                        </td>
                                    </tr>
                                ) : (
                                    attendanceRecords.map((record) => {
                                        const badge = getStatusBadge(record.status);
                                        return (
                                            <tr key={record.id}>
                                                <td>
                                                    {new Date(record.date).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </td>
                                                <td>{formatTime12Hour(record.checkInTime)}</td>
                                                <td>{formatTime12Hour(record.checkOutTime)}</td>
                                                <td>{calculateHoursWorked(record.checkInTime, record.checkOutTime)}</td>
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
        </DashboardLayout>
    );
};
