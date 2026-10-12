const express = require('express');
const router = express.Router();
const systemLogController = require('../controllers/systemLogController');
const { verifyToken, isSystem } = require('../middleware/authMiddleware');

router.use(verifyToken, isSystem);

router.get('/', systemLogController.getRecentActivity);

module.exports = router;
