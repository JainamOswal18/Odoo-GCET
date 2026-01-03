import express from 'express';
import * as payrollController from '../controllers/payrollController.js';
import * as payrollValidator from '../validators/payrollValidator.js';
import { validateRequest, validateQuery } from '../middleware/validation.js';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.get(
    '/:employeeId',
    verifyToken,
    validateQuery(payrollValidator.getPayrollSchema),
    payrollController.getPayroll
);

router.post(
    '/:employeeId',
    verifyToken,
    checkRole([ROLES.ADMIN]),
    validateRequest(payrollValidator.createPayrollSchema),
    payrollController.createPayroll
);

router.put(
    '/:payrollId',
    verifyToken,
    checkRole([ROLES.ADMIN]),
    validateRequest(payrollValidator.updatePayrollSchema),
    payrollController.updatePayroll
);

router.post(
    '/:payrollId/process',
    verifyToken,
    checkRole([ROLES.ADMIN]),
    payrollController.processPayroll
);

router.post(
    '/:payrollId/mark-paid',
    verifyToken,
    checkRole([ROLES.ADMIN]),
    payrollController.markPayrollAsPaid
);

router.get(
    '/:employeeId/components',
    verifyToken,
    payrollController.getSalaryComponents
);

router.post(
    '/:employeeId/components',
    verifyToken,
    checkRole([ROLES.ADMIN]),
    payrollController.createSalaryComponent
);

router.put(
    '/:employeeId/components/:componentId',
    verifyToken,
    checkRole([ROLES.ADMIN]),
    payrollController.updateSalaryComponent
);

router.delete(
    '/:employeeId/components/:componentId',
    verifyToken,
    checkRole([ROLES.ADMIN]),
    payrollController.deleteSalaryComponent
);

export default router;
