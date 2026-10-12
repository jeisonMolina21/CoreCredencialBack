const authService = require('../services/authService');
const systemParameterService = require('../services/systemParameterService');
const asyncHandler = require('../helpers/asyncHandler');

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    
    res.status(200).json({
        success: true,
        message: 'Sesión iniciada correctamente',
        data: result
    });
});

const refresh = asyncHandler(async (req, res) => {
    const result = await authService.refresh(req.user);
    
    res.status(200).json({
        success: true,
        data: result
    });
});

const register = asyncHandler(async (req, res) => {
    const logoPath = req.file ? `/uploads/logos/${req.file.filename}` : null;
    const result = await authService.register(req.body, logoPath);
    
    res.status(201).json({
        success: true,
        message: 'Registro completado exitosamente',
        data: {
            ...result,
            id: result.mp_subscription_id // Compatibilidad
        }
    });
});

const checkEmail = asyncHandler(async (req, res) => {
    const { email } = req.params;
    const exists = await authService.checkEmail(email);

    res.status(200).json({
        success: true,
        exists,
        message: exists ? 'El correo electrónico ya está registrado' : 'Correo disponible',
        data: { exists }
    });
});

const getMPConfig = asyncHandler(async (req, res) => {
    const config = await systemParameterService.getMercadoPagoConfig();
    res.status(200).json({
        success: true,
        data: config
    });


    const login = async (req,res) => {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        
        res.status(200).json({
            success: true,
            message: 'Sesión iniciada correctamente',
            data: result
        });
    }
});

module.exports = { login, refresh, register, checkEmail, getMPConfig };
