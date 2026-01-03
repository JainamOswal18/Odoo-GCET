import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card } from '../../components/Card';
import { Calendar, Search } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
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
    const { showToast } = useToast();

    useEffect(() => {
        loadAllAttendance();
    }, []);

    const loadAllAttendance = async () => {
        try {
            const response = await api.getAllAttendance();
            const rawData = response.attendance;

            // Group by employee
            const groupedData: { [key: string]: EmployeeAttendance } = {};

            rawData.forEach((record: any) => {
                const empId = record.empCode || record.employeeId; // Use empCode (employeeId from employees table)
                if (!groupedData[empId]) {
                    groupedData[empId] = {
                        employeeId: empId,
                        employeeName: `${record.firstName} ${record.lastName}`,
                        records: []
                    };
                }

                // Calculate hours worked
                let hoursWorked = '-';
                if (record.checkInTime && record.checkOutTime) {
                    const start = new Date(record.checkInTime).getTime();
                    const end = new Date(record.checkOutTime).getTime();
                    const diff = (end - start) / (1000 * 60 * 60);
                    hoursWorked = `${diff.toFixed(1)} hrs`;
                }

                groupedData[empId].records.push({
                    date: record.date,
                    checkIn: record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-',
                    checkOut: record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-',
                    hoursWorked: hoursWorked,
                    status: record.status.toLowerCase()
                });
            });

            setAttendanceData(Object.values(groupedData));
        } catch (error: any) {
            showToast('error', error.message || 'Failed to load attendance data');
        }
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
