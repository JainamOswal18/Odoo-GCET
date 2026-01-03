import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { BarChart, Download, Calendar, Users, TrendingUp, FileText } from 'lucide-react';
import './AttendanceReport.css';

interface AttendanceStats {
    employeeId: string;
    employeeName: string;
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    attendanceRate: number;
}

export const AttendanceReport: React.FC = () => {
    const [stats, setStats] = useState<AttendanceStats[]>([]);
    const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7));
    const [selectedDepartment, setSelectedDepartment] = useState('All');

    useEffect(() => {
        loadAttendanceReport();
    }, [month, selectedDepartment]);

    const loadAttendanceReport = () => {
        const registeredUsers = localStorage.getItem('registeredUsers');
        if (!registeredUsers) return;

        const users = JSON.parse(registeredUsers);
        const employees = users.filter((u: any) => u.role === 'employee');

        const attendanceStats: AttendanceStats[] = employees.map((emp: any) => {
            const attendanceKey = `attendance_${emp.employeeId}`;
            const attendanceData = localStorage.getItem(attendanceKey);
            
            if (!attendanceData) {
                return {
                    employeeId: emp.employeeId,
                    employeeName: emp.name,
                    totalDays: 0,
                    presentDays: 0,
                    absentDays: 0,
                    lateDays: 0,
                    attendanceRate: 0
                };
            }

            const records = JSON.parse(attendanceData);
            const monthRecords = records.filter((r: any) => r.date.startsWith(month));

            const presentDays = monthRecords.filter((r: any) => r.status === 'Present').length;
            const absentDays = monthRecords.filter((r: any) => r.status === 'Absent').length;
            const lateDays = monthRecords.filter((r: any) => r.status === 'Late').length;
            const totalDays = monthRecords.length;
            const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

            return {
                employeeId: emp.employeeId,
                employeeName: emp.name,
                totalDays,
                presentDays,
                absentDays,
                lateDays,
                attendanceRate
            };
        });

        // Filter by department if needed
        if (selectedDepartment !== 'All') {
            const filteredStats = attendanceStats.filter((stat) => {
                const user = employees.find((e: any) => e.employeeId === stat.employeeId);
                return user?.department === selectedDepartment;
            });
            setStats(filteredStats);
        } else {
            setStats(attendanceStats);
        }
    };

    const calculateOverallStats = () => {
        const totalEmployees = stats.length;
        const avgAttendanceRate = stats.length > 0
            ? stats.reduce((sum, s) => sum + s.attendanceRate, 0) / stats.length
            : 0;
        const totalPresentDays = stats.reduce((sum, s) => sum + s.presentDays, 0);
        const totalAbsentDays = stats.reduce((sum, s) => sum + s.absentDays, 0);

        return {
            totalEmployees,
            avgAttendanceRate: avgAttendanceRate.toFixed(1),
            totalPresentDays,
            totalAbsentDays
        };
    };

    const handleDownloadReport = () => {
        const overallStats = calculateOverallStats();
        
        let csvContent = 'Employee ID,Employee Name,Total Days,Present Days,Absent Days,Late Days,Attendance Rate\n';
        
        stats.forEach(stat => {
            csvContent += `${stat.employeeId},${stat.employeeName},${stat.totalDays},${stat.presentDays},${stat.absentDays},${stat.lateDays},${stat.attendanceRate.toFixed(1)}%\n`;
        });

        csvContent += `\nOverall Statistics\n`;
        csvContent += `Total Employees,${overallStats.totalEmployees}\n`;
        csvContent += `Average Attendance Rate,${overallStats.avgAttendanceRate}%\n`;
        csvContent += `Total Present Days,${overallStats.totalPresentDays}\n`;
        csvContent += `Total Absent Days,${overallStats.totalAbsentDays}\n`;

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `attendance-report-${month}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const overallStats = calculateOverallStats();
    const departments = ['All', 'Engineering', 'HR', 'Marketing', 'Sales', 'Finance'];

    return (
        <DashboardLayout>
            <div className="attendance-report">
                <div className="report-header">
                    <div className="header-content">
                        <div className="header-icon">
                            <BarChart size={32} />
                        </div>
                        <div>
                            <h1>Attendance Report</h1>
                            <p>Comprehensive attendance analytics and insights</p>
                        </div>
                    </div>
                    <Button onClick={handleDownloadReport} className="download-btn">
                        <Download size={20} />
                        Download Report
                    </Button>
                </div>

                <div className="report-filters">
                    <Card>
                        <div className="filters-row">
                            <div className="filter-group">
                                <label>
                                    <Calendar size={18} />
                                    Select Month
                                </label>
                                <input
                                    type="month"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    max={new Date().toISOString().slice(0, 7)}
                                    className="month-input"
                                />
                            </div>
                            <div className="filter-group">
                                <label>
                                    <Users size={18} />
                                    Department
                                </label>
                                <select
                                    value={selectedDepartment}
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                    className="department-select"
                                >
                                    {departments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="overall-stats">
                    <Card className="stat-card-large">
                        <div className="stat-icon blue">
                            <Users size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{overallStats.totalEmployees}</div>
                            <div className="stat-label">Total Employees</div>
                        </div>
                    </Card>
                    <Card className="stat-card-large">
                        <div className="stat-icon green">
                            <TrendingUp size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{overallStats.avgAttendanceRate}%</div>
                            <div className="stat-label">Avg Attendance Rate</div>
                        </div>
                    </Card>
                    <Card className="stat-card-large">
                        <div className="stat-icon success">
                            <FileText size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{overallStats.totalPresentDays}</div>
                            <div className="stat-label">Total Present Days</div>
                        </div>
                    </Card>
                    <Card className="stat-card-large">
                        <div className="stat-icon danger">
                            <FileText size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{overallStats.totalAbsentDays}</div>
                            <div className="stat-label">Total Absent Days</div>
                        </div>
                    </Card>
                </div>

                <Card>
                    <div className="report-table-header">
                        <h2>Detailed Attendance Report</h2>
                        <span className="report-period">
                            Period: {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                    <div className="report-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Employee Name</th>
                                    <th>Total Days</th>
                                    <th>Present</th>
                                    <th>Absent</th>
                                    <th>Late</th>
                                    <th>Attendance Rate</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="no-data">
                                            No attendance data available for the selected period
                                        </td>
                                    </tr>
                                ) : (
                                    stats.map((stat) => (
                                        <tr key={stat.employeeId}>
                                            <td>{stat.employeeId}</td>
                                            <td className="employee-name-cell">{stat.employeeName}</td>
                                            <td>{stat.totalDays}</td>
                                            <td>
                                                <span className="badge badge-success">{stat.presentDays}</span>
                                            </td>
                                            <td>
                                                <span className="badge badge-danger">{stat.absentDays}</span>
                                            </td>
                                            <td>
                                                <span className="badge badge-warning">{stat.lateDays}</span>
                                            </td>
                                            <td>
                                                <div className="progress-bar-container">
                                                    <div 
                                                        className="progress-bar"
                                                        style={{ width: `${stat.attendanceRate}%` }}
                                                    />
                                                    <span className="progress-text">{stat.attendanceRate.toFixed(1)}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${stat.attendanceRate >= 90 ? 'excellent' : stat.attendanceRate >= 75 ? 'good' : 'poor'}`}>
                                                    {stat.attendanceRate >= 90 ? 'Excellent' : stat.attendanceRate >= 75 ? 'Good' : 'Needs Improvement'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};
