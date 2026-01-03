import Joi from 'joi';
import { PASSWORD_REGEX } from '../config/constants.js';

export const registerSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format',
    }),
    password: Joi.string()
        .pattern(PASSWORD_REGEX)
        .required()
        .messages({
            'string.pattern.base': 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
        }),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    role: Joi.string().valid('Employee', 'Admin').optional(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
        .pattern(PASSWORD_REGEX)
        .required()
        .messages({
            'string.pattern.base': 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
        }),
});

export const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format',
    }),
});

export const resetPasswordSchema = Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string()
        .pattern(PASSWORD_REGEX)
        .required()
        .messages({
            'string.pattern.base': 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
        }),
});
