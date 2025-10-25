const express = require('express');
const router = express.Router();
const estudianteController = require('../controllers/estudianteController');
const { authenticateToken, canAccessEstudiante } = require('../middleware/auth');
const { validateEstudianteId, validateCreateEstudiante } = require('../middleware/validation');

/**
 * @route   GET /api/estudiantes/profile
 * @desc    Obtener perfil del estudiante autenticado
 * @access  Private (Estudiante)
 */
router.get('/profile', authenticateToken, estudianteController.getProfile);

/**
 * @route   GET /api/estudiantes/:id/calificaciones
 * @desc    Obtener calificaciones de un estudiante
 * @access  Private (Estudiante o su tutor)
 * @query   periodo - ID del periodo (opcional)
 */
router.get(
    '/:id/calificaciones',
    authenticateToken,
    validateEstudianteId,
    canAccessEstudiante,
    estudianteController.getCalificaciones
);

/**
 * @route   GET /api/estudiantes/:id/resumen
 * @desc    Obtener resumen académico completo
 * @access  Private (Estudiante o su tutor)
 * @query   periodo - ID del periodo (opcional)
 */
router.get(
    '/:id/resumen',
    authenticateToken,
    validateEstudianteId,
    canAccessEstudiante,
    estudianteController.getResumenAcademico
);

/**
 * @route   GET /api/estudiantes/:id/tutores
 * @desc    Obtener tutores de un estudiante
 * @access  Private (Estudiante o su tutor)
 */
router.get(
    '/:id/tutores',
    authenticateToken,
    validateEstudianteId,
    canAccessEstudiante,
    estudianteController.getTutores
);

/**
 * @route   GET /api/estudiantes/:id/riesgo
 * @desc    Verificar si el estudiante está en riesgo académico
 * @access  Private (Estudiante o su tutor)
 * @query   periodo - ID del periodo (opcional)
 */
router.get(
    '/:id/riesgo',
    authenticateToken,
    validateEstudianteId,
    canAccessEstudiante,
    estudianteController.checkRiesgoAcademico
);

/**
 * @route   GET /api/estudiantes
 * @desc    Obtener todos los estudiantes (admin)
 * @access  Private (Admin) - Por ahora público para testing
 */
router.get('/', estudianteController.getAllEstudiantes);

/**
 * @route   POST /api/estudiantes
 * @desc    Crear nuevo estudiante (admin)
 * @access  Private (Admin) - Por ahora público para testing
 */
router.post('/', validateCreateEstudiante, estudianteController.createEstudiante);

module.exports = router;