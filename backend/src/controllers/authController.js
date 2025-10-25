const jwt = require('jsonwebtoken');
const Estudiante = require('../models/Estudiante');
const config = require('../config/config');

/**
 * Generar token JWT
 */
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            curp: user.curp,
            tipo: 'estudiante'
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
    );
};

/**
 * Login de estudiante
 */
const login = async (req, res) => {
    try {
        const { curp, password } = req.body;
        
        // Buscar estudiante por CURP
        const estudiante = await Estudiante.findByCurp(curp);
        
        if (!estudiante) {
            return res.status(401).json({
                success: false,
                message: 'CURP o contraseña incorrectos'
            });
        }
        
        // Verificar contraseña
        const isValidPassword = await Estudiante.verifyPassword(password, estudiante.password_hash);
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'CURP o contraseña incorrectos'
            });
        }
        
        // Generar token
        const token = generateToken(estudiante);
        
        // Remover password_hash de la respuesta
        delete estudiante.password_hash;
        
        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                token,
                estudiante: {
                    id: estudiante.id,
                    curp: estudiante.curp,
                    nombre: estudiante.nombre,
                    apellido_paterno: estudiante.apellido_paterno,
                    apellido_materno: estudiante.apellido_materno,
                    grado: estudiante.grado,
                    grupo: estudiante.grupo
                }
            }
        });
        
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: error.message
        });
    }
};

/**
 * Verificar token
 */
const verifyToken = async (req, res) => {
    try {
        // El token ya fue verificado por el middleware authenticateToken
        const estudiante = await Estudiante.findById(req.user.id);
        
        if (!estudiante) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: {
                estudiante: {
                    id: estudiante.id,
                    curp: estudiante.curp,
                    nombre: estudiante.nombre,
                    apellido_paterno: estudiante.apellido_paterno,
                    apellido_materno: estudiante.apellido_materno,
                    grado: estudiante.grado,
                    grupo: estudiante.grupo
                }
            }
        });
        
    } catch (error) {
        console.error('Error en verifyToken:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: error.message
        });
    }
};

/**
 * Logout (opcional - en JWT el logout es del lado del cliente)
 */
const logout = async (req, res) => {
    res.json({
        success: true,
        message: 'Logout exitoso. Por favor elimina el token del cliente.'
    });
};

module.exports = {
    login,
    verifyToken,
    logout
};