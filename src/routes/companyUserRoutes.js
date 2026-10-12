const express = require('express');
const router = express.Router();
const companyUserController = require('../controllers/companyUserController');
const { verifyToken, isCompany } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { userSchema } = require('../validators/companyEntityValidator');

router.use(verifyToken, isCompany);

router.get('/', companyUserController.getUsers);
router.get('/:id', companyUserController.getUser);
router.post('/', validate(userSchema), companyUserController.createUser);
router.put('/:id', validate(userSchema), companyUserController.updateUser);
router.delete('/:id', companyUserController.deleteUser);

module.exports = router;
