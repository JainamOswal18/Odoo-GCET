import { getDb } from '../config/database.js';
import { ROLES } from '../config/constants.js';

export const getEmployeeDashboard = async (req, res) => {
    try {
        const db = getDb();
        const userId = req.user.id;

        const employee = await db.get('SELECT * FROM employees WHERE userId = ?', [userId]);

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Get today's attendance
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = await db.get(
            'SELECT * FROM attendance WHERE employeeId = ? AND date = ?',
            [employee.id, today]
        );

        // Get pending leave requests
        const pendingLeaves = await db.all(
            'SELECT * FROM leaveRequests WHERE employeeId = ? AND status = "Pending" ORDER BY createdAt DESC LIMIT 5',
            [employee.id]
        );

        // Get current year leave balance
        const year = new Date().getFullYear();
        const leaveBalance = await db.get(
            'SELECT * FROM leaveBalances WHERE employeeId = ? AND year = ?',
            [employee.id, year]
        );

        // Get recent payroll
        const recentPayroll = await db.get(
            'SELECT * FROM payroll WHERE employeeId = ? ORDER BY year DESC, month DESC LIMIT 1',
            [employee.id]
        );

        // Get attendance stats (current month)
        const monthStart = new Date().toISOString().split('T')[0].slice(0, 7);
        const attendanceStats = await db.get(
            `SELECT 
        COUNT(*) as totalDays,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as presentDays,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absentDays,
        SUM(CASE WHEN status = 'Half-day' THEN 1 ELSE 0 END) as halfDays
       FROM attendance 
       WHERE employeeId = ? AND date LIKE ?`,
            [employee.id, `${monthStart}%`]
        );

        res.status(200).json({
            employee: {
                id: employee.id,
                firstName: employee.firstName,
                lastName: employee.lastName,
                employeeId: employee.employeeId,
                designation: employee.designation,
                department: employee.department,
                profilePicture: employee.profilePicture,
            },
            todayAttendance,
            pendingLeaves,
            leaveBalance,
            recentPayroll,
            attendanceStats,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAdminDashboard = async (req, res) => {
    try {
        const db = getDb();

        if (req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // Total employees
        const employeeStats = await db.get(
            'SELECT COUNT(*) as total FROM employees'
        );

        // Total active employees
        const activeEmployees = await db.get(
            'SELECT COUNT(*) as total FROM users WHERE role = "Employee" AND isActive = 1'
        );

        // Pending leave requests
        const pendingLeaves = await db.all(
            `SELECT lr.*, e.firstName, e.lastName, e.employeeId 
       FROM leaveRequests lr 
       JOIN employees e ON lr.employeeId = e.id 
       WHERE lr.status = 'Pending' 
       ORDER BY lr.createdAt DESC LIMIT 10`
        );

        // Today's attendance overview
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = await db.get(
            `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'Half-day' THEN 1 ELSE 0 END) as halfDay
       FROM attendance 
       WHERE date = ?`,
            [today]
        );

        // Department-wise employee distribution
        const departmentStats = await db.all(
            `SELECT department, COUNT(*) as count 
       FROM employees 
       GROUP BY department`
        );

        // Payroll summary (current month)
        const now = new Date();
        const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
        const currentYear = now.getFullYear();

        const payrollSummary = await db.get(
            `SELECT 
        COUNT(*) as processedCount,
        SUM(netSalary) as totalAmount
       FROM payroll 
       WHERE month = ? AND year = ? AND status = 'Paid'`,
            [currentMonth, currentYear]
        );

        // Recent activities
        const recentActivities = await db.all(
            `SELECT * FROM auditLogs 
       ORDER BY createdAt DESC LIMIT 20`
        );

        res.status(200).json({
            employeeStats,
            activeEmployees,
            pendingLeaves,
            todayAttendance,
            departmentStats,
            payrollSummary,
            recentActivities,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAttendanceReport = async (req, res) => {
    try {
        const db = getDb();

        if (req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const { startDate, endDate, department } = req.validatedQuery;

        let query = `
      SELECT 
        e.id,
        e.firstName,
        e.lastName,
        e.employeeId,
        e.designation,
        e.department,
        COUNT(*) as totalDays,
        SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as presentDays,
        SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absentDays,
        SUM(CASE WHEN a.status = 'Half-day' THEN 1 ELSE 0 END) as halfDays
      FROM employees e
      LEFT JOIN attendance a ON e.id = a.employeeId
      WHERE 1=1
    `;

        const params = [];

        if (startDate && endDate) {
            query += ' AND a.date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        if (department) {
            query += ' AND e.department = ?';
            params.push(department);
        }

        query += ' GROUP BY e.id';

        const report = await db.all(query, params);

        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getSalaryReport = async (req, res) => {
    try {
        const db = getDb();

        if (req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const { month, year, department } = req.validatedQuery;

        let query = `
      SELECT 
        e.id,
        e.firstName,
        e.lastName,
        e.employeeId,
        e.designation,
        e.department,
        p.baseSalary,
        p.allowances,
        p.deductions,
        p.bonus,
        p.netSalary,
        p.status,
        p.month,
        p.year
      FROM employees e
      LEFT JOIN payroll p ON e.id = p.employeeId
      WHERE 1=1
    `;

        const params = [];

        if (month && year) {
            query += ' AND p.month = ? AND p.year = ?';
            params.push(month, year);
        }

        if (department) {
            query += ' AND e.department = ?';
            params.push(department);
        }

        query += ' ORDER BY e.firstName ASC';

        const report = await db.all(query, params);

        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
