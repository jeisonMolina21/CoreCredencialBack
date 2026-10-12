const express = require('express');
const router = express.Router();
const systemUserController = require('../controllers/systemUserController');
const { verifyToken, isSystem } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { systemUserSchema } = require('../validators/systemValidator');

router.use(verifyToken, isSystem);

router.get('/', systemUserController.getAll);
router.get('/:id', systemUserController.getById);
router.post('/', validate(systemUserSchema), systemUserController.create);
router.put('/:id', validate(systemUserSchema), systemUserController.update);
router.patch('/:id/toggle-status', systemUserController.toggleStatus);
router.delete('/:id', systemUserController.remove);

module.exports = router;
