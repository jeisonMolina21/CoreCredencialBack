const bannerService = require('../services/bannerService');
const asyncHandler = require('../helpers/asyncHandler');

const bannerController = {
    // Obtener todos los banners activos (Public)
    getAllActive: asyncHandler(async (req, res) => {
        const banners = await bannerService.getAllActive();
        res.status(200).json({
            success: true,
            data: banners
        });
    }),

    // Obtener todos los banners (Admin)
    getAll: asyncHandler(async (req, res) => {
        const banners = await bannerService.getAll();
        res.status(200).json({
            success: true,
            data: banners
        });
    }),

    // Crear un nuevo banner
    create: asyncHandler(async (req, res) => {
        const banner = await bannerService.create(req.body, req.file);
        res.status(201).json({
            success: true,
            message: 'Banner creado exitosamente',
            data: banner
        });
    }),

    // Eliminar un banner
    delete: asyncHandler(async (req, res) => {
        const { id } = req.params;
        await bannerService.delete(id);
        res.status(200).json({
            success: true,
            message: 'Banner eliminado correctamente'
        });
    }),

    // Alternar estado activo
    toggleStatus: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const banner = await bannerService.toggleStatus(id);
        res.status(200).json({
            success: true,
            message: 'Estado del banner actualizado',
            data: banner
        });
    })
};

module.exports = bannerController;
