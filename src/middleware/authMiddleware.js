/**
 * ============================================================================
 * MIDDLEWARE DE AUTENTICACIÓN Y AUTORIZACIÓN (JWT & RBAC)
 * ============================================================================
 * Gestiona el control de acceso a las rutas del backend según el token JWT,
 * valida las firmas criptográficas y segrega permisos entre:
 * - Usuarios de Sistema (SuperAdmin global)
 * - Usuarios de Compañía (Tenants/Empresas y sus colaboradores)
 * 
 * Además, puebla el contexto asíncrono (AsyncLocalStorage) para que el módulo
 * de auditoría (`logHooks.js`) conozca qué usuario y qué empresa realizó cada cambio.
 */

const jwt = require('jsonwebtoken');
const Context = require('../utils/context');
const logger = require('../utils/logger');

/**
 * Valida la existencia y la integridad criptográfica del Bearer Token JWT.
 * 
 * Flujo:
 * 1. Extrae el encabezado 'Authorization: Bearer <token>'.
 * 2. Si no existe, rechaza con HTTP 401 (No autorizado).
 * 3. Valida la firma contra process.env.JWT_SECRET.
 * 4. Si el token expiró o es alterado, rechaza con HTTP 403 (Prohibido).
 * 5. Si es válido, inyecta `req.user` y puebla el almacén de contexto (`Context`).
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Acceso denegado: Token de autenticación no proporcionado.' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        // Poblamos el contexto global por hilo de solicitud para auditoría (logHooks)
        Context.set('userId', decoded.id);
        if (decoded.company_id) {
            Context.set('companyId', decoded.company_id);
            Context.set('companyUserId', decoded.id);
        }

        next();
    } catch (error) {
        logger.warn(`Intento de acceso con token inválido o expirado: ${error.message}`);
        return res.status(403).json({ 
            success: false, 
            message: 'Token de sesión inválido o expirado. Por favor inicie sesión nuevamente.' 
        });
    }
};

/**
 * Filtro de Autorización: Restringe el acceso exclusivamente a usuarios globales
 * de plataforma (SuperAdmins del sistema).
 * 
 * @example Usado en gestión de planes, empresas registradas y logs del sistema.
 */
const isSystem = (req, res, next) => {
    if (req.user && req.user.type === 'system') {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            message: 'Acceso denegado: Esta acción requiere permisos de Administrador Global del Sistema.' 
        });
    }
};

/**
 * Filtro de Autorización: Restringe el acceso exclusivamente a colaboradores
 * o administradores pertenecientes a una empresa cliente (Tenant).
 * 
 * @example Usado en generación de carnets, sedes, áreas y colaboradores de empresa.
 */
const isCompany = (req, res, next) => {
    if (req.user && req.user.type === 'company') {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            message: 'Acceso denegado: Esta acción está reservada para usuarios de la empresa (Tenant).' 
        });
    }
};

module.exports = {
    verifyToken,
    isSystem,
    isCompany
};
