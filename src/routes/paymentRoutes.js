const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const webhookController = require('../controllers/webhookController');
const { verifyToken, isSystem, isCompany } = require('../middleware/authMiddleware');

// Ruta pública para Webhooks de Mercado Pago
router.post('/webhook', webhookController.handleWebhook);

// Rutas para Administradores de Sistema
router.get('/all', verifyToken, isSystem, paymentController.getAll);
router.get('/company/:companyId', verifyToken, isSystem, paymentController.getByCompany);

// Rutas para Empresas
router.get('/my-history', verifyToken, isCompany, paymentController.getMyPayments);

module.exports = router;
