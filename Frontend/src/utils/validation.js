import Joi from 'joi';

/**
 * Validates data against a Joi schema.
 * @param {Object} data - The data to validate.
 * @param {Object} schema - The Joi schema to validate against.
 * @returns {Object|null} - Returns an object of errors { field: message } or null if valid.
 */
export const validate = (data, schema) => {
    const { error } = schema.validate(data, { abortEarly: false });
    if (!error) return null;

    const errors = {};
    error.details.forEach(detail => {
        errors[detail.path[0]] = detail.message;
    });
    return errors;
};

// Common Schemas
export const authSchemas = {
    login: Joi.object({
        email: Joi.string().email({ tlds: { allow: false } }).required().messages({
            'string.email': 'Please enter a valid email address',
            'any.required': 'Email is required'
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Password must be at least 6 characters',
            'any.required': 'Password is required'
        })
    }),
    signup: Joi.object({
        username: Joi.string().min(3).max(30).required().label('Full Name'),
        email: Joi.string().email({ tlds: { allow: false } }).required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid('faculty', 'supporting_staff').required()
    }),
    joinInvitation: Joi.object({
        username: Joi.string().min(3).max(30).required().label('Full Name'),
        password: Joi.string().min(6).required()
    }),
    changePassword: Joi.object({
        currentPassword: Joi.string().required().label('Current Password'),
        newPassword: Joi.string().min(6).required().label('New Password')
    })
};

export const timetableSchema = Joi.object({
    id: Joi.any().optional(), // Allow id for edits
    course_code: Joi.string().required().label('Course Code'),
    subject_name: Joi.string().required().label('Subject Name'),
    faculty_name: Joi.string().required().label('Faculty Name'),
    venue: Joi.string().required().label('Venue'),
    semester: Joi.string().required(),
    section: Joi.string().required(),
    day: Joi.string().required(),
    period_number: Joi.number().required(),
    end_period: Joi.number().min(Joi.ref('period_number')).required(),
    type: Joi.string().valid('Theory', 'Lab').required(),
    batch: Joi.string().valid('Odd', 'Even', 'Both').default('Both').required(),
    lab_name: Joi.string().allow('', null).optional(),
    start_time: Joi.string().allow('', null).optional(),
    end_time: Joi.string().allow('', null).optional(),
    createdAt: Joi.any().optional(),
    updatedAt: Joi.any().optional(),
    repeatDays: Joi.array().items(Joi.string()).optional()
});

export const facultySchema = Joi.object({
    name: Joi.string().required(),
    qualification: Joi.string().required(),
    designation: Joi.string().required(),
    teachingExp: Joi.string().required(),
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    mobileNo: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
        'string.pattern.base': 'Please enter a valid 10-digit mobile number'
    })
});

export const staffSchema = Joi.object({
    name: Joi.string().required(),
    qualification: Joi.string().required(),
    designation: Joi.string().required(),
    experience: Joi.string().required(),
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    mobileNo: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
        'string.pattern.base': 'Please enter a valid 10-digit mobile number'
    })
});
