const Joi = require('joi');

const authSchemas = {
    register: Joi.object({
        username: Joi.string().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid('admin', 'faculty', 'supporting_staff', 'student').default('student'),
        department: Joi.string().allow('', null)
    }),
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),
    joinInvitation: Joi.object({
        token: Joi.string().required(),
        username: Joi.string().min(3).max(30).required(),
        password: Joi.string().min(6).required()
    }),
    forgotPassword: Joi.object({
        email: Joi.string().email().required()
    }),
    resetPassword: Joi.object({
        password: Joi.string().min(6).required()
    }),
    changePassword: Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().min(6).required()
    })
};

const timetableSchemas = Joi.object({
    semester: Joi.string().valid('I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII').required(),
    section: Joi.string().valid('A', 'B').required(),
    day: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday').required(),
    period_number: Joi.number().integer().min(1).max(8).required(),
    end_period: Joi.number().integer().min(Joi.ref('period_number')).max(8).allow(null),
    course_code: Joi.string().required(),
    subject_name: Joi.string().required(),
    faculty_name: Joi.string().required(),
    venue: Joi.string().required(),
    type: Joi.string().valid('Theory', 'Lab').required(),
    batch: Joi.string().valid('Odd', 'Even', 'Both').default('Both'),
    lab_name: Joi.string().allow('', null), // Used in frontend modal but maps to venue or is auxiliary
    start_time: Joi.string().allow('', null), // Backend can set this based on periods
    end_time: Joi.string().allow('', null),
    id: Joi.any().optional(),
    createdAt: Joi.any().optional(),
    updatedAt: Joi.any().optional()
});

const facultySchemas = Joi.object({
    name: Joi.string().required(),
    qualification: Joi.string().required(),
    designation: Joi.string().required(),
    teachingExp: Joi.string().required(),
    email: Joi.string().email().required(),
    mobileNo: Joi.string().required()
});

const staffSchemas = Joi.object({
    name: Joi.string().required(),
    qualification: Joi.string().required(),
    designation: Joi.string().required(),
    experience: Joi.string().required(),
    email: Joi.string().email().required(),
    mobileNo: Joi.string().required()
});

module.exports = {
    authSchemas,
    timetableSchemas,
    facultySchemas,
    staffSchemas
};
