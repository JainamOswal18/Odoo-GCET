import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { initializeDatabase } from './config/database.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { corsConfig } from './middleware/corsConfig.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { ENV } from './config/environment.js';

const app = express();

// Middleware
app.use(cors(corsConfig));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate Limiting
app.use('/api/auth', rateLimiter.loginLimiter);
app.use('/api/', rateLimiter.generalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Error Handler (Must be last)
app.use(errorHandler);

// Initialize Database and Start Server
const startServer = async () => {
    try {
        await initializeDatabase();
        console.log('✓ Database initialized successfully');

        app.listen(ENV.PORT, () => {
            console.log(`✓ Server running on http://localhost:${ENV.PORT}`);
            console.log(`✓ Environment: ${ENV.NODE_ENV}`);
        });
    } catch (error) {
        console.error('✗ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
