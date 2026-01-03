import express from 'express';
import * as leaveController from '../controllers/leaveController.js';
import * as leaveValidator from '../validators/leaveValidator.js';
import { validateRequest, validateQuery } from '../middleware/validation.js';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.post(
    '/:employeeId/apply',
    verifyToken,
    validateRequest(leaveValidator.applyLeaveSchema),
    leaveController.applyLeave
);

router.get(
    '/:employeeId',
    verifyToken,
    validateQuery(leaveValidator.getLeaveRequestsSchema),
    leaveController.getLeaveRequests
);

router.get(
    '/:employeeId/balance',
    verifyToken,
    validateQuery(leaveValidator.getLeaveBalanceSchema),
    leaveController.getLeaveBalance
);

router.post(
    '/approve/:leaveRequestId',
    verifyToken,
    checkRole([ROLES.ADMIN]),
    validateRequest(leaveValidator.approveLeaveSchema),
    leaveController.approveLeave
);

router.post(
    '/reject/:leaveRequestId',
    verifyToken,
    checkRole([ROLES.ADMIN]),
    validateRequest(leaveValidator.approveLeaveSchema),
    leaveController.rejectLeave
);

export default router;
