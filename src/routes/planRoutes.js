const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { verifyToken, isSystem } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { planSchema } = require('../validators/planValidator');

router.get('/', planController.getAll);
router.get('/:id', planController.getById);
router.post('/', verifyToken, isSystem, validate(planSchema), planController.create);
router.put('/:id', verifyToken, isSystem, validate(planSchema), planController.update);
router.delete('/:id', verifyToken, isSystem, planController.remove);

module.exports = router;
