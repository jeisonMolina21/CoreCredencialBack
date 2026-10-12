const Joi = require('joi');

const createCompanySchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    nit_id: Joi.string().allow('', null),
    subdomain: Joi.string().max(20).optional(),
    is_active: Joi.boolean().optional()
});

const updateCompanySchema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    nit_id: Joi.string().allow('', null),
    subdomain: Joi.string().max(20).optional(),
    is_active: Joi.boolean().optional()
});

const updateBrandingSchema = Joi.object({
    primary_color: Joi.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    secondary_color: Joi.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    font_family: Joi.string().optional(),
    border_radius: Joi.string().optional(),
    sidebar_theme: Joi.string().valid('light', 'dark').optional(),
    login: Joi.boolean().optional(),
    maintenance: Joi.boolean().optional()
});

module.exports = {
    createCompanySchema,
    updateCompanySchema,
    updateBrandingSchema
};
