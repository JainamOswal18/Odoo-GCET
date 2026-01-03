import { getDb } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { ROLES, LEAVE_STATUS, LEAVE_TYPES, ERROR_MESSAGES } from '../config/constants.js';
import { calculateWorkingDays } from '../utils/dateUtils.js';

export const applyLeave = async (req, res) => {
    try {
        const db = getDb();
        const userId = req.user.id;
        const { employeeId } = req.params;
        const { leaveType, startDate, endDate, remarks } = req.validatedData;

        // Get employee
        const employee = await db.get('SELECT * FROM employees WHERE id = ?', [employeeId]);

        if (!employee) {
            return res.status(404).json({ error: ERROR_MESSAGES.EMPLOYEE_NOT_FOUND });
        }

        // Check authorization
        if (req.user.role === ROLES.EMPLOYEE && employee.userId !== userId) {
            return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
        }

        // Validate dates (normalize to start of day to avoid timezone issues)
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        if (start > end) {
            return res.status(400).json({ error: ERROR_MESSAGES.INVALID_DATE_RANGE });
        }

        if (start < new Date(new Date().setHours(0, 0, 0, 0))) {
            return res.status(400).json({ error: 'Cannot apply leave for past dates' });
        }

        // Validate leave type
        if (!Object.values(LEAVE_TYPES).includes(leaveType)) {
            return res.status(400).json({ error: 'Invalid leave type' });
        }

        // Calculate number of days
        const numberOfDays = calculateWorkingDays(startDate, endDate);

        // Check leave balance
        const year = new Date().getFullYear();

        // Create leave balance if doesn't exist (using INSERT OR IGNORE to prevent race condition)
        const now = new Date().toISOString();
        await db.run(
            `INSERT OR IGNORE INTO leaveBalances (id, employeeId, year, paidLeaveBalance, sickLeaveBalance, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [uuidv4(), employeeId, year, 12, 6, now, now]
        );

        const leaveBalance = await db.get(
            'SELECT * FROM leaveBalances WHERE employeeId = ? AND year = ?',
            [employeeId, year]
        );

        const balanceField = `${leaveType.toLowerCase()}LeaveBalance`;
        const currentBalance = leaveBalance?.[balanceField] || (leaveType === LEAVE_TYPES.PAID ? 12 : leaveType === LEAVE_TYPES.SICK ? 6 : 0);

        if (leaveType !== LEAVE_TYPES.UNPAID && currentBalance < numberOfDays) {
            return res.status(400).json({
                error: ERROR_MESSAGES.INSUFFICIENT_LEAVE_BALANCE,
                available: currentBalance,
                requested: numberOfDays,
            });
        }

        const leaveRequestId = uuidv4();

        // Create leave request
        await db.run(
            `INSERT INTO leaveRequests (id, employeeId, leaveType, startDate, endDate, numberOfDays, remarks, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [leaveRequestId, employeeId, leaveType, startDate, endDate, numberOfDays, remarks || null, LEAVE_STATUS.PENDING, now, now]
        );

        // Log audit
        await db.run(
            `INSERT INTO auditLogs (id, userId, action, entityType, entityId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), userId, 'LEAVE_APPLIED', 'LeaveRequest', leaveRequestId, now]
        );

        res.status(201).json({
            message: 'Leave request submitted successfully',
            leaveRequestId,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getLeaveRequests = async (req, res) => {
    try {
        const db = getDb();
        const userId = req.user.id;
        const { employeeId } = req.params;
        const { status, page = 1, limit = 20 } = req.validatedQuery;

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

        let query = 'SELECT * FROM leaveRequests WHERE employeeId = ?';
        const params = [employeeId];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const leaveRequests = await db.all(query, params);

        // Count total
        let countQuery = 'SELECT COUNT(*) as count FROM leaveRequests WHERE employeeId = ?';
        const countParams = [employeeId];

        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }

        const countResult = await db.get(countQuery, countParams);

        res.status(200).json({
            leaveRequests,
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

export const approveLeave = async (req, res) => {
    try {
        const db = getDb();
        const userId = req.user.id;
        const { leaveRequestId } = req.params;
        const approvalComments = req.validatedData?.approvalComments || req.body?.approvalComments;

        if (req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
        }

        const leaveRequest = await db.get('SELECT * FROM leaveRequests WHERE id = ?', [leaveRequestId]);

        if (!leaveRequest) {
            return res.status(404).json({ error: ERROR_MESSAGES.LEAVE_REQUEST_NOT_FOUND });
        }

        if (leaveRequest.status !== LEAVE_STATUS.PENDING) {
            return res.status(400).json({ error: 'Only pending leave requests can be approved' });
        }

        const now = new Date().toISOString();
        const year = new Date().getFullYear();

        // Update leave request
        await db.run(
            'UPDATE leaveRequests SET status = ?, approvedBy = ?, approvalComments = ?, updatedAt = ? WHERE id = ?',
            [LEAVE_STATUS.APPROVED, userId, approvalComments || null, now, leaveRequestId]
        );

        // Update leave balance
        const leaveType = leaveRequest.leaveType.toLowerCase();
        let balanceField;

        // Whitelist balance fields to prevent SQL injection
        if (leaveType === 'paid') {
            balanceField = 'paidLeaveBalance';
        } else if (leaveType === 'sick') {
            balanceField = 'sickLeaveBalance';
        } else if (leaveType === 'unpaid') {
            balanceField = 'unpaidLeaveBalance';
        } else {
            return res.status(400).json({ error: 'Invalid leave type' });
        }

        await db.run(
            `UPDATE leaveBalances SET ${balanceField} = ${balanceField} - ? WHERE employeeId = ? AND year = ?`,
            [leaveRequest.numberOfDays, leaveRequest.employeeId, year]
        );

        // Log audit
        await db.run(
            `INSERT INTO auditLogs (id, userId, action, entityType, entityId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), userId, 'LEAVE_APPROVED', 'LeaveRequest', leaveRequestId, now]
        );

        res.status(200).json({ message: 'Leave request approved' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const rejectLeave = async (req, res) => {
    try {
        const db = getDb();
        const userId = req.user.id;
        const { leaveRequestId } = req.params;
        const approvalComments = req.validatedData?.approvalComments || req.body?.approvalComments;

        if (req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
        }

        const leaveRequest = await db.get('SELECT * FROM leaveRequests WHERE id = ?', [leaveRequestId]);

        if (!leaveRequest) {
            return res.status(404).json({ error: ERROR_MESSAGES.LEAVE_REQUEST_NOT_FOUND });
        }

        if (leaveRequest.status !== LEAVE_STATUS.PENDING) {
            return res.status(400).json({ error: 'Only pending leave requests can be rejected' });
        }

        const now = new Date().toISOString();

        await db.run(
            'UPDATE leaveRequests SET status = ?, approvedBy = ?, approvalComments = ?, updatedAt = ? WHERE id = ?',
            [LEAVE_STATUS.REJECTED, userId, approvalComments || null, now, leaveRequestId]
        );

        // Log audit
        await db.run(
            `INSERT INTO auditLogs (id, userId, action, entityType, entityId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), userId, 'LEAVE_REJECTED', 'LeaveRequest', leaveRequestId, now]
        );

        res.status(200).json({ message: 'Leave request rejected' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getLeaveBalance = async (req, res) => {
    try {
        const db = getDb();
        const userId = req.user.id;
        const { employeeId } = req.params;
        const { year = new Date().getFullYear() } = req.validatedQuery;

        // Get employee
        const employee = await db.get('SELECT * FROM employees WHERE id = ?', [employeeId]);

        if (!employee) {
            return res.status(404).json({ error: ERROR_MESSAGES.EMPLOYEE_NOT_FOUND });
        }

        // Check authorization
        if (req.user.role === ROLES.EMPLOYEE && employee.userId !== userId) {
            return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
        }

        let leaveBalance = await db.get(
            'SELECT * FROM leaveBalances WHERE employeeId = ? AND year = ?',
            [employeeId, year]
        );

        if (!leaveBalance) {
            // Create default balance
            const balanceId = uuidv4();
            const now = new Date().toISOString();
            await db.run(
                `INSERT INTO leaveBalances (id, employeeId, year, paidLeaveBalance, sickLeaveBalance, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [balanceId, employeeId, year, 12, 6, now, now]
            );

            leaveBalance = await db.get(
                'SELECT * FROM leaveBalances WHERE id = ?',
                [balanceId]
            );
        }

        res.status(200).json(leaveBalance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllLeaveRequests = async (req, res) => {
    try {
        const db = getDb();
        const { status } = req.query;

        if (req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
        }

        let query = `
            SELECT lr.*, e.firstName, e.lastName, e.employeeId as empCode
            FROM leaveRequests lr
            JOIN employees e ON lr.employeeId = e.id
        `;
        const params = [];

        if (status && status !== 'all') {
            // Convert to Title Case to match DB constants (Pending, Approved, Rejected)
            const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
            query += ' WHERE lr.status = ?';
            params.push(formattedStatus);
        }

        query += ' ORDER BY lr.createdAt DESC';

        const leaveRequests = await db.all(query, params);

        res.status(200).json({ leaveRequests });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
