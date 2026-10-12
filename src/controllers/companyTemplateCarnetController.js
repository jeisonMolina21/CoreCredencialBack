const companyTemplateCarnetService = require('../services/companyTemplateCarnetService');
const asyncHandler = require('../helpers/asyncHandler');
const AppError = require('../utils/appError');

const getTemplates = asyncHandler(async (req, res, next) => {
    const templates = await companyTemplateCarnetService.getAll(req.user.company_id);
    res.status(200).json({
        success: true,
        data: templates
    });
});

const getTemplate = asyncHandler(async (req, res, next) => {
    const template = await companyTemplateCarnetService.getById(req.params.id, req.user.company_id);
    if (!template) return next(new AppError('Plantilla no encontrada', 404));
    res.status(200).json({
        success: true,
        data: template
    });
});

const createTemplate = asyncHandler(async (req, res, next) => {
    const data = { ...req.body, company_id: req.user.company_id };
    const template = await companyTemplateCarnetService.create(data);
    res.status(201).json({
        success: true,
        data: template
    });
});

const updateTemplate = asyncHandler(async (req, res, next) => {
    const template = await companyTemplateCarnetService.update(req.params.id, req.user.company_id, req.body);
    res.status(200).json({
        success: true,
        data: template
    });
});

const deleteTemplate = asyncHandler(async (req, res, next) => {
    await companyTemplateCarnetService.delete(req.params.id, req.user.company_id);
    res.status(204).json({
        success: true,
        data: null
    });
});

module.exports = {
    getTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate
};
