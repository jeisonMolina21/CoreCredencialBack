const Joi = require('joi');

const carnetSchema = Joi.object({
    template_id: Joi.number().required(),
    user_id: Joi.number().optional(), // Si se vincula a un CompanyUser
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    identification: Joi.string().required(),
    valid_until: Joi.date().optional(),
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'EXPIRED').default('ACTIVE'),
    metadata: Joi.object().optional()
});

const templateSchema = Joi.object({
    name: Joi.string().required(),
    layout_config: Joi.object().required(),
    is_active: Joi.boolean().default(true)
});

module.exports = {
    carnetSchema,
    templateSchema
};
