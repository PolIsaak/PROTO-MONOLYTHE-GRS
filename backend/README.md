# Sistema de Seguimiento Académico
## Escuela Secundaria Técnica No. 56 "Prof. José Luis Osuna Villa"

Sistema web para el seguimiento y detección temprana de rezago académico en estudiantes de nivel secundaria.

## 🎯 Características

- ✅ Consulta de calificaciones por estudiante
- ✅ Detección automática de estudiantes en riesgo académico
- ✅ Notificaciones a tutores vía WhatsApp y Email
- ✅ Autenticación segura para estudiantes y tutores
- ✅ Control de acceso basado en roles
- ✅ Dashboard con información académica detallada

## 📊 Estructura de la Base de Datos

### Tablas Principales

#### `estudiantes`
Almacena información de los estudiantes
- `id`: ID único
- `curp`: CURP del estudiante (único)
- `nombre`, `apellido_paterno`, `apellido_materno`
- `grado`: 1, 2 o 3
- `grupo`: A, B, C, etc.
- `password_hash`: Contraseña encriptada

#### `tutores`
Información de contacto de los tutores
- `id`: ID único
- `nombre`, `apellido_paterno`, `apellido_materno`
- `telefono`: Número para WhatsApp
- `email`: Correo electrónico

#### `calificaciones`
Registro de calificaciones por periodo
- `estudiante_id`: Referencia al estudiante
- `materia_id`: Referencia a la materia
- `periodo_id`: Referencia al periodo (trimestre)
- `calificacion`: Valor de 0 a 10

#### `notificaciones`
Historial de notificaciones enviadas
- `estudiante_id`: Estudiante relacionado
- `tutor_id`: Tutor que recibió la notificación
- `tipo`: 'whatsapp' o 'email'
- `estado`: 'pendiente', 'enviado', 'fallido'

### Relaciones
- Un estudiante puede tener múltiples tutores
- Un tutor puede tener múltiples estudiantes
- Cada estudiante tiene múltiples calificaciones por periodo

## 🚀 Instalación

### Prerrequisitos
- Node.js (v14 o superior)
- npm o yarn

### Pasos

1. **Instalar dependencias**
```bash
npm install
```

2. **Inicializar la base de datos**
```bash
npm run init-db
```

Este comando creará la base de datos SQLite con:
- 5 estudiantes de ejemplo
- 5 tutores de ejemplo
- 13 materias estándar
- 3 periodos (trimestres)
- Calificaciones del primer trimestre

3. **Iniciar el servidor**
```bash
npm start
```

Para desarrollo con auto-reload:
```bash
npm run dev
```

## 👥 Datos de Prueba

### Estudiantes (para login)

| CURP | Nombre | Grado | Grupo | Contraseña |
|------|--------|-------|-------|------------|
| GAPL050815HDFRRS09 | Luis García | 2 | A | password123 |
| MAHS060512MDFRRN08 | Sofia Martínez | 2 | A | password123 |
| ROPJ070320HDFRRS07 | Juan Rodríguez | 1 | B | password123 |
| LOGM051128MDFRRR06 | María López | 2 | B | password123 |
| HERL060815HDFRRS05 | Pedro Hernández | 3 | A | password123 |

### Casos de Prueba

- **Luis García**: Tiene 2 materias reprobadas (Matemáticas y FCE) - Activará alerta
- **Juan Rodríguez**: Tiene 5 materias reprobadas - Alto riesgo académico
- **Sofia Martínez**: Excelente desempeño - Sin alertas
- **María López**: Buen desempeño - Sin alertas
- **Pedro Hernández**: 1 materia reprobada - Observación

## ⚙️ Configuración de Alertas

Los criterios por defecto para detección de rezago son:
- **Promedio mínimo**: 6.0
- **Calificación mínima**: 6.0
- **Máximo de materias reprobadas**: 2

Se puede ajustar en la tabla `configuracion_alertas`.

## 🔐 Seguridad

- Contraseñas encriptadas con bcrypt
- Tokens JWT para sesiones
- Validación de permisos por rol
- Solo el estudiante y sus tutores pueden ver sus calificaciones

## 📝 Próximos Pasos

1. ✅ Implementar el backend con Express.js
2. ✅ Crear las rutas de autenticación
3. ✅ Desarrollar el sistema de detección de rezago
4. 🔄 Integrar servicio de notificaciones (WhatsApp/Email)
5. 🔄 Crear el frontend interactivo
6. 🔄 Implementar dashboard administrativo

## 🌐 API Endpoints

### Autenticación
- `POST /api/auth/login` - Login de estudiante
- `GET /api/auth/verify` - Verificar token JWT
- `POST /api/auth/logout` - Logout

### Estudiantes
- `GET /api/estudiantes/profile` - Perfil del estudiante autenticado
- `GET /api/estudiantes/:id/calificaciones` - Obtener calificaciones
- `GET /api/estudiantes/:id/resumen` - Resumen académico completo
- `GET /api/estudiantes/:id/riesgo` - Verificar riesgo académico
- `GET /api/estudiantes/:id/tutores` - Obtener tutores
- `GET /api/estudiantes` - Listar todos (admin)
- `POST /api/estudiantes` - Crear estudiante (admin)

Ver documentación completa en `docs/API_DOCUMENTATION.md`

## 📞 Estructura del Proyecto

```
proyecto/
├── database/
│   ├── escuela.db          # Base de datos SQLite
│   └── init_db.sql         # Script de inicialización
├── scripts/
│   └── initDatabase.js     # Script de Node.js para inicializar
├── src/
│   ├── config/             # Configuraciones
│   ├── controllers/        # Controladores
│   ├── middleware/         # Middlewares
│   ├── models/             # Modelos de datos
│   ├── routes/             # Rutas de API
│   └── services/           # Servicios (notificaciones, etc.)
├── public/
│   ├── css/               # Estilos
│   ├── js/                # JavaScript del frontend
│   └── index.html         # Página principal
├── server.js              # Servidor Express
└── package.json           # Dependencias
```

---

Desarrollado para la Escuela Secundaria Técnica No. 56