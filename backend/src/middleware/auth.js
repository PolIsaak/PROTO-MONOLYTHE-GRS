const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Middleware para verificar el token JWT
 */
const authenticateToken = (req, res, next) => {
    // Obtener el token del header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token de autenticación requerido'
        });
    }
    
    // Verificar el token
    jwt.verify(token, config.jwtSecret, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Token inválido o expirado'
            });
        }
        
        // Agregar la información del usuario al request
        req.user = user;
        next();
    });
};

/**
 * Middleware para verificar que el usuario es un estudiante
 */
const isEstudiante = (req, res, next) => {
    if (req.user.tipo !== 'estudiante') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Solo estudiantes pueden acceder a este recurso.'
        });
    }
    next();
};

/**
 * Middleware para verificar que el usuario es un tutor
 */
const isTutor = (req, res, next) => {
    if (req.user.tipo !== 'tutor') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Solo tutores pueden acceder a este recurso.'
        });
    }
    next();
};

/**
 * Middleware para verificar que el estudiante solo accede a sus propios datos
 */
const isOwnEstudiante = (req, res, next) => {
    const estudianteId = parseInt(req.params.id || req.params.estudianteId);
    
    if (req.user.tipo !== 'estudiante' || req.user.id !== estudianteId) {
        return res.status(403).json({
            success: false,
            message: 'No tienes permiso para acceder a estos datos'
        });
    }
    next();
};

/**
 * Middleware para verificar que un tutor puede acceder a los datos de su estudiante
 */
const canAccessEstudiante = async (req, res, next) => {
    const estudianteId = parseInt(req.params.id || req.params.estudianteId);
    
    // Si es el propio estudiante, permitir acceso
    if (req.user.tipo === 'estudiante' && req.user.id === estudianteId) {
        return next();
    }
    
    // Si es tutor, verificar que el estudiante esté asignado
    if (req.user.tipo === 'tutor') {
        const { dbAsync } = require('../config/database');
        
        const sql = `
            SELECT COUNT(*) as count
            FROM estudiante_tutor
            WHERE estudiante_id = ? AND tutor_id = ?
        `;
        
        const result = await dbAsync.get(sql, [estudianteId, req.user.id]);
        
        if (result.count > 0) {
            return next();
        }
    }
    
    return res.status(403).json({
        success: false,
        message: 'No tienes permiso para acceder a estos datos'
    });
};

module.exports = {
    authenticateToken,
    isEstudiante,
    isTutor,
    isOwnEstudiante,
    canAccessEstudiante
};