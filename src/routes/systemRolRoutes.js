const express = require('express');
const router = express.Router();
const systemRolController = require('../controllers/systemRolController');
const { verifyToken, isSystem } = require('../middleware/authMiddleware');

router.use(verifyToken, isSystem);

router.get('/', systemRolController.getAll);
router.get('/:id', systemRolController.getById);
router.post('/', systemRolController.create);
router.put('/:id', systemRolController.update);
router.delete('/:id', systemRolController.remove);

module.exports = router;
