const Joi = require('joi');

const systemUserSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).optional(),
    system_role: Joi.string().valid('admin', 'support').default('admin'),
    status: Joi.boolean().default(true)
});

const systemParameterSchema = Joi.object({
    param_key: Joi.string().required(),
    param_value: Joi.string().required(),
    description: Joi.string().allow('', null)
});

module.exports = {
    systemUserSchema,
    systemParameterSchema
};
