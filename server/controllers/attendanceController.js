import { getDb } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { ROLES, ATTENDANCE_STATUS, ERROR_MESSAGES } from '../config/constants.js';

export const checkIn = async (req, res) => {
    try {
        const db = getDb();
        const userId = req.user.id;
        const { employeeId } = req.params;

        // Get employee
        const employee = await db.get('SELECT * FROM employees WHERE id = ?', [employeeId]);

        if (!employee) {
            return res.status(404).json({ error: ERROR_MESSAGES.EMPLOYEE_NOT_FOUND });
        }

        // Check authorization
        if (req.user.role === ROLES.EMPLOYEE && employee.userId !== userId) {
            return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
        }

        const today = new Date().toISOString().split('T')[0];
        const checkInTime = new Date().toISOString();

        const existingAttendance = await db.get(
            'SELECT * FROM attendance WHERE employeeId = ? AND date = ?',
            [employeeId, today]
        );

        if (existingAttendance) {
            return res.status(400).json({ error: 'Already checked in today' });
        }

        const now = new Date().toISOString();
        const attendanceId = uuidv4();

        await db.run(
            `INSERT INTO attendance (id, employeeId, date, checkInTime, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [attendanceId, employeeId, today, checkInTime, ATTENDANCE_STATUS.PRESENT, now, now]
        );

        // Log audit
        await db.run(
            `INSERT INTO auditLogs (id, userId, action, entityType, entityId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), userId, 'CHECKED_IN', 'Attendance', attendanceId, now]
        );

        res.status(201).json({
            message: 'Checked in successfully',
            checkInTime,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const checkOut = async (req, res) => {
    try {
        const db = getDb();
        const userId = req.user.id;
        const { employeeId } = req.params;

        // Get employee
        const employee = await db.get('SELECT * FROM employees WHERE id = ?', [employeeId]);

        if (!employee) {
            return res.status(404).json({ error: ERROR_MESSAGES.EMPLOYEE_NOT_FOUND });
        }

        // Check authorization
        if (req.user.role === ROLES.EMPLOYEE && employee.userId !== userId) {
            return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
        }

        const today = new Date().toISOString().split('T')[0];
        const checkOutTime = new Date().toISOString();

        const attendance = await db.get(
            'SELECT * FROM attendance WHERE employeeId = ? AND date = ?',
            [employeeId, today]
        );

        if (!attendance) {
            return res.status(404).json({ error: 'No check-in record found for today' });
        }

        if (attendance.checkOutTime) {
            return res.status(400).json({ error: 'Already checked out today' });
        }

        const now = new Date().toISOString();

        await db.run(
            'UPDATE attendance SET checkOutTime = ?, updatedAt = ? WHERE id = ?',
            [checkOutTime, now, attendance.id]
        );

        // Log audit
        await db.run(
            `INSERT INTO auditLogs (id, userId, action, entityType, entityId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), userId, 'CHECKED_OUT', 'Attendance', attendance.id, now]
        );

        res.status(200).json({
            message: 'Checked out successfully',
            checkOutTime,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAttendance = async (req, res) => {
    try {
        const db = getDb();
        const userId = req.user.id;
        const { employeeId } = req.params;
        const { startDate, endDate, page = 1, limit = 20 } = req.validatedQuery;

        // Get employee
        const employee = await db.get('SELECT * FROM employees WHERE id = ?', [employeeId]);

        if (!employee) {
            return res.status(404).json({ error: ERROR_MESSAGES.EMPLOYEE_NOT_FOUND });
        }

        // Check authorization
        if (req.user.role === ROLES.EMPLOYEE && employee.userId !== userId) {
            return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
        }

        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM attendance WHERE employeeId = ?';
        const params = [employeeId];

        if (startDate && endDate) {
            query += ' AND date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        query += ` ORDER BY date DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const attendance = await db.all(query, params);

        // Count total records
        let countQuery = 'SELECT COUNT(*) as count FROM attendance WHERE employeeId = ?';
        const countParams = [employeeId];

        if (startDate && endDate) {
            countQuery += ' AND date BETWEEN ? AND ?';
            countParams.push(startDate, endDate);
        }

        const countResult = await db.get(countQuery, countParams);

        res.status(200).json({
            attendance,
            pagination: {
                page,
                limit,
                total: countResult.count,
                pages: Math.ceil(countResult.count / limit),
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const markAttendance = async (req, res) => {
    try {
        const db = getDb();
        const userId = req.user.id;
        const { employeeId } = req.params;
        const { date, status, remarks } = req.validatedData;

        if (req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
        }

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date) || isNaN(new Date(date).getTime())) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        }

        // Validate status
        if (!Object.values(ATTENDANCE_STATUS).includes(status)) {
            return res.status(400).json({ error: 'Invalid attendance status' });
        }

        // Get employee
        const employee = await db.get('SELECT * FROM employees WHERE id = ?', [employeeId]);

        if (!employee) {
            return res.status(404).json({ error: ERROR_MESSAGES.EMPLOYEE_NOT_FOUND });
        }

        const existingAttendance = await db.get(
            'SELECT * FROM attendance WHERE employeeId = ? AND date = ?',
            [employeeId, date]
        );

        const now = new Date().toISOString();

        if (existingAttendance) {
            // Update existing
            await db.run(
                'UPDATE attendance SET status = ?, remarks = ?, updatedAt = ? WHERE id = ?',
                [status, remarks || null, now, existingAttendance.id]
            );

            // Log audit
            await db.run(
                `INSERT INTO auditLogs (id, userId, action, entityType, entityId, changes, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [uuidv4(), userId, 'ATTENDANCE_UPDATED', 'Attendance', existingAttendance.id, JSON.stringify({ status }), now]
            );
        } else {
            // Create new
            const attendanceId = uuidv4();
            await db.run(
                `INSERT INTO attendance (id, employeeId, date, status, remarks, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [attendanceId, employeeId, date, status, remarks || null, now, now]
            );

            // Log audit
            await db.run(
                `INSERT INTO auditLogs (id, userId, action, entityType, entityId, createdAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
                [uuidv4(), userId, 'ATTENDANCE_CREATED', 'Attendance', attendanceId, now]
            );
        }

        res.status(200).json({ message: 'Attendance marked successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
