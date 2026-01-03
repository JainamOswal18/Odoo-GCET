import { getDb } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { ROLES, ERROR_MESSAGES, EMPLOYMENT_TYPES } from '../config/constants.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../uploads/profiles');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Sanitize filename to prevent path traversal
        const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const ext = path.extname(sanitized);
        const name = path.basename(sanitized, ext);
        cb(null, `${Date.now()}-${name}${ext}`);
    },
});

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    },
});

export const getEmployeeProfile = async (req, res) => {
    try {
        const db = getDb();
        const userId = req.user.id;
        const { employeeId } = req.params;

        // Check authorization
        if (req.user.role === ROLES.EMPLOYEE) {
            const employee = await db.get('SELECT userId FROM employees WHERE id = ?', [employeeId]);
            if (!employee || employee.userId !== userId) {
                return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
            }
        }

        const employee = await db.get(
            'SELECT * FROM employees WHERE id = ? OR userId = ?',
            [employeeId, employeeId]
        );

        if (!employee) {
            return res.status(404).json({ error: ERROR_MESSAGES.EMPLOYEE_NOT_FOUND });
        }

        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllEmployees = async (req, res) => {
    try {
        const db = getDb();

        if (req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
        }

        const { page = 1, limit = 20, search = '' } = req.validatedQuery;
        const offset = (page - 1) * limit;

        const searchQuery = `%${search}%`;

        const employees = await db.all(
            `SELECT * FROM employees 
       WHERE firstName LIKE ? OR lastName LIKE ? OR employeeId LIKE ? OR email LIKE ?
       LIMIT ? OFFSET ?`,
            [searchQuery, searchQuery, searchQuery, searchQuery, limit, offset]
        );

        const countResult = await db.get(
            `SELECT COUNT(*) as count FROM employees 
       WHERE firstName LIKE ? OR lastName LIKE ? OR employeeId LIKE ? OR email LIKE ?`,
            [searchQuery, searchQuery, searchQuery, searchQuery]
        );

        res.status(200).json({
            employees,
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

export const updateEmployeeProfile = async (req, res) => {
    try {
        const db = getDb();
        const userId = req.user.id;
        const { employeeId } = req.params;
        const { firstName, lastName, phone, address, city, state, zipCode, country, designation, department, salary } = req.validatedData;

        // Get employee
        const employee = await db.get('SELECT * FROM employees WHERE id = ?', [employeeId]);

        if (!employee) {
            return res.status(404).json({ error: ERROR_MESSAGES.EMPLOYEE_NOT_FOUND });
        }

        // Check authorization
        if (req.user.role === ROLES.EMPLOYEE && employee.userId !== userId) {
            return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
        }

        // Employees can only edit certain fields
        const editableByEmployee = ['phone', 'address', 'city', 'state', 'zipCode', 'country'];
        let updateData = {};

        if (req.user.role === ROLES.ADMIN) {
            updateData = {
                firstName: firstName || employee.firstName,
                lastName: lastName || employee.lastName,
                phone: phone || employee.phone,
                address: address || employee.address,
                city: city || employee.city,
                state: state || employee.state,
                zipCode: zipCode || employee.zipCode,
                country: country || employee.country,
                designation: designation || employee.designation,
                department: department || employee.department,
                salary: salary !== undefined ? salary : employee.salary,
            };
        } else {
            editableByEmployee.forEach((field) => {
                if (req.validatedData[field] !== undefined) {
                    updateData[field] = req.validatedData[field];
                }
            });
        }

        const now = new Date().toISOString();
        const updates = Object.keys(updateData).map((key) => `${key} = ?`).join(', ');
        const values = Object.values(updateData);

        await db.run(
            `UPDATE employees SET ${updates}, updatedAt = ? WHERE id = ?`,
            [...values, now, employeeId]
        );

        // Log audit
        await db.run(
            `INSERT INTO auditLogs (id, userId, action, entityType, entityId, changes, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [uuidv4(), userId, 'EMPLOYEE_UPDATED', 'Employee', employeeId, JSON.stringify(updateData), now]
        );

        const updatedEmployee = await db.get('SELECT * FROM employees WHERE id = ?', [employeeId]);

        res.status(200).json({ message: 'Employee profile updated', employee: updatedEmployee });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const uploadProfilePicture = async (req, res) => {
    try {
        const db = getDb();
        const userId = req.user.id;
        const { employeeId } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Check authorization
        const employee = await db.get('SELECT * FROM employees WHERE id = ?', [employeeId]);

        if (!employee) {
            return res.status(404).json({ error: ERROR_MESSAGES.EMPLOYEE_NOT_FOUND });
        }

        if (req.user.role === ROLES.EMPLOYEE && employee.userId !== userId) {
            return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
        }

        // Delete old picture if exists
        if (employee.profilePicture) {
            const oldPath = path.join(uploadDir, employee.profilePicture);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        const now = new Date().toISOString();
        const fileName = req.file.filename;

        await db.run(
            'UPDATE employees SET profilePicture = ?, updatedAt = ? WHERE id = ?',
            [fileName, now, employeeId]
        );

        // Log audit
        await db.run(
            `INSERT INTO auditLogs (id, userId, action, entityType, entityId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), userId, 'PROFILE_PICTURE_UPLOADED', 'Employee', employeeId, now]
        );

        res.status(200).json({
            message: 'Profile picture uploaded successfully',
            fileName,
            url: `/uploads/profiles/${fileName}`,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteEmployee = async (req, res) => {
    try {
        const db = getDb();
        const userId = req.user.id;
        const { employeeId } = req.params;

        if (req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
        }

        const employee = await db.get('SELECT * FROM employees WHERE id = ?', [employeeId]);

        if (!employee) {
            return res.status(404).json({ error: ERROR_MESSAGES.EMPLOYEE_NOT_FOUND });
        }

        const now = new Date().toISOString();

        // Delete employee (will cascade delete related records due to FK constraints)
        await db.run('DELETE FROM employees WHERE id = ?', [employeeId]);

        // Deactivate user
        await db.run('UPDATE users SET isActive = ?, updatedAt = ? WHERE id = ?', [0, now, employee.userId]);

        // Log audit
        await db.run(
            `INSERT INTO auditLogs (id, userId, action, entityType, entityId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), userId, 'EMPLOYEE_DELETED', 'Employee', employeeId, now]
        );

        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
