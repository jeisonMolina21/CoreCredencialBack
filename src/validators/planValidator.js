const Joi = require('joi');

const planSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    description: Joi.string().allow('', null),
    price: Joi.number().min(0).required(),
    max_users: Joi.number().integer().min(-1).required(), // -1 para ilimitado
    max_templates_carnets: Joi.number().integer().min(-1).optional(),
    max_carnets: Joi.number().integer().min(-1).required(),
    max_events_month: Joi.number().integer().min(-1).optional(),
    max_headquarters: Joi.number().integer().min(-1).optional(),
    max_areas: Joi.number().integer().min(-1).optional(),
    max_roles: Joi.number().integer().min(-1).optional(),
    is_active: Joi.boolean().default(true),
    is_default: Joi.boolean().default(false)
});

module.exports = {
    planSchema
};
