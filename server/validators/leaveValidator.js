import Joi from 'joi';
import { LEAVE_TYPES } from '../config/constants.js';

export const applyLeaveSchema = Joi.object({
    leaveType: Joi.string()
        .valid(...Object.values(LEAVE_TYPES))
        .required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    remarks: Joi.string().optional(),
});

export const getLeaveRequestsSchema = Joi.object({
    status: Joi.string().optional(),
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(100).optional(),
});

export const getLeaveBalanceSchema = Joi.object({
    year: Joi.number().min(2000).optional(),
});

export const approveLeaveSchema = Joi.object({
    approvalComments: Joi.string().optional(),
});
