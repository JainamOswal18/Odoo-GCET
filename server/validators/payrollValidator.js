import Joi from 'joi';

export const getPayrollSchema = Joi.object({
    month: Joi.string().optional(),
    year: Joi.number().optional(),
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(100).optional(),
});

export const createPayrollSchema = Joi.object({
    baseSalary: Joi.number().positive().required(),
    allowances: Joi.number().min(0).optional(),
    deductions: Joi.number().min(0).optional(),
    bonus: Joi.number().min(0).optional(),
    month: Joi.string().required(),
    year: Joi.number().required(),
    remarks: Joi.string().optional(),
});

export const updatePayrollSchema = Joi.object({
    baseSalary: Joi.number().positive().optional(),
    allowances: Joi.number().min(0).optional(),
    deductions: Joi.number().min(0).optional(),
    bonus: Joi.number().min(0).optional(),
    remarks: Joi.string().optional(),
});
