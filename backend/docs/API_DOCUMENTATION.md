# 📚 API Documentation - Sistema de Seguimiento Académico

## Base URL
```
http://localhost:3000/api
```

## Autenticación

Todas las rutas protegidas requieren un token JWT en el header:
```
Authorization: Bearer <token>
```

---

## 🔐 Autenticación

### Login

**POST** `/auth/login`

Autentica a un estudiante y retorna un token JWT.

**Body:**
```json
{
  "curp": "GAPL050815HDFRRS09",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "estudiante": {
      "id": 1,
      "curp": "GAPL050815HDFRRS09",
      "nombre": "Luis",
      "apellido_paterno": "García",
      "apellido_materno": "Pérez",
      "grado": 2,
      "grupo": "A"
    }
  }
}
```

**Ejemplo con cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "curp": "GAPL050815HDFRRS09",
    "password": "password123"
  }'
```

**Ejemplo con JavaScript (fetch):**
```javascript
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    curp: 'GAPL050815HDFRRS09',
    password: 'password123'
  })
});

const data = await response.json();
console.log(data);
```

---

### Verificar Token

**GET** `/auth/verify`

Verifica si el token JWT es válido.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "estudiante": {
      "id": 1,
      "curp": "GAPL050815HDFRRS09",
      "nombre": "Luis",
      "apellido_paterno": "García",
      "apellido_materno": "Pérez",
      "grado": 2,
      "grupo": "A"
    }
  }
}
```

---

## 👨‍🎓 Estudiantes

### Obtener Perfil

**GET** `/estudiantes/profile`

Obtiene el perfil del estudiante autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "estudiante": {
      "id": 1,
      "curp": "GAPL050815HDFRRS09",
      "nombre": "Luis",
      "apellido_paterno": "García",
      "apellido_materno": "Pérez",
      "grado": 2,
      "grupo": "A",
      "created_at": "2024-10-23T12:00:00.000Z"
    }
  }
}
```

---

### Obtener Calificaciones

**GET** `/estudiantes/:id/calificaciones`

Obtiene las calificaciones de un estudiante.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Params (opcional):**
- `periodo` - ID del periodo (1, 2, 3)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "calificaciones": [
      {
        "id": 1,
        "calificacion": 7.5,
        "fecha_registro": "2024-10-23T12:00:00.000Z",
        "materia": "Español",
        "materia_clave": "ESP",
        "periodo": "Primer Trimestre",
        "periodo_numero": 1
      },
      {
        "id": 2,
        "calificacion": 5.0,
        "fecha_registro": "2024-10-23T12:00:00.000Z",
        "materia": "Matemáticas",
        "materia_clave": "MAT",
        "periodo": "Primer Trimestre",
        "periodo_numero": 1
      }
    ],
    "promedio": 6.8,
    "materiasReprobadas": 2,
    "periodo": 1
  }
}
```

**Ejemplo con cURL:**
```bash
curl -X GET "http://localhost:3000/api/estudiantes/1/calificaciones?periodo=1" \
  -H "Authorization: Bearer <token>"
```

---

### Obtener Resumen Académico

**GET** `/estudiantes/:id/resumen`

Obtiene un resumen completo del desempeño académico del estudiante.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Params (opcional):**
- `periodo` - ID del periodo (1, 2, 3)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "estudiante": {
      "id": 1,
      "curp": "GAPL050815HDFRRS09",
      "nombre": "Luis",
      "apellido_paterno": "García",
      "apellido_materno": "Pérez",
      "grado": 2,
      "grupo": "A"
    },
    "calificaciones": [...],
    "promedio": 6.8,
    "materiasReprobadas": 2,
    "tutores": [
      {
        "id": 1,
        "nombre": "María",
        "apellido_paterno": "García",
        "apellido_materno": "López",
        "telefono": "6181234567",
        "email": "maria.garcia@email.com",
        "relacion": "Madre"
      }
    ],
    "enRiesgo": {
      "status": false,
      "razones": []
    }
  }
}
```

---

### Verificar Riesgo Académico

**GET** `/estudiantes/:id/riesgo`

Verifica si el estudiante está en riesgo académico.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Params (opcional):**
- `periodo` - ID del periodo (1, 2, 3)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "estudiante": {
      "id": 3,
      "nombre": "Juan Rodríguez",
      "grado": 1,
      "grupo": "B"
    },
    "promedio": 6.05,
    "materiasReprobadas": 5,
    "enRiesgo": {
      "status": true,
      "razones": [
        "Promedio bajo: 6.05",
        "5 materias reprobadas (máximo: 2)"
      ]
    },
    "criterios": {
      "promedioMinimo": 6.0,
      "materiasReprobadasMaximo": 2
    }
  }
}
```

---

### Obtener Tutores

**GET** `/estudiantes/:id/tutores`

Obtiene la lista de tutores del estudiante.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tutores": [
      {
        "id": 1,
        "nombre": "María",
        "apellido_paterno": "García",
        "apellido_materno": "López",
        "telefono": "6181234567",
        "email": "maria.garcia@email.com",
        "relacion": "Madre"
      },
      {
        "id": 2,
        "nombre": "Roberto",
        "apellido_paterno": "Martínez",
        "apellido_materno": "Hernández",
        "telefono": "6181234568",
        "email": "roberto.martinez@email.com",
        "relacion": "Padre"
      }
    ]
  }
}
```

---

### Obtener Todos los Estudiantes

**GET** `/estudiantes`

Obtiene la lista completa de estudiantes (admin).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "estudiantes": [
      {
        "id": 1,
        "curp": "GAPL050815HDFRRS09",
        "nombre": "Luis",
        "apellido_paterno": "García",
        "apellido_materno": "Pérez",
        "grado": 2,
        "grupo": "A"
      }
    ]
  }
}
```

---

### Crear Estudiante

**POST** `/estudiantes`

Crea un nuevo estudiante (admin).

**Body:**
```json
{
  "curp": "TEST123456HDFRRS09",
  "nombre": "Pedro",
  "apellido_paterno": "Sánchez",
  "apellido_materno": "López",
  "grado": 1,
  "grupo": "A",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Estudiante creado exitosamente",
  "data": {
    "estudiante": {
      "id": 6,
      "curp": "TEST123456HDFRRS09",
      "nombre": "Pedro",
      "apellido_paterno": "Sánchez",
      "apellido_materno": "López",
      "grado": 1,
      "grupo": "A"
    }
  }
}
```

---

## 🔧 Utilidades

### Health Check

**GET** `/health`

Verifica el estado de la API.

**Response (200):**
```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "timestamp": "2024-10-23T12:00:00.000Z"
}
```

---

## ⚠️ Códigos de Error

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Errores de validación",
  "errors": [
    {
      "field": "curp",
      "message": "El CURP es requerido"
    }
  ]
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "CURP o contraseña incorrectos"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "No tienes permiso para acceder a estos datos"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Estudiante no encontrado"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Error en el servidor",
  "error": "Error details..."
}
```

---

## 📝 Notas

- Todos los endpoints que requieren autenticación deben incluir el token JWT en el header `Authorization: Bearer <token>`
- Los tokens JWT expiran en 24 horas por defecto
- Las contraseñas se almacenan encriptadas con bcrypt
- Un estudiante solo puede acceder a sus propios datos
- Un tutor puede acceder a los datos de sus estudiantes asignados