import nodemailer from 'nodemailer';
import { ENV } from '../config/environment.js';

const transporter = nodemailer.createTransport({
    service: ENV.EMAIL_SERVICE,
    auth: {
        user: ENV.EMAIL_USER,
        pass: ENV.EMAIL_PASSWORD,
    },
});

export const sendVerificationEmail = async (email, firstName) => {
    try {
        const mailOptions = {
            from: ENV.EMAIL_USER,
            to: email,
            subject: 'Dayflow - Email Verification',
            html: `
        <h2>Welcome to Dayflow HRMS, ${firstName}!</h2>
        <p>Thank you for registering. Please verify your email to complete the registration process.</p>
        <p><a href="${ENV.FRONTEND_URL}/verify-email">Verify Your Email</a></p>
        <p>If you did not create this account, please ignore this email.</p>
      `,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Email send error:', error);
    }
};

export const sendLeaveApprovalEmail = async (email, firstName, status) => {
    try {
        const mailOptions = {
            from: ENV.EMAIL_USER,
            to: email,
            subject: `Your Leave Request has been ${status}`,
            html: `
        <h2>Leave Request ${status}</h2>
        <p>Dear ${firstName},</p>
        <p>Your leave request has been <strong>${status}</strong>.</p>
        <p>Please log in to Dayflow to view more details.</p>
      `,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Email send error:', error);
    }
};
