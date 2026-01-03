import express from 'express';
import * as attendanceController from '../controllers/attendanceController.js';
import * as attendanceValidator from '../validators/attendanceValidator.js';
import { validateRequest, validateQuery } from '../middleware/validation.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get(
    '/',
    verifyToken,
    attendanceController.getAllAttendance
);

router.post(
    '/:employeeId/check-in',
    verifyToken,
    attendanceController.checkIn
);

router.post(
    '/:employeeId/check-out',
    verifyToken,
    attendanceController.checkOut
);

router.get(
    '/:employeeId',
    verifyToken,
    validateQuery(attendanceValidator.getAttendanceSchema),
    attendanceController.getAttendance
);

router.post(
    '/:employeeId/mark',
    verifyToken,
    validateRequest(attendanceValidator.markAttendanceSchema),
    attendanceController.markAttendance
);

export default router;
