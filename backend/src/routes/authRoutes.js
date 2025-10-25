const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   POST /api/auth/login
 * @desc    Login de estudiante
 * @access  Public
 */
router.post('/login', validateLogin, authController.login);

/**
 * @route   GET /api/auth/verify
 * @desc    Verificar token JWT
 * @access  Private
 */
router.get('/verify', authenticateToken, authController.verifyToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout (eliminar token del cliente)
 * @access  Private
 */
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;