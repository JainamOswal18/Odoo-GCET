import Joi from 'joi';
import { ATTENDANCE_STATUS } from '../config/constants.js';

export const getAttendanceSchema = Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(100).optional(),
});

export const markAttendanceSchema = Joi.object({
    date: Joi.date().required(),
    status: Joi.string()
        .valid(...Object.values(ATTENDANCE_STATUS))
        .required(),
    remarks: Joi.string().optional(),
});
