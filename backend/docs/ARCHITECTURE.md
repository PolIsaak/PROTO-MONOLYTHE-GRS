# 🏗️ Arquitectura del Sistema

## Estructura del Proyecto

```
sistema-seguimiento-academico/
│
├── 📁 database/
│   ├── escuela.db              # Base de datos SQLite
│   └── init_db.sql             # Script de inicialización SQL
│
├── 📁 src/
│   ├── 📁 config/
│   │   ├── database.js         # Configuración de BD
│   │   └── config.js           # Configuración general
│   │
│   ├── 📁 models/
│   │   ├── Estudiante.js       # Modelo de datos de Estudiante
│   │   └── Tutor.js            # Modelo de datos de Tutor
│   │
│   ├── 📁 controllers/
│   │   ├── authController.js   # Lógica de autenticación
│   │   └── estudianteController.js  # Lógica de estudiantes
│   │
│   ├── 📁 middleware/
│   │   ├── auth.js             # Middleware de autenticación JWT
│   │   └── validation.js       # Validaciones de datos
│   │
│   └── 📁 routes/
│       ├── authRoutes.js       # Rutas de autenticación
│       └── estudianteRoutes.js # Rutas de estudiantes
│
├── 📁 scripts/
│   ├── initDatabase.js         # Script para inicializar BD
│   ├── queryDatabase.js        # Script para consultar BD
│   └── testApi.js              # Tests automatizados de API
│
├── 📁 docs/
│   ├── API_DOCUMENTATION.md    # Documentación completa de API
│   ├── DATABASE_SCHEMA.md      # Esquema de la base de datos
│   └── BACKEND_TESTING.md      # Guía de pruebas del backend
│
├── 📁 public/                  # Frontend (próximamente)
│
├── server.js                   # Servidor Express principal
├── package.json                # Dependencias y scripts
├── .env                        # Variables de entorno
├── .env.example                # Ejemplo de configuración
└── README.md                   # Documentación principal
```

## Flujo de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Frontend)                        │
│                    HTML / CSS / JavaScript                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP Requests (JSON)
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                      SERVIDOR EXPRESS                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    MIDDLEWARES                              │ │
│  │  • CORS                                                     │ │
│  │  • JSON Parser                                              │ │
│  │  • Authentication (JWT)                                     │ │
│  │  • Validation                                               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      RUTAS (Routes)                         │ │
│  │  • /api/auth/*        → authRoutes                          │ │
│  │  • /api/estudiantes/* → estudianteRoutes                    │ │
│  └─────────────────────┬──────────────────────────────────────┘ │
│                        │                                         │
│  ┌─────────────────────▼──────────────────────────────────────┐ │
│  │                 CONTROLADORES (Controllers)                 │ │
│  │  • authController.js                                        │ │
│  │  • estudianteController.js                                  │ │
│  └─────────────────────┬──────────────────────────────────────┘ │
│                        │                                         │
│  ┌─────────────────────▼──────────────────────────────────────┐ │
│  │                   MODELOS (Models)                          │ │
│  │  • Estudiante.js (Lógica de negocio)                       │ │
│  │  • Tutor.js (Lógica de negocio)                            │ │
│  └─────────────────────┬──────────────────────────────────────┘ │
│                        │                                         │
└────────────────────────┼─────────────────────────────────────────┘
                         │
                         │ SQL Queries
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    BASE DE DATOS SQLite                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  TABLAS:                                                    │ │
│  │  • estudiantes                                              │ │
│  │  • tutores                                                  │ │
│  │  • calificaciones                                           │ │
│  │  • materias                                                 │ │
│  │  • periodos                                                 │ │
│  │  • estudiante_tutor (relación)                             │ │
│  │  • notificaciones                                           │ │
│  │  • configuracion_alertas                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Flujo de Autenticación

```
┌──────────┐         ┌──────────────┐         ┌──────────────┐
│ Cliente  │         │   Servidor   │         │  Base Datos  │
└────┬─────┘         └──────┬───────┘         └──────┬───────┘
     │                      │                        │
     │ POST /auth/login     │                        │
     ├─────────────────────>│                        │
     │ {curp, password}     │                        │
     │                      │                        │
     │                      │ Buscar estudiante      │
     │                      ├───────────────────────>│
     │                      │                        │
     │                      │ Datos del estudiante   │
     │                      │<───────────────────────┤
     │                      │                        │
     │                      │ Verificar password     │
     │                      │ (bcrypt)               │
     │                      │                        │
     │                      │ Generar JWT Token      │
     │                      │                        │
     │ {token, estudiante}  │                        │
     │<─────────────────────┤                        │
     │                      │                        │
     │                      │                        │
     │ GET /estudiantes/    │                        │
     │     profile          │                        │
     ├─────────────────────>│                        │
     │ Authorization:       │                        │
     │   Bearer <token>     │                        │
     │                      │                        │
     │                      │ Verificar Token (JWT)  │
     │                      │                        │
     │                      │ Obtener datos         │
     │                      ├───────────────────────>│
     │                      │                        │
     │                      │ Datos del estudiante   │
     │                      │<───────────────────────┤
     │                      │                        │
     │ {estudiante}         │                        │
     │<─────────────────────┤                        │
     │                      │                        │
```

## Sistema de Detección de Rezago Académico

```
┌─────────────────────────────────────────────────────────────────┐
│              VERIFICACIÓN DE RIESGO ACADÉMICO                    │
└─────────────────────────────────────────────────────────────────┘
                             │
           ┌─────────────────┴─────────────────┐
           │                                   │
           ▼                                   ▼
┌──────────────────────┐          ┌──────────────────────┐
│  Calcular Promedio   │          │ Contar Materias      │
│                      │          │   Reprobadas         │
│ • Sumar calificac.   │          │                      │
│ • Dividir por total  │          │ • WHERE calif < 6.0  │
└──────────┬───────────┘          └──────────┬───────────┘
           │                                 │
           │                                 │
           └─────────────┬───────────────────┘
                         │
                         ▼
           ┌─────────────────────────┐
           │  Evaluar contra         │
           │  Criterios              │
           │                         │
           │ • Promedio < 6.0?       │
           │ • Reprobadas > 2?       │
           └────────┬────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
   ┌─────────┐           ┌──────────┐
   │ EN      │           │ SIN      │
   │ RIESGO  │           │ RIESGO   │
   └────┬────┘           └──────────┘
        │
        │
        ▼
┌─────────────────────┐
│ Generar Alerta      │
│                     │
│ • Notificar tutores │
│ • Registrar evento  │
└─────────────────────┘
```

## Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **SQLite3** - Base de datos
- **bcrypt** - Encriptación de contraseñas
- **jsonwebtoken** - Autenticación JWT
- **express-validator** - Validación de datos
- **cors** - Cross-Origin Resource Sharing
- **dotenv** - Variables de entorno

### Testing
- **axios** - Cliente HTTP para tests

### Frontend (Próximamente)
- HTML5
- CSS3
- JavaScript (ES6+)
- Fetch API

## Seguridad

### Autenticación
- Contraseñas encriptadas con **bcrypt** (10 rounds)
- Tokens JWT con expiración de 24 horas
- Verificación de permisos en cada request

### Autorización
- Middleware de autenticación en rutas protegidas
- Control de acceso basado en roles (estudiante/tutor)
- Validación de propiedad de datos

### Validación
- Validación de entrada con express-validator
- Formato de CURP validado con regex
- Sanitización de datos

## Escalabilidad

### Actual (Prototipo)
- SQLite para desarrollo
- Servidor único
- Sin caché

### Futuro (Producción)
- PostgreSQL/MySQL
- Load balancer
- Redis para caché
- Microservicios para notificaciones
- CDN para recursos estáticos

## Performance

### Optimizaciones Implementadas
- Índices en la base de datos
- Promisificación de queries
- Validación temprana de datos
- Conexión persistente a BD

### Métricas Esperadas
- Tiempo de respuesta < 100ms
- Login < 200ms
- Consulta de calificaciones < 50ms

---

**Versión:** 1.0.0  
**Última actualización:** Octubre 2024