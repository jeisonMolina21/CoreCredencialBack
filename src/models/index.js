/**
 * ============================================================================
 * MAPA CENTRAL DE MODELOS Y ASOCIACIONES (DATA ARCHITECTURE)
 * ============================================================================
 * Este archivo centraliza la inicialización de todos los modelos Sequelize,
 * define las relaciones de integridad referencial (1:N, 1:1, N:M) y conecta
 * automáticamente el sistema de auditoría transversal (Audit Log Hooks).
 * 
 * Separación Conceptual de Modelos:
 * 1. Modelos Globales / Core:
 *    - Company (Entidad inquilina principal)
 *    - Plan (Planes SaaS con cuotas de recursos)
 *    - Subscription (Historial y estado de facturación por empresa)
 *    - Payment / PaymentMethod (Transacciones y pasarela)
 *    - InstallationMode (Configuración On-Premise vs Cloud)
 * 
 * 2. Modelos de Sistema (SuperAdmin):
 *    - SystemUser (Usuarios con acceso al panel de administración global)
 *    - SystemRol (Roles y permisos de plataforma)
 *    - SystemParameter (Configuraciones dinámicas de sistema)
 *    - SystemLog (Trazabilidad y auditoría global)
 * 
 * 3. Modelos Tenant (Aislados por company_id):
 *    - CompanyUser (Colaboradores y empleados de cada empresa)
 *    - CompanyCarnet (Credenciales digitales generadas con token y vigencia)
 *    - CompanyTemplateCarnet (Plantillas gráficas y formatos HTML de carnets)
 *    - CompanyHeadquarter (Sedes operativas de la empresa)
 *    - CompanyArea (Departamentos o áreas de trabajo)
 *    - CompanyRol (Cargos laborales de la empresa)
 *    - CompanyEvent (Eventos o actividades vinculadas a credenciales)
 *    - CompanyLog (Auditoría de acciones dentro de la empresa)
 */

const { sequelize } = require('../config/database');

// --- 1. IMPORTACIÓN DE MODELOS CORE / GLOBALES ---
const Company = require('./core/company');
const CompanyLog = require('./core/companyLog');
const CompanyParameter = require('./core/companyParameter');
const Plan = require('./plans');
const Subscription = require('./subscription');
const InstallationMode = require('./installationMode');
const PaymentMethod = require('./paymentMethod');
const Payment = require('./payment');

// --- 2. IMPORTACIÓN DE MODELOS DE SISTEMA (SUPERADMIN) ---
const SystemUser = require('./systemUser');
const SystemRol = require('./systemRol');
const SystemParameter = require('./systemParameter');
const SystemLog = require('./systemLog');

// --- 3. IMPORTACIÓN DE MODELOS TENANT (AISLADOS POR EMPRESA) ---
const CompanyUser = require('./tenant/companyUser');
const CompanyArea = require('./tenant/companyArea');
const CompanyRol = require('./tenant/companyRol');
const CompanyCarnet = require('./tenant/companyCarnet');
const CompanyTemplateCarnet = require('./tenant/companyTemplateCarnet');
const CompanyEvent = require('./tenant/companyEvent');
const CompanyHeadquarter = require('./tenant/companyHeadquarter');

// ============================================================================
// RELACIONES E INTEGRIDAD REFERENCIAL
// ============================================================================

// Relaciones de COMPANY (Inquilino / Tenant)
Company.hasMany(CompanyUser, { foreignKey: 'company_id', as: 'users' });
Company.hasMany(CompanyLog, { foreignKey: 'company_id', as: 'logs' });
Company.hasOne(CompanyParameter, { foreignKey: 'company_id', as: 'parameters' });
Company.hasMany(CompanyArea, { foreignKey: 'company_id', as: 'areas' });
Company.hasMany(CompanyRol, { foreignKey: 'company_id', as: 'roles' });
Company.hasMany(CompanyCarnet, { foreignKey: 'company_id', as: 'carnets' });
Company.hasMany(CompanyTemplateCarnet, { foreignKey: 'company_id', as: 'templates' });
Company.hasMany(CompanyHeadquarter, { foreignKey: 'company_id', as: 'headquarters' });
Company.hasOne(Subscription, { foreignKey: 'company_id', as: 'fullSubscription' });
Company.belongsTo(Plan, { foreignKey: 'plan_id', as: 'plan' });
Company.belongsTo(Subscription, { foreignKey: 'active_subscription_id', as: 'activeSubscription' });
Company.hasOne(InstallationMode, { foreignKey: 'company_id', as: 'installation' });

// Relaciones de COMPANYUSER (Colaborador / Empleado)
CompanyUser.belongsTo(Company, { foreignKey: 'company_id' });
CompanyUser.belongsTo(CompanyArea, { foreignKey: 'company_area_id' });
CompanyUser.belongsTo(CompanyCarnet, { foreignKey: 'company_carnet_id', constraints: false });
CompanyUser.belongsTo(CompanyRol, { foreignKey: 'company_rol_id' });
CompanyUser.belongsTo(CompanyHeadquarter, { foreignKey: 'company_headquarter_id', as: 'headquarter' });

// Relaciones de SEDES (CompanyHeadquarter)
CompanyHeadquarter.belongsTo(Company, { foreignKey: 'company_id' });
CompanyHeadquarter.hasMany(CompanyUser, { foreignKey: 'company_headquarter_id', as: 'users' });
CompanyHeadquarter.hasMany(CompanyArea, { foreignKey: 'company_headquarter_id', as: 'areas' });
CompanyHeadquarter.hasMany(CompanyRol, { foreignKey: 'company_headquarter_id', as: 'roles' });

// Relaciones de ÁREAS Y CARGOS
CompanyArea.belongsTo(Company, { foreignKey: 'company_id' });
CompanyArea.belongsTo(CompanyHeadquarter, { foreignKey: 'company_headquarter_id', as: 'headquarter' });
CompanyRol.belongsTo(Company, { foreignKey: 'company_id' });
CompanyRol.belongsTo(CompanyHeadquarter, { foreignKey: 'company_headquarter_id', as: 'headquarter' });

// Relaciones de CARNETS Y PLANTILLAS
CompanyCarnet.belongsTo(Company, { foreignKey: 'company_id' });
CompanyCarnet.belongsTo(CompanyTemplateCarnet, { foreignKey: 'template_id', as: 'template' });
CompanyTemplateCarnet.belongsTo(Company, { foreignKey: 'company_id' });
CompanyTemplateCarnet.hasMany(CompanyCarnet, { foreignKey: 'template_id' });

// Relaciones de FACTURACIÓN Y SUSCRIPCIONES
Subscription.belongsTo(Company, { foreignKey: 'company_id' });
Subscription.belongsTo(Plan, { foreignKey: 'plan_id', as: 'plan' });
Plan.hasMany(Subscription, { foreignKey: 'plan_id' });
Plan.hasMany(Company, { foreignKey: 'plan_id', as: 'companies' });

// Relaciones de PAGOS Y MÉTODOS DE PAGO
Company.hasMany(PaymentMethod, { foreignKey: 'company_id', as: 'paymentMethods' });
PaymentMethod.belongsTo(Company, { foreignKey: 'company_id' });
Subscription.hasMany(Payment, { foreignKey: 'subscription_id', as: 'payments' });
Payment.belongsTo(Subscription, { foreignKey: 'subscription_id' });
Payment.belongsTo(Company, { foreignKey: 'company_id' });
Payment.belongsTo(PaymentMethod, { foreignKey: 'payment_method_id' });
Subscription.belongsTo(PaymentMethod, { foreignKey: 'payment_method_id', as: 'defaultPaymentMethod' });

// Relaciones de LOGS Y USUARIOS DE SISTEMA
SystemLog.belongsTo(SystemUser, { foreignKey: 'user_id', as: 'user' });
SystemUser.belongsTo(SystemRol, { foreignKey: 'system_rol_id', as: 'rol' });
SystemRol.hasMany(SystemUser, { foreignKey: 'system_rol_id', as: 'users' });
CompanyLog.belongsTo(Company, { foreignKey: 'company_id' });
InstallationMode.belongsTo(Company, { foreignKey: 'company_id' });

// Diccionario de modelos cargados
const models = {
    Company,
    CompanyLog,
    CompanyParameter,
    Plan,
    Subscription,
    InstallationMode,
    SystemUser,
    SystemRol,
    SystemParameter,
    SystemLog,
    CompanyUser,
    CompanyArea,
    CompanyRol,
    CompanyCarnet,
    CompanyTemplateCarnet,
    CompanyEvent,
    CompanyHeadquarter,
    PaymentMethod,
    Payment
};

// ============================================================================
// CONEXIÓN AUTOMÁTICA DE AUDITORÍA (AUDIT LOG HOOKS)
// ============================================================================
// Los hooks interceptan después de cada CREATE, UPDATE y DELETE para registrar
// el estado anterior (before) y posterior (after) en la tabla de log correspondiente.

const { attachLogHooks } = require('../utils/logHooks');

// Modelos cuya auditoría impacta a nivel global (system_logs)
const systemModels = ['Company', 'Plan', 'SystemUser', 'SystemRol', 'SystemParameter'];

// Modelos cuya auditoría se aísla por inquilino (company_logs)
const companyModels = [
    'CompanyParameter', 'Subscription', 'InstallationMode', 
    'CompanyUser', 'CompanyArea', 'CompanyRol', 'CompanyHeadquarter',
    'CompanyCarnet', 'CompanyTemplateCarnet', 'CompanyEvent',
    'PaymentMethod', 'Payment'
];

systemModels.forEach(name => {
    if (models[name]) attachLogHooks(models[name], 'system', models);
});

companyModels.forEach(name => {
    if (models[name]) attachLogHooks(models[name], 'company', models);
});

module.exports = {
    sequelize,
    ...models
};
