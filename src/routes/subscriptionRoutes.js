const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { verifyToken, isSystem, isCompany } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createSubscriptionSchema, updateSubscriptionSchema, updateMySubscriptionSchema } = require('../validators/subscriptionValidator');

router.get('/my-subscription', verifyToken, isCompany, subscriptionController.getMySubscription);
router.patch('/my-subscription', verifyToken, isCompany, validate(updateMySubscriptionSchema), subscriptionController.updateMySubscription);

// Rutas de administración (Global)
router.get('/', verifyToken, isSystem, subscriptionController.getAll);
router.get('/:id', verifyToken, isSystem, subscriptionController.getById);
router.post('/', verifyToken, isSystem, validate(createSubscriptionSchema), subscriptionController.create);
router.put('/:id', verifyToken, isSystem, validate(updateSubscriptionSchema), subscriptionController.update);
router.delete('/:id', verifyToken, isSystem, subscriptionController.remove);

module.exports = router;
