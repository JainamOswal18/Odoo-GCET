import { ENV } from '../config/environment.js';

export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            details: err.details,
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File size exceeds limit' });
    }

    // Don't expose internal error details in production
    const isDevelopment = ENV.NODE_ENV === 'development';

    return res.status(err.status || 500).json({
        error: isDevelopment ? (err.message || 'Internal Server Error') : 'Internal Server Error',
        ...(isDevelopment && { stack: err.stack })
    });
};
