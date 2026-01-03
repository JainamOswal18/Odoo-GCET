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

export const sendWelcomeEmailWithCredentials = async (email, firstName, loginId, password) => {
    try {
        const mailOptions = {
            from: ENV.EMAIL_USER,
            to: email,
            subject: 'Welcome to Dayflow HRMS - Your Account Credentials',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D946EF;">Welcome to Dayflow HRMS, ${firstName}!</h2>
          <p>Your employee account has been created by your HR administrator.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Login Credentials:</h3>
            <p style="margin: 10px 0;"><strong>Login ID:</strong> <code style="background: white; padding: 4px 8px; border-radius: 4px;">${loginId}</code></p>
            <p style="margin: 10px 0;"><strong>Password:</strong> <code style="background: white; padding: 4px 8px; border-radius: 4px;">${password}</code></p>
          </div>
          
          <div style="background: #FEF3C7; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #92400E;">⚠️ <strong>Important:</strong> Please change your password after your first login for security reasons.</p>
          </div>
          
          <p>You can login at: <a href="${ENV.FRONTEND_URL}/signin" style="color: #D946EF;">${ENV.FRONTEND_URL}/signin</a></p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
            <p>If you did not expect this email, please contact your HR department immediately.</p>
          </div>
        </div>
      `,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email send error:', error);
        return false;
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
