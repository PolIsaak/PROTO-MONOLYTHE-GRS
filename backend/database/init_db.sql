-- Base de datos para el Sistema de Seguimiento Académico
-- Escuela Secundaria Técnica No. 56

-- Tabla de Tutores
CREATE TABLE IF NOT EXISTS tutores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    telefono VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Estudiantes
CREATE TABLE IF NOT EXISTS estudiantes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    curp VARCHAR(18) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    grado INTEGER NOT NULL CHECK(grado BETWEEN 1 AND 3),
    grupo VARCHAR(1) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Relación Estudiante-Tutor (un estudiante puede tener varios tutores)
CREATE TABLE IF NOT EXISTS estudiante_tutor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    estudiante_id INTEGER NOT NULL,
    tutor_id INTEGER NOT NULL,
    relacion VARCHAR(50) NOT NULL, -- 'Padre', 'Madre', 'Tutor Legal', etc.
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
    FOREIGN KEY (tutor_id) REFERENCES tutores(id) ON DELETE CASCADE,
    UNIQUE(estudiante_id, tutor_id)
);

-- Tabla de Materias
CREATE TABLE IF NOT EXISTS materias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL,
    clave VARCHAR(10) UNIQUE NOT NULL
);

-- Tabla de Periodos (trimestres/bimestres)
CREATE TABLE IF NOT EXISTS periodos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(50) NOT NULL,
    numero INTEGER NOT NULL CHECK(numero BETWEEN 1 AND 5),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    ciclo_escolar VARCHAR(20) NOT NULL
);

-- Tabla de Calificaciones
CREATE TABLE IF NOT EXISTS calificaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    estudiante_id INTEGER NOT NULL,
    materia_id INTEGER NOT NULL,
    periodo_id INTEGER NOT NULL,
    calificacion DECIMAL(4,2) CHECK(calificacion BETWEEN 0 AND 10),
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE,
    FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE CASCADE,
    UNIQUE(estudiante_id, materia_id, periodo_id)
);

-- Tabla de Notificaciones enviadas
CREATE TABLE IF NOT EXISTS notificaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    estudiante_id INTEGER NOT NULL,
    tutor_id INTEGER NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK(tipo IN ('whatsapp', 'email')),
    mensaje TEXT NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK(estado IN ('pendiente', 'enviado', 'fallido')),
    fecha_envio DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
    FOREIGN KEY (tutor_id) REFERENCES tutores(id) ON DELETE CASCADE
);

-- Tabla de Configuración de Alertas
CREATE TABLE IF NOT EXISTS configuracion_alertas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    promedio_minimo DECIMAL(4,2) DEFAULT 6.0,
    calificacion_minima DECIMAL(4,2) DEFAULT 6.0,
    materias_reprobadas_maximo INTEGER DEFAULT 2
);

-- Insertar configuración por defecto
INSERT INTO configuracion_alertas (promedio_minimo, calificacion_minima, materias_reprobadas_maximo) 
VALUES (6.0, 6.0, 2);

-- Insertar materias estándar de secundaria
INSERT INTO materias (nombre, clave) VALUES
('Español', 'ESP'),
('Matemáticas', 'MAT'),
('Ciencias (Biología)', 'BIO'),
('Ciencias (Física)', 'FIS'),
('Ciencias (Química)', 'QUI'),
('Historia', 'HIS'),
('Geografía', 'GEO'),
('Formación Cívica y Ética', 'FCE'),
('Inglés', 'ING'),
('Educación Física', 'EDF'),
('Artes', 'ART'),
('Tecnología', 'TEC'),
('Informática', 'INF');

-- Insertar periodos del ciclo escolar 2024-2025
INSERT INTO periodos (nombre, numero, fecha_inicio, fecha_fin, ciclo_escolar) VALUES
('Primer Trimestre', 1, '2024-08-26', '2024-11-29', '2024-2025'),
('Segundo Trimestre', 2, '2024-12-02', '2025-03-21', '2024-2025'),
('Tercer Trimestre', 3, '2025-03-24', '2025-07-18', '2024-2025');

-- Insertar tutores de ejemplo
INSERT INTO tutores (nombre, apellido_paterno, apellido_materno, telefono, email) VALUES
('María', 'García', 'López', '6181234567', 'maria.garcia@email.com'),
('Roberto', 'Martínez', 'Hernández', '6181234568', 'roberto.martinez@email.com'),
('Ana', 'Rodríguez', 'Pérez', '6181234569', 'ana.rodriguez@email.com'),
('Carlos', 'López', 'González', '6181234570', 'carlos.lopez@email.com'),
('Laura', 'Hernández', 'Ramírez', '6181234571', 'laura.hernandez@email.com');

-- Insertar estudiantes de ejemplo (password: 'password123' - hash simple para el ejemplo)
-- En producción usaremos bcrypt
INSERT INTO estudiantes (curp, nombre, apellido_paterno, apellido_materno, grado, grupo, password_hash) VALUES
('GAPL050815HDFRRS09', 'Luis', 'García', 'Pérez', 2, 'A', '$2b$10$XqKn8qFZKz0YxXqKn8qFZO'),
('MAHS060512MDFRRN08', 'Sofia', 'Martínez', 'Hernández', 2, 'A', '$2b$10$XqKn8qFZKz0YxXqKn8qFZO'),
('ROPJ070320HDFRRS07', 'Juan', 'Rodríguez', 'Pérez', 1, 'B', '$2b$10$XqKn8qFZKz0YxXqKn8qFZO'),
('LOGM051128MDFRRR06', 'María', 'López', 'García', 2, 'B', '$2b$10$XqKn8qFZKz0YxXqKn8qFZO'),
('HERL060815HDFRRS05', 'Pedro', 'Hernández', 'Ramírez', 3, 'A', '$2b$10$XqKn8qFZKz0YxXqKn8qFZO');

-- Relacionar estudiantes con tutores
INSERT INTO estudiante_tutor (estudiante_id, tutor_id, relacion) VALUES
(1, 1, 'Madre'),
(1, 2, 'Padre'),
(2, 2, 'Padre'),
(3, 3, 'Madre'),
(4, 4, 'Padre'),
(5, 5, 'Madre');

-- Insertar calificaciones del primer trimestre
-- Estudiante 1 (Luis) - Desempeño irregular (algunas materias reprobadas)
INSERT INTO calificaciones (estudiante_id, materia_id, periodo_id, calificacion) VALUES
(1, 1, 1, 7.5),  -- Español
(1, 2, 1, 5.0),  -- Matemáticas (REPROBADA)
(1, 3, 1, 6.5),  -- Biología
(1, 6, 1, 8.0),  -- Historia
(1, 7, 1, 7.0),  -- Geografía
(1, 8, 1, 5.5),  -- FCE (REPROBADA)
(1, 9, 1, 6.0),  -- Inglés
(1, 10, 1, 8.5), -- Educación Física
(1, 11, 1, 7.5), -- Artes
(1, 13, 1, 6.5); -- Informática

-- Estudiante 2 (Sofia) - Buen desempeño
INSERT INTO calificaciones (estudiante_id, materia_id, periodo_id, calificacion) VALUES
(2, 1, 1, 9.0),
(2, 2, 1, 8.5),
(2, 3, 1, 9.5),
(2, 6, 1, 8.0),
(2, 7, 1, 8.5),
(2, 8, 1, 9.0),
(2, 9, 1, 9.5),
(2, 10, 1, 9.0),
(2, 11, 1, 8.5),
(2, 13, 1, 9.0);

-- Estudiante 3 (Juan) - Desempeño bajo (múltiples materias reprobadas)
INSERT INTO calificaciones (estudiante_id, materia_id, periodo_id, calificacion) VALUES
(3, 1, 1, 5.5),  -- REPROBADA
(3, 2, 1, 5.0),  -- REPROBADA
(3, 3, 1, 6.0),
(3, 6, 1, 5.5),  -- REPROBADA
(3, 7, 1, 6.5),
(3, 8, 1, 7.0),
(3, 9, 1, 5.0),  -- REPROBADA
(3, 10, 1, 8.0),
(3, 11, 1, 6.5),
(3, 13, 1, 5.5); -- REPROBADA

-- Estudiante 4 (María) - Buen desempeño
INSERT INTO calificaciones (estudiante_id, materia_id, periodo_id, calificacion) VALUES
(4, 1, 1, 8.5),
(4, 2, 1, 8.0),
(4, 3, 1, 8.5),
(4, 6, 1, 9.0),
(4, 7, 1, 8.0),
(4, 8, 1, 8.5),
(4, 9, 1, 8.0),
(4, 10, 1, 9.0),
(4, 11, 1, 8.5),
(4, 13, 1, 8.5);

-- Estudiante 5 (Pedro) - Desempeño medio-bajo
INSERT INTO calificaciones (estudiante_id, materia_id, periodo_id, calificacion) VALUES
(5, 1, 1, 6.5),
(5, 2, 1, 6.0),
(5, 4, 1, 5.5),  -- Física (REPROBADA)
(5, 6, 1, 7.0),
(5, 7, 1, 6.5),
(5, 8, 1, 7.5),
(5, 9, 1, 6.0),
(5, 10, 1, 8.0),
(5, 11, 1, 7.0),
(5, 13, 1, 6.5);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_estudiantes_curp ON estudiantes(curp);
CREATE INDEX idx_calificaciones_estudiante ON calificaciones(estudiante_id);
CREATE INDEX idx_calificaciones_periodo ON calificaciones(periodo_id);
CREATE INDEX idx_estudiante_tutor ON estudiante_tutor(estudiante_id, tutor_id);