const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const planRoutes = require('./planRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');
const systemUserRoutes = require('./systemUserRoutes');
const systemRolRoutes = require('./systemRolRoutes');
const paymentRoutes = require('./paymentRoutes');
const paymentMethodRoutes = require('./paymentMethodRoutes');
const companyRoutes = require('./companyRoutes');
const systemParameterRoutes = require('./systemParameterRoutes');
const systemLogRoutes = require('./systemLogRoutes');
const companyAreaRoutes = require('./companyAreaRoutes');
const companyRolRoutes = require('./companyRolRoutes');
const companyUserRoutes = require('./companyUserRoutes');
const companyCarnetRoutes = require('./companyCarnetRoutes');
const companyTemplateCarnetRoutes = require('./companyTemplateCarnetRoutes');
const companyHeadquarterRoutes = require('./companyHeadquarterRoutes');
const bannerRoutes = require('./bannerRoutes');

// Agregador de rutas
router.use('/auth', authRoutes);
router.use('/plans', planRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/system-users', systemUserRoutes);
router.use('/system-rols', systemRolRoutes);
router.use('/payments', paymentRoutes);
router.use('/payment-methods', paymentMethodRoutes);
router.use('/companies', companyRoutes);
router.use('/system-parameters', systemParameterRoutes);
router.use('/system-logs', systemLogRoutes);
router.use('/banners', bannerRoutes);

// Rutas de Compañía (Tenant)
router.use('/company-areas', companyAreaRoutes);
router.use('/company-rols', companyRolRoutes);
router.use('/company-users', companyUserRoutes);
router.use('/company-carnets', companyCarnetRoutes);
router.use('/company-templates', companyTemplateCarnetRoutes);
router.use('/company-headquarters', companyHeadquarterRoutes);

module.exports = router;
