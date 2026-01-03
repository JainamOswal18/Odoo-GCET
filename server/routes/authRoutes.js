import express from 'express';
import * as authController from '../controllers/authController.js';
import * as authValidator from '../validators/authValidator.js';
import { validateRequest } from '../middleware/validation.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', validateRequest(authValidator.registerSchema), authController.register);
router.post('/login', validateRequest(authValidator.loginSchema), authController.login);
router.post('/verify-email', verifyToken, authController.verifyEmail);
router.post('/change-password', verifyToken, validateRequest(authValidator.changePasswordSchema), authController.changePassword);
router.post('/forgot-password', validateRequest(authValidator.forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validateRequest(authValidator.resetPasswordSchema), authController.resetPassword);
router.post('/logout', verifyToken, authController.logout);

export default router;
