const Banner = require('../models/Banner');
const fs = require('fs');
const path = require('path');
const AppError = require('../utils/appError');

class BannerService {
    async getAllActive() {
        return await Banner.findAll({
            where: { is_active: true },
            order: [['order', 'ASC'], ['createdAt', 'DESC']]
        });
    }

    async getAll() {
        return await Banner.findAll({
            order: [['order', 'ASC'], ['createdAt', 'DESC']]
        });
    }

    async create(data, file) {
        if (!file) {
            throw new AppError('La imagen del banner es obligatoria', 400);
        }

        const { title, subtitle, link_url, order } = data;
        const imageUrl = `/uploads/banners/${file.filename}`;

        return await Banner.create({
            title,
            subtitle,
            image_url: imageUrl,
            link_url,
            order: order || 0
        });
    }

    async delete(id) {
        const banner = await Banner.findByPk(id);
        if (!banner) {
            throw new AppError('Banner no encontrado', 404);
        }

        // Eliminar archivo físico
        const filePath = path.join(__dirname, '../../', banner.image_url);
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.error(`Error deleting file ${filePath}:`, err);
            }
        }

        await banner.destroy();
        return true;
    }

    async toggleStatus(id) {
        const banner = await Banner.findByPk(id);
        if (!banner) {
            throw new AppError('Banner no encontrado', 404);
        }

        banner.is_active = !banner.is_active;
        await banner.save();
        return banner;
    }
}

module.exports = new BannerService();
