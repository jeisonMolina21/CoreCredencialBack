const authService = require('../services/authService');
const asyncHandler = require('../helpers/asyncHandler');

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.systemLogin(email, password);
    res.json(result);
});

module.exports = { login };
