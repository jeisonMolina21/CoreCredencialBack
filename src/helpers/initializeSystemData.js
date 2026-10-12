const logger = require('../utils/logger');
const SystemUser = require('../models/systemUser');
const Plan = require('../models/plans');

const initializeSystemData = async () => {
    try {
        // 1. Inicializar Usuario Administrador
        const admin = await SystemUser.findByPk(1);
        
        if (!admin) {
            logger.info('ℹ️ Initializing default Admin user...');
            await SystemUser.create({
                id: 1,
                name: 'Admin',
                email: process.env.ADMIN_DEFAULT_EMAIL,
                password: process.env.ADMIN_DEFAULT_PASSWORD,
                system_role: 'admin',
                status: true
            });
            logger.info('✅ Default Admin user created.');
        } else {
            logger.debug('✅ Admin user already exists (ID: 1).');
        }

        // 2. Inicializar / Sincronizar Plan Gratuito (ID: 1)
        const freePlanData = {
            id: 1,
            name: process.env.FREE_PLAN_NAME || 'Plan Gratuito',
            description: process.env.FREE_PLAN_DESCRIPTION || 'Acceso básico inicial',
            price: parseFloat(process.env.FREE_PLAN_PRICE || 0.00),
            max_users: parseInt(process.env.FREE_PLAN_MAX_USERS || 10),
            max_templates_carnets: parseInt(process.env.FREE_PLAN_MAX_TEMPLATES || 2),
            max_carnets: parseInt(process.env.FREE_PLAN_MAX_CARNETS || 100),
            max_events_month: parseInt(process.env.FREE_PLAN_MAX_EVENTS || 5),
            max_headquarters: parseInt(process.env.FREE_PLAN_MAX_HEADQUARTERS || 1),
            max_areas: parseInt(process.env.FREE_PLAN_MAX_AREAS || 5),
            max_roles: parseInt(process.env.FREE_PLAN_MAX_ROLES || 10),
            is_active: true,
            is_default: true
        };

        const existingPlan = await Plan.findByPk(1);

        if (!existingPlan) {
            logger.info('ℹ️ Initializing default Free Plan (ID 1)...');
            await Plan.create(freePlanData);
            logger.info('✅ Default Free Plan created.');
        } else {
            // Verificar si hay diferencias entre DB y .env
            const fieldsToCompare = [
                'name', 'description', 'price', 'max_users', 
                'max_templates_carnets', 'max_carnets', 'max_events_month',
                'max_headquarters', 'max_areas', 'max_roles'
            ];
            let needsUpdate = false;

            for (const field of fieldsToCompare) {
                // Comparamos valores (convertimos a String para simplificar comparaciones de números/decimales)
                if (String(existingPlan[field]) !== String(freePlanData[field])) {
                    needsUpdate = true;
                    break;
                }
            }

            if (needsUpdate) {
                logger.info('ℹ️ Syncing Free Plan (ID 1) with .env configuration...');
                await existingPlan.update(freePlanData);
                logger.info('✅ Free Plan synchronized with .env.');
            } else {
                logger.debug('✅ Free Plan is already synced with .env.');
            }
        }

    } catch (error) {
        logger.error('❌ Error initializing System Data:', error);
    }
};

module.exports = initializeSystemData;
