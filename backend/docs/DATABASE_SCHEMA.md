# Esquema de Base de Datos
## Sistema de Seguimiento Académico

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DIAGRAMA DE BASE DE DATOS                             │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│    ESTUDIANTES       │         │      TUTORES         │
├──────────────────────┤         ├──────────────────────┤
│ • id (PK)            │         │ • id (PK)            │
│ • curp (UNIQUE)      │         │ • nombre             │
│ • nombre             │         │ • apellido_paterno   │
│ • apellido_paterno   │         │ • apellido_materno   │
│ • apellido_materno   │         │ • telefono           │
│ • grado              │         │ • email              │
│ • grupo              │         │ • created_at         │
│ • password_hash      │         └──────────────────────┘
│ • created_at         │                    │
└──────────────────────┘                    │
         │                                   │
         │                                   │
         │         ┌──────────────────────┐  │
         └────────▶│  ESTUDIANTE_TUTOR   │◀─┘
                   ├──────────────────────┤
                   │ • id (PK)            │
                   │ • estudiante_id (FK) │
                   │ • tutor_id (FK)      │
                   │ • relacion           │
                   └──────────────────────┘
         │
         │
         │         ┌──────────────────────┐
         └────────▶│   CALIFICACIONES    │
                   ├──────────────────────┤         ┌──────────────────────┐
                   │ • id (PK)            │         │      MATERIAS        │
                   │ • estudiante_id (FK) │────┐    ├──────────────────────┤
                   │ • materia_id (FK)    │◀───┼───▶│ • id (PK)            │
                   │ • periodo_id (FK)    │    │    │ • nombre             │
                   │ • calificacion       │    │    │ • clave (UNIQUE)     │
                   │ • fecha_registro     │    │    └──────────────────────┘
                   └──────────────────────┘    │
                            │                  │
                            │                  │    ┌──────────────────────┐
                            │                  │    │      PERIODOS        │
                            │                  └───▶├──────────────────────┤
                            │                       │ • id (PK)            │
                            └──────────────────────▶│ • nombre             │
                                                    │ • numero             │
                                                    │ • fecha_inicio       │
                                                    │ • fecha_fin          │
                                                    │ • ciclo_escolar      │
                                                    └──────────────────────┘

┌──────────────────────┐
│   NOTIFICACIONES     │
├──────────────────────┤         ┌──────────────────────────┐
│ • id (PK)            │         │  CONFIGURACION_ALERTAS   │
│ • estudiante_id (FK) │         ├──────────────────────────┤
│ • tutor_id (FK)      │         │ • id (PK)                │
│ • tipo               │         │ • promedio_minimo        │
│ • mensaje            │         │ • calificacion_minima    │
│ • estado             │         │ • materias_reprobadas_   │
│ • fecha_envio        │         │   maximo                 │
│ • created_at         │         └──────────────────────────┘
└──────────────────────┘
```

## Descripción de Tablas

### 1. **estudiantes**
Contiene la información personal y académica de cada estudiante.

**Campos clave:**
- `curp`: Identificador único del estudiante (usado para login)
- `password_hash`: Contraseña encriptada con bcrypt
- `grado`: Nivel educativo (1, 2 o 3)
- `grupo`: Sección del grupo (A, B, C, etc.)

### 2. **tutores**
Información de contacto de los padres o tutores legales.

**Campos clave:**
- `telefono`: Usado para enviar notificaciones por WhatsApp
- `email`: Usado para enviar notificaciones por correo electrónico

### 3. **estudiante_tutor** (Tabla de relación)
Relaciona estudiantes con sus tutores. Un estudiante puede tener múltiples tutores.

**Campos clave:**
- `relacion`: Tipo de relación ('Padre', 'Madre', 'Tutor Legal', etc.)

### 4. **materias**
Catálogo de materias del plan de estudios.

**Materias incluidas:**
- Español, Matemáticas, Ciencias (Biología, Física, Química)
- Historia, Geografía, Formación Cívica y Ética
- Inglés, Educación Física, Artes, Tecnología, Informática

### 5. **periodos**
Define los periodos de evaluación (trimestres).

**Campos clave:**
- `numero`: Orden del periodo (1, 2, 3)
- `ciclo_escolar`: Año escolar (ej: "2024-2025")

### 6. **calificaciones**
Registra las calificaciones de cada estudiante por materia y periodo.

**Campos clave:**
- `calificacion`: Valor de 0.0 a 10.0
- Restricción: Una sola calificación por estudiante/materia/periodo

### 7. **notificaciones**
Historial de todas las notificaciones enviadas a los tutores.

**Campos clave:**
- `tipo`: 'whatsapp' o 'email'
- `estado`: 'pendiente', 'enviado', 'fallido'
- `mensaje`: Contenido de la notificación

### 8. **configuracion_alertas**
Define los criterios para activar alertas de rezago académico.

**Valores por defecto:**
- Promedio mínimo: 6.0
- Calificación mínima: 6.0
- Máximo de materias reprobadas: 2

## Índices de Rendimiento

Para optimizar las consultas frecuentes:

- `idx_estudiantes_curp`: Búsqueda rápida por CURP
- `idx_calificaciones_estudiante`: Consulta de calificaciones por estudiante
- `idx_calificaciones_periodo`: Filtrado por periodo
- `idx_estudiante_tutor`: Búsqueda de relaciones estudiante-tutor

## Reglas de Negocio

1. **Detección de Rezago:**
   - Promedio < 6.0 → Alerta
   - Más de 2 materias reprobadas → Alerta
   - Cualquier calificación < 6.0 → Se registra

2. **Notificaciones:**
   - Se envían a TODOS los tutores del estudiante
   - Prioridad: WhatsApp > Email
   - Se registra cada intento de envío

3. **Seguridad:**
   - Solo el estudiante puede ver sus propias calificaciones
   - Los tutores solo ven a sus estudiantes asignados
   - Contraseñas encriptadas con bcrypt (10 rounds)

4. **Integridad:**
   - No se puede eliminar un tutor si tiene estudiantes asignados
   - No se puede eliminar una materia si tiene calificaciones registradas
   - Cascada en eliminación de estudiantes (calificaciones, relaciones)