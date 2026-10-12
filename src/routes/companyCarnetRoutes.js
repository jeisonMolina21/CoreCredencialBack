const express = require('express');
const router = express.Router();
const companyCarnetController = require('../controllers/companyCarnetController');
const { verifyToken, isCompany } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { carnetSchema } = require('../validators/carnetValidator');

router.use(verifyToken, isCompany);

router.get('/', companyCarnetController.getCarnets);
router.get('/:id', companyCarnetController.getCarnet);
router.post('/', validate(carnetSchema), companyCarnetController.createCarnet);
router.put('/:id', validate(carnetSchema), companyCarnetController.updateCarnet);
router.delete('/:id', companyCarnetController.deleteCarnet);

module.exports = router;
