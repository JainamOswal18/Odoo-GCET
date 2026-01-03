import express from 'express';
import * as employeeController from '../controllers/employeeController.js';
import * as employeeValidator from '../validators/employeeValidator.js';
import { validateRequest, validateQuery } from '../middleware/validation.js';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.get(
    '/',
    verifyToken,
    checkRole([ROLES.ADMIN]),
    validateQuery(employeeValidator.getAllEmployeesSchema),
    employeeController.getAllEmployees
);

router.get('/:employeeId', verifyToken, employeeController.getEmployeeProfile);

router.put(
    '/:employeeId',
    verifyToken,
    validateRequest(employeeValidator.updateEmployeeSchema),
    employeeController.updateEmployeeProfile
);

router.post(
    '/:employeeId/upload-profile-picture',
    verifyToken,
    employeeController.upload.single('profilePicture'),
    employeeController.uploadProfilePicture
);

router.delete(
    '/:employeeId',
    verifyToken,
    checkRole([ROLES.ADMIN]),
    employeeController.deleteEmployee
);

export default router;
