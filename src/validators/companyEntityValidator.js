const Joi = require('joi');

const userSchema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    type_id: Joi.string().required(),
    number_id: Joi.string().required(),
    company_email: Joi.string().email().required(),
    staff_mail: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(), // Opcional en update
    company_rol_id: Joi.number().required(),
    company_area_id: Joi.number().optional(),
    company_headquarter_id: Joi.number().optional(),
    system_role: Joi.string().valid('admin', 'user').default('user'),
    status: Joi.boolean().default(true)
});

const roleSchema = Joi.object({
    rol_name: Joi.string().required(),
    description: Joi.string().allow('', null),
    company_headquarter_id: Joi.number().optional()
});

const areaSchema = Joi.object({
    area_name: Joi.string().required(),
    description: Joi.string().allow('', null),
    company_headquarter_id: Joi.number().optional()
});

const headquarterSchema = Joi.object({
    name: Joi.string().required(),
    address: Joi.string().allow('', null),
    city: Joi.string().allow('', null),
    phone: Joi.string().allow('', null),
    is_main: Joi.boolean().default(false),
    status: Joi.boolean().default(true)
});

module.exports = {
    userSchema,
    roleSchema,
    areaSchema,
    headquarterSchema
};
