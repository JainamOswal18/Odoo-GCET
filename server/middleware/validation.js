import Joi from 'joi';

export const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body);

        if (error) {
            return res.status(400).json({
                error: 'Validation Error',
                details: error.details.map((d) => ({
                    field: d.path.join('.'),
                    message: d.message,
                })),
            });
        }

        req.validatedData = value;
        next();
    };
};

export const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query);

        if (error) {
            return res.status(400).json({
                error: 'Validation Error',
                details: error.details.map((d) => ({
                    field: d.path.join('.'),
                    message: d.message,
                })),
            });
        }

        req.validatedQuery = value;
        next();
    };
};
