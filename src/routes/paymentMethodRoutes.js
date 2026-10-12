const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controllers/paymentMethodController');
const { verifyToken, isCompany } = require('../middleware/authMiddleware');

// Solo las empresas gestionan sus propios métodos de pago
router.use(verifyToken, isCompany);

router.get('/', paymentMethodController.getMyMethods);
router.post('/', paymentMethodController.create);
router.put('/:id/set-primary', paymentMethodController.setPrimary);
router.delete('/:id', paymentMethodController.remove);

module.exports = router;
