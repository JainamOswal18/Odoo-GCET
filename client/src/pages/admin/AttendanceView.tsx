import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card } from '../../components/Card';
import { Calendar, Search } from 'lucide-react';
import './AttendanceView.css';

interface AttendanceRecord {
    date: string;
    checkIn: string;
    checkOut: string;
    hoursWorked: string;
    status: string;
}

interface EmployeeAttendance {
    employeeId: string;
    employeeName: string;
    records: AttendanceRecord[];
}

export const AttendanceView: React.FC = () => {
    const [attendanceData, setAttendanceData] = useState<EmployeeAttendance[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadAllAttendance();
    }, []);

    const loadAllAttendance = () => {
        const registeredUsers = localStorage.getItem('registeredUsers');
        if (!registeredUsers) return;

        const users = JSON.parse(registeredUsers);
        const allAttendance: EmployeeAttendance[] = [];

        users.forEach((user: any) => {
            if (user.role === 'employee') {
                const userAttendance = localStorage.getItem(`attendance_${user.employeeId}`);
                if (userAttendance) {
                    const records = JSON.parse(userAttendance);
                    allAttendance.push({
                        employeeId: user.employeeId,
                        employeeName: user.name,
                        records: records
                    });
                }
            }
        });

        setAttendanceData(allAttendance);
    };

    const filteredData = attendanceData.filter(emp => {
        if (selectedEmployee !== 'all' && emp.employeeId !== selectedEmployee) return false;
        if (searchTerm && !emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    const getTodayStats = () => {
        const today = new Date().toDateString();
        let present = 0;
        let absent = 0;
        let total = attendanceData.length;

        attendanceData.forEach(emp => {
            const todayRecord = emp.records.find(r => new Date(r.date).toDateString() === today);
            if (todayRecord && todayRecord.status === 'present') {
                present++;
            } else {
                absent++;
            }
        });

        return { total, present, absent, percentage: total > 0 ? Math.round((present / total) * 100) : 0 };
    };

    const stats = getTodayStats();

    return (
        <DashboardLayout>
            <div className="attendance-view">
                <div className="page-header">
                    <div>
                        <h1><Calendar size={32} /> Attendance Management</h1>
                        <p>View and manage employee attendance records</p>
                    </div>
                </div>

                <div className="stats-row">
                    <Card className="stat-mini" hoverable>
                        <div className="stat-mini-content">
                            <span className="stat-mini-label">Total Employees</span>
                            <span className="stat-mini-value">{stats.total}</span>
                        </div>
                    </Card>
                    <Card className="stat-mini" hoverable>
                        <div className="stat-mini-content">
                            <span className="stat-mini-label">Present Today</span>
                            <span className="stat-mini-value" style={{ color: '#10b981' }}>{stats.present}</span>
                        </div>
                    </Card>
                    <Card className="stat-mini" hoverable>
                        <div className="stat-mini-content">
                            <span className="stat-mini-label">Absent Today</span>
                            <span className="stat-mini-value" style={{ color: '#ef4444' }}>{stats.absent}</span>
                        </div>
                    </Card>
                    <Card className="stat-mini" hoverable>
                        <div className="stat-mini-content">
                            <span className="stat-mini-label">Attendance Rate</span>
                            <span className="stat-mini-value" style={{ color: '#8b5cf6' }}>{stats.percentage}%</span>
                        </div>
                    </Card>
                </div>

                <Card>
                    <div className="filters-section">
                        <div className="search-box">
                            <Search size={20} />
                            <input
                                type="text"
                                placeholder="Search by employee name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="employee-select">
                            <label>Employee:</label>
                            <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
                                <option value="all">All Employees</option>
                                {attendanceData.map(emp => (
                                    <option key={emp.employeeId} value={emp.employeeId}>
                                        {emp.employeeName} ({emp.employeeId})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="attendance-data">
                        {filteredData.length === 0 ? (
                            <div className="no-data">
                                <p>No attendance records found</p>
                            </div>
                        ) : (
                            filteredData.map(emp => (
                                <div key={emp.employeeId} className="employee-section">
                                    <h3>{emp.employeeName} ({emp.employeeId})</h3>
                                    <div className="records-table">
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
                                                {emp.records.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} style={{ textAlign: 'center', padding: '1rem' }}>
                                                            No records yet
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    emp.records.slice(-10).reverse().map((record, index) => (
                                                        <tr key={index}>
                                                            <td>{new Date(record.date).toLocaleDateString('en-US', {
                                                                weekday: 'short',
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}</td>
                                                            <td>{record.checkIn}</td>
                                                            <td>{record.checkOut}</td>
                                                            <td>{record.hoursWorked}</td>
                                                            <td>
                                                                <span className={`status-badge ${record.status}`}>
                                                                    {record.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};
