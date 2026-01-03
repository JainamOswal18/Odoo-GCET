import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import * as dashboardValidator from '../validators/dashboardValidator.js';
import { validateQuery } from '../middleware/validation.js';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.get('/employee', verifyToken, dashboardController.getEmployeeDashboard);

router.get(
    '/admin',
    verifyToken,
    checkRole([ROLES.ADMIN]),
    dashboardController.getAdminDashboard
);

router.get(
    '/reports/attendance',
    verifyToken,
    checkRole([ROLES.ADMIN]),
    validateQuery(dashboardValidator.attendanceReportSchema),
    dashboardController.getAttendanceReport
);

router.get(
    '/reports/salary',
    verifyToken,
    checkRole([ROLES.ADMIN]),
    validateQuery(dashboardValidator.salaryReportSchema),
    dashboardController.getSalaryReport
);

export default router;
