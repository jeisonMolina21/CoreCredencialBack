const express = require('express');
const router = express.Router();
const companyRolController = require('../controllers/companyRolController');
const { verifyToken, isCompany } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { roleSchema } = require('../validators/companyEntityValidator');

router.use(verifyToken, isCompany);

router.get('/', companyRolController.getRoles);
router.get('/:id', companyRolController.getRole);
router.post('/', validate(roleSchema), companyRolController.createRole);
router.put('/:id', validate(roleSchema), companyRolController.updateRole);
router.delete('/:id', companyRolController.deleteRole);

module.exports = router;
