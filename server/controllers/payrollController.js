import { getDb } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { ROLES, ERROR_MESSAGES, PAYROLL_STATUS } from '../config/constants.js';

export const getPayroll = async (req, res) => {
    try {
        const db = getDb();
        const userId = req.user.id;
        const { employeeId } = req.params;
        const { month, year, page = 1, limit = 20 } = req.validatedQuery;

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
        let query = 'SELECT * FROM payroll WHERE employeeId = ?';
        const params = [employeeId];

        if (month) {
            query += ' AND month = ?';
            params.push(month);
        }

        if (year) {
            query += ' AND year = ?';
            params.push(year);
        }

        query += ' ORDER BY year DESC, month DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const payroll = await db.all(query, params);

        // Count total
        let countQuery = 'SELECT COUNT(*) as count FROM payroll WHERE employeeId = ?';
        const countParams = [employeeId];

        if (month) {
            countQuery += ' AND month = ?';
            countParams.push(month);
        }

        if (year) {
            countQuery += ' AND year = ?';
            countParams.push(year);
        }

        const countResult = await db.get(countQuery, countParams);

        res.status(200).json({
            payroll,
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

export const createPayroll = async (req, res) => {
    try {
        const db = getDb();
        const userId = req.user.id;
        const { employeeId } = req.params;
        const data = req.validatedData || req.body;
        const { baseSalary, allowances = 0, deductions = 0, bonus = 0, month, year, remarks } = data;

        if (req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
        }

        // Get employee
        const employee = await db.get('SELECT * FROM employees WHERE id = ?', [employeeId]);

        if (!employee) {
            return res.status(404).json({ error: ERROR_MESSAGES.EMPLOYEE_NOT_FOUND });
        }

        // Check if payroll already exists
        const existingPayroll = await db.get(
            'SELECT * FROM payroll WHERE employeeId = ? AND month = ? AND year = ?',
            [employeeId, month, year]
        );

        if (existingPayroll) {
            return res.status(400).json({ error: 'Payroll already exists for this month' });
        }

        const netSalary = baseSalary + allowances + bonus - deductions;
        const now = new Date().toISOString();
        const payrollId = uuidv4();

        await db.run(
            `INSERT INTO payroll (id, employeeId, baseSalary, allowances, deductions, bonus, month, year, netSalary, status, remarks, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [payrollId, employeeId, baseSalary, allowances, deductions, bonus, month, year, netSalary, PAYROLL_STATUS.DRAFT, remarks || null, now, now]
        );

        // Log audit
        await db.run(
            `INSERT INTO auditLogs (id, userId, action, entityType, entityId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), userId, 'PAYROLL_CREATED', 'Payroll', payrollId, now]
        );

        res.status(201).json({
            message: 'Payroll created successfully',
            payrollId,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updatePayroll = async (req, res) => {
    try {
        const db = getDb();
        const userId = req.user.id;
        const { payrollId } = req.params;
        const { baseSalary, allowances, deductions, bonus, remarks } = req.validatedData;

        if (req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
        }

        const payroll = await db.get('SELECT * FROM payroll WHERE id = ?', [payrollId]);

        if (!payroll) {
            return res.status(404).json({ error: 'Payroll not found' });
        }

        const newBaseSalary = baseSalary !== undefined ? baseSalary : payroll.baseSalary;
        const newAllowances = allowances !== undefined ? allowances : payroll.allowances;
        const newDeductions = deductions !== undefined ? deductions : payroll.deductions;
        const newBonus = bonus !== undefined ? bonus : payroll.bonus;
        const newNetSalary = newBaseSalary + newAllowances + newBonus - newDeductions;

        const now = new Date().toISOString();

        await db.run(
            `UPDATE payroll SET baseSalary = ?, allowances = ?, deductions = ?, bonus = ?, netSalary = ?, remarks = ?, updatedAt = ? WHERE id = ?`,
            [newBaseSalary, newAllowances, newDeductions, newBonus, newNetSalary, remarks || payroll.remarks, now, payrollId]
        );

        // Log audit
        await db.run(
            `INSERT INTO auditLogs (id, userId, action, entityType, entityId, changes, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [uuidv4(), userId, 'PAYROLL_UPDATED', 'Payroll', payrollId, JSON.stringify({ baseSalary: newBaseSalary, netSalary: newNetSalary }), now]
        );

        res.status(200).json({ message: 'Payroll updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const processPayroll = async (req, res) => {
    try {
        const db = getDb();
        const userId = req.user.id;
        const { payrollId } = req.params;

        if (req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
        }

        const payroll = await db.get('SELECT * FROM payroll WHERE id = ?', [payrollId]);

        if (!payroll) {
            return res.status(404).json({ error: 'Payroll not found' });
        }

        const now = new Date().toISOString();

        await db.run(
            'UPDATE payroll SET status = ?, updatedAt = ? WHERE id = ?',
            [PAYROLL_STATUS.PROCESSED, now, payrollId]
        );

        // Log audit
        await db.run(
            `INSERT INTO auditLogs (id, userId, action, entityType, entityId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), userId, 'PAYROLL_PROCESSED', 'Payroll', payrollId, now]
        );

        res.status(200).json({ message: 'Payroll processed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const markPayrollAsPaid = async (req, res) => {
    try {
        const db = getDb();
        const userId = req.user.id;
        const { payrollId } = req.params;

        if (req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
        }

        const payroll = await db.get('SELECT * FROM payroll WHERE id = ?', [payrollId]);

        if (!payroll) {
            return res.status(404).json({ error: 'Payroll not found' });
        }

        const now = new Date().toISOString();

        await db.run(
            'UPDATE payroll SET status = ?, paidDate = ?, updatedAt = ? WHERE id = ?',
            [PAYROLL_STATUS.PAID, now, now, payrollId]
        );

        // Log audit
        await db.run(
            `INSERT INTO auditLogs (id, userId, action, entityType, entityId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), userId, 'PAYROLL_MARKED_PAID', 'Payroll', payrollId, now]
        );

        res.status(200).json({ message: 'Payroll marked as paid' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getSalaryComponents = async (req, res) => {
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

        const components = await db.all(
            'SELECT * FROM salaryComponents WHERE employeeId = ? AND isActive = 1 ORDER BY componentType, componentName',
            [employeeId]
        );

        // Calculate component values based on base salary
        const baseSalary = employee.salary || 0;
        const calculatedComponents = components.map(comp => ({
            ...comp,
            calculatedAmount: comp.calculationType === 'Percentage'
                ? (baseSalary * comp.value) / 100
                : comp.value
        }));

        res.status(200).json({
            components: calculatedComponents,
            baseSalary,
            employeeId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createSalaryComponent = async (req, res) => {
    try {
        const db = getDb();
        const userId = req.user.id;
        const { employeeId } = req.params;
        const { componentName, componentType, calculationType, value, description } = req.body;

        if (req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
        }

        // Get employee
        const employee = await db.get('SELECT * FROM employees WHERE id = ?', [employeeId]);

        if (!employee) {
            return res.status(404).json({ error: ERROR_MESSAGES.EMPLOYEE_NOT_FOUND });
        }

        const now = new Date().toISOString();
        const componentId = uuidv4();

        await db.run(
            `INSERT INTO salaryComponents (id, employeeId, componentName, componentType, calculationType, value, description, isActive, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [componentId, employeeId, componentName, componentType, calculationType, value, description || '', 1, now, now]
        );

        // Log audit
        await db.run(
            `INSERT INTO auditLogs (id, userId, action, entityType, entityId, createdAt)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), userId, 'SALARY_COMPONENT_CREATED', 'SalaryComponent', componentId, now]
        );

        res.status(201).json({ message: 'Salary component created successfully', componentId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateSalaryComponent = async (req, res) => {
    try {
        const db = getDb();
        const userId = req.user.id;
        const { employeeId, componentId } = req.params;
        const { componentName, componentType, calculationType, value, description } = req.body;

        if (req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
        }

        const component = await db.get(
            'SELECT * FROM salaryComponents WHERE id = ? AND employeeId = ?',
            [componentId, employeeId]
        );

        if (!component) {
            return res.status(404).json({ error: 'Salary component not found' });
        }

        const now = new Date().toISOString();

        await db.run(
            `UPDATE salaryComponents 
             SET componentName = ?, componentType = ?, calculationType = ?, value = ?, description = ?, updatedAt = ?
             WHERE id = ?`,
            [componentName, componentType, calculationType, value, description || '', now, componentId]
        );

        // Log audit
        await db.run(
            `INSERT INTO auditLogs (id, userId, action, entityType, entityId, createdAt)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), userId, 'SALARY_COMPONENT_UPDATED', 'SalaryComponent', componentId, now]
        );

        res.status(200).json({ message: 'Salary component updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteSalaryComponent = async (req, res) => {
    try {
        const db = getDb();
        const userId = req.user.id;
        const { employeeId, componentId } = req.params;

        if (req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
        }

        const component = await db.get(
            'SELECT * FROM salaryComponents WHERE id = ? AND employeeId = ?',
            [componentId, employeeId]
        );

        if (!component) {
            return res.status(404).json({ error: 'Salary component not found' });
        }

        const now = new Date().toISOString();

        // Soft delete
        await db.run(
            'UPDATE salaryComponents SET isActive = 0, updatedAt = ? WHERE id = ?',
            [now, componentId]
        );

        // Log audit
        await db.run(
            `INSERT INTO auditLogs (id, userId, action, entityType, entityId, createdAt)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), userId, 'SALARY_COMPONENT_DELETED', 'SalaryComponent', componentId, now]
        );

        res.status(200).json({ message: 'Salary component deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
