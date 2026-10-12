const paymentService = require('../services/paymentService');

class PaymentController {
    /**
     * Obtiene todos los pagos (Vista Global - Solo para Administradores de Sistema)
     */
    async getAll(req, res) {
        try {
            const payments = await paymentService.getAllPayments();
            res.json(payments);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Obtiene los pagos de la empresa actual (del token)
     */
    async getMyPayments(req, res) {
        try {
            const companyId = req.user.company_id;
            if (!companyId) return res.status(400).json({ message: 'No se identificó la compañía del usuario' });
            
            const payments = await paymentService.getPaymentsByCompany(companyId);
            res.json(payments);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Obtiene los pagos de una empresa específica (Vista de Sistema)
     */
    async getByCompany(req, res) {
        try {
            const { companyId } = req.params;
            const payments = await paymentService.getPaymentsByCompany(companyId);
            res.json(payments);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new PaymentController();
