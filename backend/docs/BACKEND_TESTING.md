# 🚀 Guía Rápida - Backend API

## 📦 Instalación

### 1. Instalar dependencias adicionales
```bash
npm install
```

Esto instalará la nueva dependencia `axios` para testing.

### 2. Asegúrate de que la base de datos está inicializada
Si aún no lo has hecho:
```bash
npm run init-db
```

## 🎯 Iniciar el Servidor

```bash
npm start
```

Deberías ver algo como esto:
```
═══════════════════════════════════════════════════════════════
  🎓 Sistema de Seguimiento Académico - API
═══════════════════════════════════════════════════════════════
  ✅ Servidor corriendo en: http://localhost:3000
  📚 Documentación: http://localhost:3000/
  🏥 Health check: http://localhost:3000/api/health
  🔧 Entorno: development
═══════════════════════════════════════════════════════════════
```

## 🧪 Probar la API

### Opción 1: Script Automático de Pruebas

En una **nueva terminal** (deja el servidor corriendo):

```bash
npm run test-api
```

Este script ejecutará 10 tests automáticos:
1. ✅ Health Check
2. ✅ Login de estudiante
3. ✅ Verificar token
4. ✅ Obtener perfil
5. ✅ Obtener calificaciones
6. ✅ Obtener resumen académico
7. ✅ Verificar riesgo académico
8. ✅ Obtener tutores
9. ✅ Obtener todos los estudiantes
10. ✅ Intentar acceso sin token (debe fallar)

### Opción 2: Pruebas Manuales con cURL

#### Health Check
```bash
curl http://localhost:3000/api/health
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"curp":"GAPL050815HDFRRS09","password":"password123"}'
```

Guarda el token que te devuelve.

#### Obtener Calificaciones
```bash
curl http://localhost:3000/api/estudiantes/1/calificaciones \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

#### Verificar Riesgo Académico
```bash
curl http://localhost:3000/api/estudiantes/1/riesgo \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### Opción 3: Usar el Navegador

Abre tu navegador y ve a:
```
http://localhost:3000
```

Verás la documentación de la API con todos los endpoints disponibles.

## 📝 Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token
- `POST /api/auth/logout` - Logout

### Estudiantes
- `GET /api/estudiantes/profile` - Perfil del estudiante autenticado
- `GET /api/estudiantes/:id/calificaciones` - Calificaciones
- `GET /api/estudiantes/:id/resumen` - Resumen académico completo
- `GET /api/estudiantes/:id/riesgo` - Verificar riesgo académico
- `GET /api/estudiantes/:id/tutores` - Obtener tutores
- `GET /api/estudiantes` - Listar todos los estudiantes
- `POST /api/estudiantes` - Crear estudiante

## 🔐 Datos de Prueba

### Estudiantes disponibles:

| CURP | Nombre | Contraseña | Estado |
|------|--------|------------|--------|
| GAPL050815HDFRRS09 | Luis García | password123 | 2 reprobadas |
| MAHS060512MDFRRN08 | Sofia Martínez | password123 | Excelente |
| ROPJ070320HDFRRS07 | Juan Rodríguez | password123 | 5 reprobadas (RIESGO) |
| LOGM051128MDFRRR06 | María López | password123 | Buen desempeño |
| HERL060815HDFRRS05 | Pedro Hernández | password123 | 1 reprobada |

## 📊 Ejemplo de Flujo Completo

### 1. Login
```javascript
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    curp: 'GAPL050815HDFRRS09',
    password: 'password123'
  })
});

const { data } = await response.json();
const token = data.token;
```

### 2. Obtener Calificaciones
```javascript
const response = await fetch('http://localhost:3000/api/estudiantes/1/calificaciones', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { data } = await response.json();
console.log('Promedio:', data.promedio);
console.log('Materias reprobadas:', data.materiasReprobadas);
```

### 3. Verificar si está en Riesgo
```javascript
const response = await fetch('http://localhost:3000/api/estudiantes/1/riesgo', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { data } = await response.json();
if (data.enRiesgo.status) {
  console.log('⚠️ ALERTA: Estudiante en riesgo');
  console.log('Razones:', data.enRiesgo.razones);
}
```

## 🔧 Desarrollo

Para desarrollo con auto-reload:
```bash
npm run dev
```

Esto reiniciará el servidor automáticamente cuando hagas cambios en el código.

## 📚 Documentación Completa

Para ver la documentación completa de la API con todos los ejemplos:
```bash
cat docs/API_DOCUMENTATION.md
```

O simplemente ve a:
```
http://localhost:3000/
```

## ⚡ Próximos Pasos

Ahora que el backend está funcionando, podemos continuar con:

1. **Frontend** - Crear la interfaz de usuario con HTML/CSS/JavaScript
2. **Sistema de Notificaciones** - Implementar WhatsApp y Email
3. **Dashboard** - Panel administrativo
4. **Reportes** - Generar reportes en PDF

¿Con cuál quieres continuar?