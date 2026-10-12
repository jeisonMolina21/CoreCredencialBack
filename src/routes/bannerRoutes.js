const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { verifyToken, isSystem } = require('../middleware/authMiddleware');
const bannerUpload = require('../middleware/bannerUploadMiddleware');
const validate = require('../middleware/validateMiddleware');
const { bannerSchema } = require('../validators/bannerValidator');

// Rutas Públicas
router.get('/active', bannerController.getAllActive);

// Rutas Protegidas (Solo Admin)
router.get('/', verifyToken, isSystem, bannerController.getAll);
router.post('/', verifyToken, isSystem, bannerUpload.single('image'), validate(bannerSchema), bannerController.create);
router.delete('/:id', verifyToken, isSystem, bannerController.delete);
router.patch('/:id/toggle', verifyToken, isSystem, bannerController.toggleStatus);

module.exports = router;
