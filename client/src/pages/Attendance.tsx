import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import './Attendance.css';

interface AttendanceRecord {
    id: string;
    date: string;
    checkIn: string;
    checkOut: string;
    status: 'present' | 'absent' | 'half-day' | 'leave';
    hoursWorked: string;
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

    // Load attendance records and active session from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(`attendance_${user?.employeeId}`);
        if (stored) {
            setAttendanceRecords(JSON.parse(stored));
        }

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

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleToggle = () => {
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
                    id: Date.now().toString(),
                    date: session.date,
                    checkIn: checkInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    checkOut: checkOutTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    status: 'present',
                    hoursWorked: `${hoursWorked}h`
                };

                const updated = [newRecord, ...attendanceRecords];
                setAttendanceRecords(updated);
                localStorage.setItem(`attendance_${user?.employeeId}`, JSON.stringify(updated));
                localStorage.removeItem(`active_session_${user?.employeeId}`);
                
                setIsCheckedIn(false);
                setElapsedTime(0);
                showToast('success', `Checked out successfully! Worked ${hoursWorked} hours`);
            }
        }
    };

    const calculateStats = () => {
        const totalDays = 22;
        const present = attendanceRecords.filter(r => r.status === 'present').length;
        const leaves = attendanceRecords.filter(r => r.status === 'leave').length;
        const absent = totalDays - present - leaves;
        const attendanceRate = Math.round((present / totalDays) * 100);

        return { totalDays, present, absent, leaves, attendanceRate };
    };

    const stats = calculateStats();

    const getStatusBadge = (status: string) => {
        const badges = {
            present: { label: 'Present', class: 'status-present' },
            absent: { label: 'Absent', class: 'status-absent' },
            'half-day': { label: 'Half Day', class: 'status-half-day' },
            leave: { label: 'Leave', class: 'status-leave' },
        };
        return badges[status as keyof typeof badges] || badges.present;
    };

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
                                    attendanceRecords.map((record, index) => {
                                        const badge = getStatusBadge(record.status);
                                        return (
                                            <tr key={index}>
                                                <td>
                                                    {new Date(record.date).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </td>
                                                <td>{record.checkIn}</td>
                                                <td>{record.checkOut}</td>
                                                <td>{record.hoursWorked}</td>
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
