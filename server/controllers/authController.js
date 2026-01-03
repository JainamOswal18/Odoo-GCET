import { getDb } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { ENV } from '../config/environment.js';
import { ROLES, ERROR_MESSAGES, PASSWORD_REGEX } from '../config/constants.js';
import { generateEmployeeId, generateRandomPassword } from '../utils/idGenerator.js';
import { hashPassword, comparePassword } from '../utils/passwordUtils.js';
import { sendVerificationEmail, sendWelcomeEmailWithCredentials } from '../utils/emailService.js';

export const register = async (req, res) => {
    try {
        const db = getDb();
        const { email, firstName, lastName, phone, companyName } = req.validatedData;

        // Only admin can register new users
        if (req.user && req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
        }

        // Get avatar file path if uploaded
        const profilePicture = req.file ? `/uploads/profiles/${req.file.filename}` : null;

        // Check if email exists
        const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ error: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS });
        }

        const userId = uuidv4();
        const now = new Date().toISOString();
        const year = new Date().getFullYear();

        // Get maximum serial number for this year across ALL employees
        // Query all employee IDs that contain the current year and extract max serial
        const allEmployeesThisYear = await db.all(
            `SELECT employeeId FROM employees WHERE employeeId LIKE ?`,
            [`%${year}%`]
        );

        let serialNumber = 1;
        if (allEmployeesThisYear && allEmployeesThisYear.length > 0) {
            // Extract all serial numbers (last 4 digits) and find the maximum
            const serialNumbers = allEmployeesThisYear
                .map(emp => {
                    const match = emp.employeeId.match(/\d{4}$/);
                    return match ? parseInt(match[0]) : 0;
                })
                .filter(num => num > 0);

            if (serialNumbers.length > 0) {
                serialNumber = Math.max(...serialNumbers) + 1;
            }
        }

        // Generate login ID in format: OI[FirstName2][LastName2][Year][Serial]
        const loginId = generateEmployeeId(firstName, lastName, year, serialNumber);

        // Auto-generate password
        const generatedPassword = generateRandomPassword();
        const hashedPassword = await hashPassword(generatedPassword);

        // Create user (always as Employee, not Admin)
        // Email is pre-verified since admin creates the account
        await db.run(
            `INSERT INTO users (id, email, password, role, isEmailVerified, isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, email, hashedPassword, ROLES.EMPLOYEE, 1, 1, now, now]
        );

        // Create employee record with profile picture
        const employeeId_uuid = uuidv4();
        await db.run(
            `INSERT INTO employees (id, userId, firstName, lastName, employeeId, email, phone, profilePicture, dateOfJoining, employmentType, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [employeeId_uuid, userId, firstName, lastName, loginId, email, phone, profilePicture, now, 'Full-time', now, now]
        );

        // Create leave balance for current year
        await db.run(
            `INSERT INTO leaveBalances (id, employeeId, year, paidLeaveBalance, sickLeaveBalance, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [uuidv4(), employeeId_uuid, year, 12, 6, now, now]
        );

        // Send welcome email with credentials to employee (optional - only if email is configured)
        if (ENV.EMAIL_USER && ENV.EMAIL_PASSWORD) {
            try {
                await sendWelcomeEmailWithCredentials(email, firstName, loginId, generatedPassword);
            } catch (error) {
                // Don't fail registration if email fails
                console.error('Failed to send welcome email:', error);
            }
        }

        // Log audit
        const adminUserId = req.user ? req.user.id : userId;
        await db.run(
            `INSERT INTO auditLogs (id, userId, action, entityType, entityId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), adminUserId, 'USER_REGISTERED', 'User', userId, now]
        );

        res.status(201).json({
            message: 'Employee registered successfully.',
            loginId,
            generatedPassword,
            email,
            firstName,
            lastName,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const db = getDb();
        const { loginId, email, password } = req.validatedData;

        // Use whichever field was provided
        const identifier = loginId || email;

        // Find user by email or login ID
        let user = await db.get('SELECT * FROM users WHERE email = ?', [identifier]);

        if (!user) {
            // Try to find by employee login ID
            const employee = await db.get('SELECT userId FROM employees WHERE employeeId = ?', [identifier]);
            if (employee) {
                user = await db.get('SELECT * FROM users WHERE id = ?', [employee.userId]);
            }
        }

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
                name: employee ? `${employee.firstName} ${employee.lastName}` : '',
                isEmailVerified: user.isEmailVerified,
            },
            employee: employee ? {
                id: employee.id,
                firstName: employee.firstName,
                lastName: employee.lastName,
                employeeId: employee.employeeId,
                department: employee.department,
                position: employee.designation,
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

export const forgotPassword = async (req, res) => {
    try {
        const db = getDb();
        const { email } = req.validatedData || req.body;

        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

        if (!user) {
            // Return success even if user not found (security best practice)
            return res.status(200).json({
                message: 'If the email exists, a password reset link has been sent.'
            });
        }

        // Generate reset token (valid for 1 hour)
        const resetToken = jwt.sign(
            { id: user.id, email: user.email },
            ENV.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // In production, you'd save this token to database
        // For now, we'll just send it via email

        const resetLink = `${ENV.FRONTEND_URL}/reset-password?token=${resetToken}`;

        // Send password reset email
        const transporter = nodemailer.createTransport({
            service: ENV.EMAIL_SERVICE,
            auth: {
                user: ENV.EMAIL_USER,
                pass: ENV.EMAIL_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: ENV.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request - Dayflow HRMS',
            html: `
                <h2>Password Reset Request</h2>
                <p>Hi,</p>
                <p>You requested to reset your password. Click the link below to reset it:</p>
                <a href="${resetLink}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <br>
                <p>Thanks,</p>
                <p>Dayflow HRMS Team</p>
            `,
        });

        // Log audit
        const now = new Date().toISOString();
        await db.run(
            `INSERT INTO auditLogs (id, userId, action, entityType, entityId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), user.id, 'PASSWORD_RESET_REQUESTED', 'User', user.id, now]
        );

        res.status(200).json({
            message: 'If the email exists, a password reset link has been sent.'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const db = getDb();
        const { token, newPassword } = req.validatedData || req.body;

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, ENV.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const user = await db.get('SELECT * FROM users WHERE id = ?', [decoded.id]);

        if (!user) {
            return res.status(404).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
        }

        if (!PASSWORD_REGEX.test(newPassword)) {
            return res.status(400).json({ error: ERROR_MESSAGES.INVALID_PASSWORD });
        }

        const hashedPassword = await hashPassword(newPassword);
        const now = new Date().toISOString();

        await db.run(
            'UPDATE users SET password = ?, updatedAt = ? WHERE id = ?',
            [hashedPassword, now, decoded.id]
        );

        // Log audit
        await db.run(
            `INSERT INTO auditLogs (id, userId, action, entityType, entityId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), decoded.id, 'PASSWORD_RESET', 'User', decoded.id, now]
        );

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
