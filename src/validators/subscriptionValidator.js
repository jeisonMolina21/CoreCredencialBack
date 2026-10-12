const Joi = require('joi');

const createSubscriptionSchema = Joi.object({
    company_id: Joi.number().required(),
    plan_id: Joi.number().required(),
    billing_cycle: Joi.string().valid('MONTHLY', 'YEARLY').default('MONTHLY'),
    start_date: Joi.date().optional(),
    next_payment_date: Joi.date().optional(),
    auto_renew: Joi.boolean().default(true),
    status: Joi.string().valid('ACTIVE', 'CANCELLED', 'PAST_DUE', 'EXPIRED').default('ACTIVE')
});

const updateSubscriptionSchema = Joi.object({
    plan_id: Joi.number().optional(),
    billing_cycle: Joi.string().valid('MONTHLY', 'YEARLY').optional(),
    auto_renew: Joi.boolean().optional(),
    status: Joi.string().valid('ACTIVE', 'CANCELLED', 'PAST_DUE', 'EXPIRED').optional(),
    next_payment_date: Joi.date().optional()
});

const updateMySubscriptionSchema = Joi.object({
    auto_renew: Joi.boolean().optional(),
    plan_id: Joi.number().optional(),
    billing_cycle: Joi.string().valid('MONTHLY', 'YEARLY').optional()
});

module.exports = {
    createSubscriptionSchema,
    updateSubscriptionSchema,
    updateMySubscriptionSchema
};
