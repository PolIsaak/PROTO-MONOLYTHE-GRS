const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Crear el directorio de la base de datos si no existe
const dbDir = path.join(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'escuela.db');

// Eliminar la base de datos anterior si existe (para desarrollo)
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('Base de datos anterior eliminada.');
}

// Crear nueva conexión
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al crear la base de datos:', err.message);
        process.exit(1);
    }
    console.log('Conectado a la base de datos SQLite.');
});

// Leer el archivo SQL
const sqlPath = path.join(dbDir, 'init_db.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

// Ejecutar el script SQL
db.exec(sql, (err) => {
    if (err) {
        console.error('Error al ejecutar el script SQL:', err.message);
        process.exit(1);
    }
    
    console.log('✅ Base de datos inicializada correctamente.');
    
    // Verificar los datos insertados
    db.all('SELECT COUNT(*) as count FROM estudiantes', [], (err, rows) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log(`📚 Estudiantes registrados: ${rows[0].count}`);
        }
    });
    
    db.all('SELECT COUNT(*) as count FROM tutores', [], (err, rows) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log(`👨‍👩‍👧 Tutores registrados: ${rows[0].count}`);
        }
    });
    
    db.all('SELECT COUNT(*) as count FROM calificaciones', [], (err, rows) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log(`📊 Calificaciones registradas: ${rows[0].count}`);
        }
    });
    
    db.all('SELECT COUNT(*) as count FROM materias', [], (err, rows) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log(`📖 Materias registradas: ${rows[0].count}`);
        }
        
        // Cerrar la conexión
        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('\n🎉 Base de datos lista para usar!');
        });
    });
});