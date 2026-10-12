const express = require('express');
const router = express.Router();
const systemParameterController = require('../controllers/systemParameterController');
const { verifyToken, isSystem } = require('../middleware/authMiddleware');

router.use(verifyToken, isSystem);

// Enrutamientos directos para el modelo global único (No usa ID en el parámetro HTTP ya que internamente forzamos PK = 1)
router.get('/', systemParameterController.getParameters);
router.put('/', systemParameterController.updateParameters);

module.exports = router;
