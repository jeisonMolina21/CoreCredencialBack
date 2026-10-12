const paymentService = require('../services/paymentService');

class PaymentMethodController {
    /**
     * Obtiene los métodos de pago de la empresa actual
     */
    async getMyMethods(req, res) {
        try {
            const companyId = req.user.company_id;
            if (!companyId) return res.status(400).json({ message: 'No se identificó la compañía' });
            
            const methods = await paymentService.getPaymentMethodsByCompany(companyId);
            res.json(methods);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Crea un nuevo método de pago para la empresa
     */
    async create(req, res) {
        try {
            const companyId = req.user.company_id;
            const method = await paymentService.createPaymentMethod(companyId, req.body);
            res.status(201).json(method);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Establece un método de pago como predeterminado
     */
    async setPrimary(req, res) {
        try {
            const companyId = req.user.company_id;
            const { id } = req.params;
            await paymentService.setDefaultPaymentMethod(companyId, id);
            res.json({ message: 'Método de pago actualizado como predeterminado' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Elimina (desactiva) un método de pago
     */
    async remove(req, res) {
        try {
            const companyId = req.user.company_id;
            const { id } = req.params;
            await paymentService.deletePaymentMethod(companyId, id);
            res.json({ message: 'Método de pago eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new PaymentMethodController();
