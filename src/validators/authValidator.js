const Joi = require('joi');

const loginSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false }, minDomainSegments: 1 }).required().messages({
        'string.email': 'El correo electrónico no es válido',
        'any.required': 'El correo electrónico es requerido'
    }),
    password: Joi.string().required().messages({
        'any.required': 'La contraseña es requerida'
    })
});

const registerSchema = Joi.object({
    fullname: Joi.string().min(3).max(100).required().messages({
        'string.min': 'El nombre completo debe tener al menos 3 caracteres',
        'any.required': 'El nombre completo es requerido'
    }),
    company_name: Joi.string().min(2).max(100).required().messages({
        'string.min': 'El nombre de la empresa debe tener al menos 2 caracteres',
        'any.required': 'El nombre de la empresa es requerido'
    }),
    email: Joi.string().email({ tlds: { allow: false }, minDomainSegments: 1 }).required().messages({
        'string.email': 'El correo electrónico no es válido',
        'any.required': 'El correo electrónico es requerido'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'La contraseña debe tener al menos 6 caracteres',
        'any.required': 'La contraseña es requerida'
    }),
    nit_id: Joi.string().allow('', null),
    type_id: Joi.string().required().messages({
        'any.required': 'El tipo de identificación es requerido'
    }),
    number_id: Joi.string().required().messages({
        'any.required': 'El número de identificación es requerido'
    }),
    plan_id: Joi.number().optional(),
    billing_cycle: Joi.string().valid('MONTHLY', 'YEARLY').optional(),
    primary_color: Joi.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    secondary_color: Joi.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    font_family: Joi.string().optional(),
    border_radius: Joi.string().optional(),
    sidebar_theme: Joi.string().valid('light', 'dark').optional()
});

module.exports = {
    loginSchema,
    registerSchema
};
