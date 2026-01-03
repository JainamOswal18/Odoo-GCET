import jwt from 'jsonwebtoken';
import { ENV } from '../config/environment.js';
import { ERROR_MESSAGES } from '../config/constants.js';
import { getDb } from '../config/database.js';

export const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: ERROR_MESSAGES.UNAUTHORIZED });
        }

        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: ERROR_MESSAGES.UNAUTHORIZED });
    }
};

export const checkRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
    }
    next();
};

export const verifyEmailAndPassword = async (req, res, next) => {
    try {
        const db = getDb();
        const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);

        if (!user) {
            return res.status(404).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
        }

        if (!user.isEmailVerified && req.path !== '/api/auth/verify-email') {
            return res.status(403).json({ error: ERROR_MESSAGES.EMAIL_NOT_VERIFIED });
        }

        req.userRecord = user;
        next();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
