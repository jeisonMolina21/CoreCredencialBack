const express = require('express');
const router = express.Router();
const companyHeadquarterController = require('../controllers/companyHeadquarterController');
const { verifyToken, isCompany } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { headquarterSchema } = require('../validators/companyEntityValidator');

router.use(verifyToken, isCompany);

router.get('/', companyHeadquarterController.getHeadquarters);
router.get('/:id', companyHeadquarterController.getHeadquarter);
router.post('/', validate(headquarterSchema), companyHeadquarterController.createHeadquarter);
router.put('/:id', validate(headquarterSchema), companyHeadquarterController.updateHeadquarter);
router.delete('/:id', companyHeadquarterController.deleteHeadquarter);

module.exports = router;
