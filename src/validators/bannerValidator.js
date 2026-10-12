const Joi = require('joi');

const bannerSchema = Joi.object({
    title: Joi.string().min(3).max(100).required().messages({
        'string.min': 'El título debe tener al menos 3 caracteres',
        'any.required': 'El título es requerido'
    }),
    subtitle: Joi.string().allow('', null),
    link_url: Joi.string().uri().allow('', null).messages({
        'string.uri': 'La URL del enlace no es válida'
    }),
    order: Joi.number().integer().min(0).optional()
});

module.exports = {
    bannerSchema
};
