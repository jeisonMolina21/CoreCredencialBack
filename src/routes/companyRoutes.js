const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { verifyToken, isSystem } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createCompanySchema, updateCompanySchema, updateBrandingSchema } = require('../validators/companyValidator');

router.get('/', verifyToken, isSystem, companyController.getAll);
router.get('/dashboard', verifyToken, require('../controllers/companyDashboardController').getDashboardStats);
router.get('/:id', verifyToken, companyController.getById);
router.post('/', verifyToken, isSystem, validate(createCompanySchema), companyController.create);
router.put('/:id', verifyToken, isSystem, validate(updateCompanySchema), companyController.update);
router.delete('/:id', verifyToken, isSystem, companyController.remove);

// Registro completo: empresa + suscripción con plan elegido + admin (Solo sistema)
router.post('/register', verifyToken, isSystem, upload.single('logo'), companyController.adminRegister);

// Acciones de estado controlado
router.patch('/:id/disable', verifyToken, isSystem, companyController.disable);
router.patch('/:id/reactivate', verifyToken, isSystem, companyController.reactivate);
router.post('/:id/impersonate', verifyToken, isSystem, companyController.impersonate);
router.patch('/:id/parameters', verifyToken, upload.single('logo'), validate(updateBrandingSchema), companyController.updateParameters);
router.get('/check-nit/:nit', companyController.checkNit);

module.exports = router;

