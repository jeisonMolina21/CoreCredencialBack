const authService = require('../services/authService');
const asyncHandler = require('../helpers/asyncHandler');

const login = asyncHandler(async (req, res) => {
    const { company_email, password, company_id } = req.body;
    const result = await authService.companyLogin(company_email, password, company_id);
    res.json(result);
});

module.exports = { login };
