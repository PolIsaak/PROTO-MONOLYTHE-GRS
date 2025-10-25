const { body, param, validationResult } = require('express-validator');

/**
 * Middleware para manejar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    
    next();
};

/**
 * Validaciones para login
 */
const validateLogin = [
    body('curp')
        .notEmpty().withMessage('El CURP es requerido')
        .isLength({ min: 18, max: 18 }).withMessage('El CURP debe tener 18 caracteres')
        .matches(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/).withMessage('Formato de CURP inválido'),
    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    handleValidationErrors
];

/**
 * Validaciones para crear estudiante
 */
const validateCreateEstudiante = [
    body('curp')
        .notEmpty().withMessage('El CURP es requerido')
        .isLength({ min: 18, max: 18 }).withMessage('El CURP debe tener 18 caracteres')
        .matches(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/).withMessage('Formato de CURP inválido'),
    body('nombre')
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('apellido_paterno')
        .notEmpty().withMessage('El apellido paterno es requerido')
        .isLength({ min: 2, max: 100 }).withMessage('El apellido paterno debe tener entre 2 y 100 caracteres'),
    body('apellido_materno')
        .optional()
        .isLength({ max: 100 }).withMessage('El apellido materno debe tener máximo 100 caracteres'),
    body('grado')
        .notEmpty().withMessage('El grado es requerido')
        .isInt({ min: 1, max: 3 }).withMessage('El grado debe ser 1, 2 o 3'),
    body('grupo')
        .notEmpty().withMessage('El grupo es requerido')
        .isLength({ min: 1, max: 1 }).withMessage('El grupo debe ser una letra')
        .matches(/^[A-Z]$/).withMessage('El grupo debe ser una letra mayúscula'),
    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    handleValidationErrors
];

/**
 * Validación de ID de estudiante en parámetros
 */
const validateEstudianteId = [
    param('id')
        .notEmpty().withMessage('El ID es requerido')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
    handleValidationErrors
];

/**
 * Validación de periodo
 */
const validatePeriodo = [
    param('periodoId')
        .optional()
        .isInt({ min: 1 }).withMessage('El ID del periodo debe ser un número entero positivo'),
    handleValidationErrors
];

module.exports = {
    validateLogin,
    validateCreateEstudiante,
    validateEstudianteId,
    validatePeriodo,
    handleValidationErrors
};