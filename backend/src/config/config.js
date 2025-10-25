require('dotenv').config();

const config = {
    // Servidor
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // JWT
    jwtSecret: process.env.JWT_SECRET || 'tu_clave_secreta_super_segura_cambiar_en_produccion',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    
    // Base de datos
    dbPath: process.env.DB_PATH || './database/escuela.db',
    
    // Alertas
    alertas: {
        promedioMinimo: parseFloat(process.env.ALERTA_PROMEDIO_MINIMO) || 6.0,
        calificacionMinima: parseFloat(process.env.ALERTA_CALIFICACION_MINIMA) || 6.0,
        materiasReprobadasMaximo: parseInt(process.env.ALERTA_MATERIAS_REPROBADAS_MAXIMO) || 2
    },
    
    // Notificaciones
    whatsapp: {
        apiKey: process.env.WHATSAPP_API_KEY,
        apiUrl: process.env.WHATSAPP_API_URL,
        fromNumber: process.env.WHATSAPP_FROM_NUMBER
    },
    
    email: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
        from: process.env.EMAIL_FROM || 'noreply@escuela56.edu.mx'
    }
};

module.exports = config;