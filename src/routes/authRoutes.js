const express = require('express');
const router = express.Router();
const authSystemController = require('../controllers/authSystemController');
const authCompanyController = require('../controllers/authCompanyController');
const authUnifiedController = require('../controllers/authUnifiedController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const validate = require('../middleware/validateMiddleware');
const { loginSchema, registerSchema } = require('../validators/authValidator');

// Rutas de autenticación de sistema (Global) original (Mantenidas por retrocompatibilidad)
router.post('/system/login', validate(loginSchema), authSystemController.login);

// Rutas de autenticación de compañía (Tenant) original
router.post('/company/login', validate(loginSchema), authCompanyController.login);

// Rutas Unificadas
router.post('/login', validate(loginSchema), authUnifiedController.login);
router.post('/register', upload.single('logo'), validate(registerSchema), authUnifiedController.register);
router.get('/check-email/:email', authUnifiedController.checkEmail);
router.get('/payment-config', authUnifiedController.getMPConfig);
router.get('/refresh', verifyToken, authUnifiedController.refresh);

module.exports = router;
