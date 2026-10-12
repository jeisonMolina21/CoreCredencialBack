const express = require('express');
const router = express.Router();
const companyTemplateCarnetController = require('../controllers/companyTemplateCarnetController');
const { verifyToken, isCompany } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { templateSchema } = require('../validators/carnetValidator');

router.use(verifyToken, isCompany);

router.get('/', companyTemplateCarnetController.getTemplates);
router.get('/:id', companyTemplateCarnetController.getTemplate);
router.post('/', validate(templateSchema), companyTemplateCarnetController.createTemplate);
router.put('/:id', validate(templateSchema), companyTemplateCarnetController.updateTemplate);
router.delete('/:id', companyTemplateCarnetController.deleteTemplate);

module.exports = router;
