const Estudiante = require('../models/Estudiante');
const config = require('../config/config');

/**
 * Obtener perfil del estudiante autenticado
 */
const getProfile = async (req, res) => {
    try {
        const estudiante = await Estudiante.findById(req.user.id);
        
        if (!estudiante) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: { estudiante }
        });
        
    } catch (error) {
        console.error('Error en getProfile:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el perfil',
            error: error.message
        });
    }
};

/**
 * Obtener calificaciones del estudiante
 */
const getCalificaciones = async (req, res) => {
    try {
        const estudianteId = parseInt(req.params.id);
        const periodoId = req.query.periodo ? parseInt(req.query.periodo) : null;
        
        const calificaciones = await Estudiante.getCalificaciones(estudianteId, periodoId);
        const promedio = await Estudiante.getPromedio(estudianteId, periodoId);
        const materiasReprobadas = await Estudiante.countMateriasReprobadas(estudianteId, periodoId);
        
        res.json({
            success: true,
            data: {
                calificaciones,
                promedio: parseFloat(promedio),
                materiasReprobadas,
                periodo: periodoId
            }
        });
        
    } catch (error) {
        console.error('Error en getCalificaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las calificaciones',
            error: error.message
        });
    }
};

/**
 * Obtener resumen académico completo
 */
const getResumenAcademico = async (req, res) => {
    try {
        const estudianteId = parseInt(req.params.id);
        const periodoId = req.query.periodo ? parseInt(req.query.periodo) : null;
        
        const resumen = await Estudiante.getResumenAcademico(estudianteId, periodoId);
        const enRiesgo = await Estudiante.isEnRiesgo(estudianteId, periodoId, config);
        
        res.json({
            success: true,
            data: {
                ...resumen,
                enRiesgo
            }
        });
        
    } catch (error) {
        console.error('Error en getResumenAcademico:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el resumen académico',
            error: error.message
        });
    }
};

/**
 * Obtener tutores del estudiante
 */
const getTutores = async (req, res) => {
    try {
        const estudianteId = parseInt(req.params.id);
        
        const tutores = await Estudiante.getTutores(estudianteId);
        
        res.json({
            success: true,
            data: { tutores }
        });
        
    } catch (error) {
        console.error('Error en getTutores:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los tutores',
            error: error.message
        });
    }
};

/**
 * Verificar estado de riesgo académico
 */
const checkRiesgoAcademico = async (req, res) => {
    try {
        const estudianteId = parseInt(req.params.id);
        const periodoId = req.query.periodo ? parseInt(req.query.periodo) : null;
        
        const estudiante = await Estudiante.findById(estudianteId);
        const enRiesgo = await Estudiante.isEnRiesgo(estudianteId, periodoId, config);
        const promedio = await Estudiante.getPromedio(estudianteId, periodoId);
        const materiasReprobadas = await Estudiante.countMateriasReprobadas(estudianteId, periodoId);
        
        res.json({
            success: true,
            data: {
                estudiante: {
                    id: estudiante.id,
                    nombre: `${estudiante.nombre} ${estudiante.apellido_paterno}`,
                    grado: estudiante.grado,
                    grupo: estudiante.grupo
                },
                promedio: parseFloat(promedio),
                materiasReprobadas,
                enRiesgo,
                criterios: {
                    promedioMinimo: config.alertas.promedioMinimo,
                    materiasReprobadasMaximo: config.alertas.materiasReprobadasMaximo
                }
            }
        });
        
    } catch (error) {
        console.error('Error en checkRiesgoAcademico:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar el riesgo académico',
            error: error.message
        });
    }
};

/**
 * Obtener todos los estudiantes (admin)
 */
const getAllEstudiantes = async (req, res) => {
    try {
        const estudiantes = await Estudiante.getAll();
        
        res.json({
            success: true,
            data: {
                total: estudiantes.length,
                estudiantes
            }
        });
        
    } catch (error) {
        console.error('Error en getAllEstudiantes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los estudiantes',
            error: error.message
        });
    }
};

/**
 * Crear nuevo estudiante (admin)
 */
const createEstudiante = async (req, res) => {
    try {
        const estudianteData = req.body;
        
        // Verificar si el CURP ya existe
        const existingEstudiante = await Estudiante.findByCurp(estudianteData.curp);
        
        if (existingEstudiante) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un estudiante con este CURP'
            });
        }
        
        const estudianteId = await Estudiante.create(estudianteData);
        const estudiante = await Estudiante.findById(estudianteId);
        
        res.status(201).json({
            success: true,
            message: 'Estudiante creado exitosamente',
            data: { estudiante }
        });
        
    } catch (error) {
        console.error('Error en createEstudiante:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear el estudiante',
            error: error.message
        });
    }
};

module.exports = {
    getProfile,
    getCalificaciones,
    getResumenAcademico,
    getTutores,
    checkRiesgoAcademico,
    getAllEstudiantes,
    createEstudiante
};