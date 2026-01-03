import { ENV } from '../config/environment.js';

export const corsConfig = {
    origin: [
        ENV.FRONTEND_URL,
        '*',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173', // Vite dev server
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
};
