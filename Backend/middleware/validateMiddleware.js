const Joi = require('joi');

const validateRequest = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        return res.status(400).json({ message: 'Validation failed', errors: errorMessages });
    }
    next();
};

module.exports = validateRequest;
