const express = require('express');
const cors = require('cors');
const config = require('./src/config/config');

// Importar rutas
const authRoutes = require('./src/routes/authRoutes');
const estudianteRoutes = require('./src/routes/estudianteRoutes');

// Crear aplicación Express
const app = express();

// Middleware
// Configurar CORS para permitir el frontend
app.use(cors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static('public'));

// Logger simple
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/estudiantes', estudianteRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Sistema de Seguimiento Académico - API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: {
                login: 'POST /api/auth/login',
                verify: 'GET /api/auth/verify',
                logout: 'POST /api/auth/logout'
            },
            estudiantes: {
                profile: 'GET /api/estudiantes/profile',
                calificaciones: 'GET /api/estudiantes/:id/calificaciones',
                resumen: 'GET /api/estudiantes/:id/resumen',
                tutores: 'GET /api/estudiantes/:id/tutores',
                riesgo: 'GET /api/estudiantes/:id/riesgo',
                all: 'GET /api/estudiantes',
                create: 'POST /api/estudiantes'
            }
        }
    });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        error: config.nodeEnv === 'development' ? err.stack : undefined
    });
});

// Iniciar servidor
const PORT = config.port;
app.listen(PORT, () => {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  🎓 Sistema de Seguimiento Académico - API');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`  ✅ Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`  📚 Documentación: http://localhost:${PORT}/`);
    console.log(`  🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`  🔧 Entorno: ${config.nodeEnv}`);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
});

module.exports = app;