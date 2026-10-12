const express = require('express');
const router = express.Router();
const companyAreaController = require('../controllers/companyAreaController');
const { verifyToken, isCompany } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { areaSchema } = require('../validators/companyEntityValidator');

router.use(verifyToken, isCompany);

router.get('/', companyAreaController.getAreas);
router.get('/:id', companyAreaController.getArea);
router.post('/', validate(areaSchema), companyAreaController.createArea);
router.put('/:id', validate(areaSchema), companyAreaController.updateArea);
router.delete('/:id', companyAreaController.deleteArea);

module.exports = router;
