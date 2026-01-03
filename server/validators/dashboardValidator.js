import Joi from 'joi';

export const attendanceReportSchema = Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    department: Joi.string().optional(),
});

export const salaryReportSchema = Joi.object({
    month: Joi.string().optional(),
    year: Joi.number().optional(),
    department: Joi.string().optional(),
});
