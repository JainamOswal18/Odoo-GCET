import { getDb } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/environment.js';
import { ROLES, ERROR_MESSAGES, PASSWORD_REGEX } from '../config/constants.js';
import { generateEmployeeId } from '../utils/idGenerator.js';
import { hashPassword, comparePassword } from '../utils/passwordUtils.js';
import { sendVerificationEmail } from '../utils/emailService.js';

export const register = async (req, res) => {
    try {
        const db = getDb();
        const { email, password, firstName, lastName, role } = req.validatedData;

        // Validate password strength
        if (!PASSWORD_REGEX.test(password)) {
            return res.status(400).json({ error: ERROR_MESSAGES.INVALID_PASSWORD });
        }

        // Check if email exists
        const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ error: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS });
        }

        const userId = uuidv4();
        const employeeId = generateEmployeeId();
        const hashedPassword = await hashPassword(password);
        const now = new Date().toISOString();

        // Create user
        await db.run(
            `INSERT INTO users (id, email, password, role, isEmailVerified, isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, email, hashedPassword, role || ROLES.EMPLOYEE, 0, 1, now, now]
        );

        // Create employee record
        const employeeId_uuid = uuidv4();
        await db.run(
            `INSERT INTO employees (id, userId, firstName, lastName, employeeId, email, dateOfJoining, employmentType, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [employeeId_uuid, userId, firstName, lastName, employeeId, email, now, 'Full-time', now, now]
        );

        // Create leave balance for current year
        const year = new Date().getFullYear();
        await db.run(
            `INSERT INTO leaveBalances (id, employeeId, year, paidLeaveBalance, sickLeaveBalance, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [uuidv4(), employeeId_uuid, year, 12, 6, now, now]
        );

        // Send verification email
        await sendVerificationEmail(email, firstName);

        // Log audit
        await db.run(
            `INSERT INTO auditLogs (id, userId, action, entityType, entityId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), userId, 'USER_REGISTERED', 'User', userId, now]
        );

        res.status(201).json({
            message: 'User registered successfully. Please verify your email.',
            userId,
            employeeId,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const db = getDb();
        const { email, password } = req.validatedData;

        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

        if (!user) {
            return res.status(401).json({ error: ERROR_MESSAGES.INVALID_CREDENTIALS });
        }

        const passwordMatch = await comparePassword(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: ERROR_MESSAGES.INVALID_CREDENTIALS });
        }

        if (!user.isActive) {
            return res.status(403).json({ error: 'User account is inactive' });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            ENV.JWT_SECRET,
            { expiresIn: ENV.JWT_EXPIRES_IN }
        );

        // Get employee details
        const employee = await db.get('SELECT * FROM employees WHERE userId = ?', [user.id]);

        // Log audit
        const now = new Date().toISOString();
        await db.run(
            `INSERT INTO auditLogs (id, userId, action, entityType, entityId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), user.id, 'USER_LOGIN', 'User', user.id, now]
        );

        res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
            },
            employee: employee ? {
                id: employee.id,
                firstName: employee.firstName,
                lastName: employee.lastName,
                employeeId: employee.employeeId,
            } : null,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const db = getDb();
        const userId = req.user.id;

        const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);

        if (!user) {
            return res.status(404).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ error: 'Email already verified' });
        }

        const now = new Date().toISOString();
        await db.run(
            'UPDATE users SET isEmailVerified = ?, updatedAt = ? WHERE id = ?',
            [1, now, userId]
        );

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const changePassword = async (req, res) => {
    try {
        const db = getDb();
        const { currentPassword, newPassword } = req.validatedData;
        const userId = req.user.id;

        const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);

        if (!user) {
            return res.status(404).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
        }

        const passwordMatch = await comparePassword(currentPassword, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        if (!PASSWORD_REGEX.test(newPassword)) {
            return res.status(400).json({ error: ERROR_MESSAGES.INVALID_PASSWORD });
        }

        const hashedPassword = await hashPassword(newPassword);
        const now = new Date().toISOString();

        await db.run(
            'UPDATE users SET password = ?, updatedAt = ? WHERE id = ?',
            [hashedPassword, now, userId]
        );

        const employee = await db.get('SELECT * FROM employees WHERE userId = ?', [userId]);

        // Log audit
        await db.run(
            `INSERT INTO auditLogs (id, userId, action, entityType, entityId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), userId, 'PASSWORD_CHANGED', 'User', userId, now]
        );

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date().toISOString();
        const db = getDb();

        // Log audit
        await db.run(
            `INSERT INTO auditLogs (id, userId, action, entityType, entityId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), userId, 'USER_LOGOUT', 'User', userId, now]
        );

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
