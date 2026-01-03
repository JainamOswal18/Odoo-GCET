import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 5000,
    DB_PATH: process.env.DB_PATH || './data/hrms.db',
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'gmail',
    EMAIL_USER: process.env.EMAIL_USER || 'your-email@gmail.com',
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || 'your-app-password',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    FILE_UPLOAD_LIMIT: 5 * 1024 * 1024, // 5MB
    ALLOWED_UPLOAD_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
};
