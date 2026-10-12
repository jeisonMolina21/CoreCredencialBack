const companyService = require('../services/companyService');
const companyDisableService = require('../services/companyDisableService');
const authService = require('../services/authService');
const asyncHandler = require('../helpers/asyncHandler');
const AppError = require('../utils/appError');

/**
 * Permite a un administrador del sistema generar un token de acceso
 * para una empresa específica.
 */
const impersonate = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await authService.impersonate(id, req.user);
    
    res.status(200).json({
        success: true,
        message: `Acceso concedido a la gestión de ${result.user.company_name}`,
        data: result
    });
});

const getAll = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search = '' } = req.query;
    const result = await companyService.getAll({
        page: Number(page),
        limit: Number(limit),
        search: search.trim()
    });

    res.status(200).json({
        success: true,
        message: 'Empresas obtenidas correctamente',
        data: result.data,
        meta: {
            total: result.total,
            page: result.page,
            totalPages: result.totalPages
        }
    });
});

const getById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (req.user.type === 'company' && Number(req.user.company_id) !== Number(id)) {
        return next(new AppError('No tienes permiso para consultar esta empresa', 403));
    }

    const company = await companyService.getById(id);
    if (!company) {
        return next(new AppError('Empresa no encontrada', 404));
    }

    res.status(200).json({
        success: true,
        data: company
    });
});

const create = asyncHandler(async (req, res) => {
    const company = await companyService.create(req.body);
    res.status(201).json({
        success: true,
        message: 'Empresa creada exitosamente',
        data: company
    });
});

const update = asyncHandler(async (req, res) => {
    const company = await companyService.update(req.params.id, req.body);
    res.status(200).json({
        success: true,
        message: 'Empresa actualizada exitosamente',
        data: company
    });
});

const remove = asyncHandler(async (req, res) => {
    await companyService.delete(req.params.id);
    res.status(200).json({
        success: true,
        message: 'Empresa desactivada exitosamente'
    });
});

const disable = asyncHandler(async (req, res) => {
    const result = await companyDisableService.disable(req.params.id);
    res.status(200).json({
        success: true,
        message: result.message,
        data: result
    });
});

const reactivate = asyncHandler(async (req, res) => {
    const result = await companyDisableService.reactivate(req.params.id);
    res.status(200).json({
        success: true,
        message: result.message,
        data: result
    });
});

const adminRegister = asyncHandler(async (req, res) => {
    const result = await companyService.adminRegister(req.body, req.file);
    res.status(201).json({
        success: true,
        message: 'Empresa registrada exitosamente con su administrador y suscripción.',
        data: result
    });
});

const checkNit = asyncHandler(async (req, res) => {
    const { nit } = req.params;
    const exists = await companyService.checkNit(nit);
    
    res.status(200).json({
        success: true,
        message: exists ? 'El NIT ya está registrado' : 'NIT disponible',
        data: { exists }
    });
});

const updateParameters = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (req.user.type === 'company' && Number(req.user.company_id) !== Number(id)) {
        return next(new AppError('No tienes permiso para modificar esta empresa', 403));
    }

    const result = await companyService.updateParameters(id, req.body, req.file);
    res.status(200).json({
        success: true,
        message: 'Parámetros actualizados exitosamente',
        data: result
    });
});

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    disable,
    reactivate,
    adminRegister,
    impersonate,
    checkNit,
    updateParameters
};
