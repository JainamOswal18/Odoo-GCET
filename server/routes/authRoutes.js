import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as authController from '../controllers/authController.js';
import * as authValidator from '../validators/authValidator.js';
import { validateRequest } from '../middleware/validation.js';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';
import { ROLES } from '../config/constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../uploads/profiles');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for avatar upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const ext = path.extname(sanitized);
        const name = path.basename(sanitized, ext);
        cb(null, `${Date.now()}-${name}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG and PNG images are allowed'));
        }
    },
});

const router = express.Router();

// Custom middleware to validate after multer processes the file
const validateAfterUpload = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            error: 'Validation Error',
            details: error.details.map((d) => ({
                field: d.path.join('.'),
                message: d.message,
            })),
        });
    }
    req.validatedData = value;
    next();
};

router.post('/register', verifyToken, checkRole([ROLES.ADMIN]), upload.single('avatar'), validateAfterUpload(authValidator.registerSchema), authController.register);
router.post('/login', validateRequest(authValidator.loginSchema), authController.login);
router.post('/verify-email', verifyToken, authController.verifyEmail);
router.post('/change-password', verifyToken, validateRequest(authValidator.changePasswordSchema), authController.changePassword);
router.post('/forgot-password', validateRequest(authValidator.forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validateRequest(authValidator.resetPasswordSchema), authController.resetPassword);
router.post('/logout', verifyToken, authController.logout);

export default router;
