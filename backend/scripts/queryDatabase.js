const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/escuela.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
        process.exit(1);
    }
    console.log('📚 Consultando Base de Datos\n');
});

// Función para mostrar estudiantes
function mostrarEstudiantes() {
    return new Promise((resolve, reject) => {
        console.log('👨‍🎓 ESTUDIANTES REGISTRADOS\n' + '='.repeat(80));
        db.all(`
            SELECT id, curp, nombre, apellido_paterno, apellido_materno, grado, grupo
            FROM estudiantes
            ORDER BY grado, grupo, apellido_paterno
        `, [], (err, rows) => {
            if (err) reject(err);
            rows.forEach(row => {
                console.log(`[${row.id}] ${row.nombre} ${row.apellido_paterno} ${row.apellido_materno}`);
                console.log(`    CURP: ${row.curp} | Grado: ${row.grado}° "${row.grupo}"`);
            });
            console.log('');
            resolve();
        });
    });
}

// Función para mostrar calificaciones de un estudiante
function mostrarCalificaciones(estudianteId) {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT nombre, apellido_paterno, apellido_materno, grado, grupo
            FROM estudiantes WHERE id = ?
        `, [estudianteId], (err, estudiante) => {
            if (err) reject(err);
            
            console.log(`\n📊 CALIFICACIONES: ${estudiante.nombre} ${estudiante.apellido_paterno}`);
            console.log(`    ${estudiante.grado}° "${estudiante.grupo}"\n` + '-'.repeat(80));
            
            db.all(`
                SELECT m.nombre as materia, c.calificacion, p.nombre as periodo
                FROM calificaciones c
                JOIN materias m ON c.materia_id = m.id
                JOIN periodos p ON c.periodo_id = p.id
                WHERE c.estudiante_id = ?
                ORDER BY p.numero, m.nombre
            `, [estudianteId], (err, rows) => {
                if (err) reject(err);
                
                let suma = 0;
                let reprobadas = 0;
                
                rows.forEach(row => {
                    const estado = row.calificacion < 6 ? '❌ REPROBADA' : '✅';
                    console.log(`${row.materia.padEnd(30)} ${row.calificacion.toFixed(1).padStart(4)}  ${estado}`);
                    suma += row.calificacion;
                    if (row.calificacion < 6) reprobadas++;
                });
                
                const promedio = rows.length > 0 ? (suma / rows.length).toFixed(2) : 0;
                console.log('-'.repeat(80));
                console.log(`PROMEDIO: ${promedio} | Materias reprobadas: ${reprobadas}`);
                
                if (reprobadas > 2 || promedio < 6.0) {
                    console.log('⚠️  ALERTA: Estudiante en riesgo académico');
                }
                
                console.log('');
                resolve();
            });
        });
    });
}

// Función para mostrar tutores y sus estudiantes
function mostrarTutores() {
    return new Promise((resolve, reject) => {
        console.log('\n👨‍👩‍👧 TUTORES Y SUS ESTUDIANTES\n' + '='.repeat(80));
        db.all(`
            SELECT t.id, t.nombre, t.apellido_paterno, t.telefono, t.email
            FROM tutores t
            ORDER BY t.apellido_paterno
        `, [], (err, tutores) => {
            if (err) reject(err);
            
            let promises = tutores.map(tutor => {
                return new Promise((res) => {
                    console.log(`\n[${tutor.id}] ${tutor.nombre} ${tutor.apellido_paterno}`);
                    console.log(`    📱 ${tutor.telefono} | 📧 ${tutor.email}`);
                    
                    db.all(`
                        SELECT e.nombre, e.apellido_paterno, e.grado, e.grupo, et.relacion
                        FROM estudiantes e
                        JOIN estudiante_tutor et ON e.id = et.estudiante_id
                        WHERE et.tutor_id = ?
                    `, [tutor.id], (err, estudiantes) => {
                        if (err) console.error(err);
                        estudiantes.forEach(est => {
                            console.log(`    └─ ${est.nombre} ${est.apellido_paterno} (${est.relacion}) - ${est.grado}° "${est.grupo}"`);
                        });
                        res();
                    });
                });
            });
            
            Promise.all(promises).then(resolve);
        });
    });
}

// Función para mostrar estadísticas generales
function mostrarEstadisticas() {
    return new Promise((resolve, reject) => {
        console.log('\n📈 ESTADÍSTICAS GENERALES\n' + '='.repeat(80));
        
        // Promedio general por grado
        db.all(`
            SELECT e.grado, AVG(c.calificacion) as promedio
            FROM estudiantes e
            JOIN calificaciones c ON e.id = c.estudiante_id
            GROUP BY e.grado
            ORDER BY e.grado
        `, [], (err, promedios) => {
            if (err) reject(err);
            console.log('\nPromedio por Grado:');
            promedios.forEach(p => {
                console.log(`  ${p.grado}° grado: ${p.promedio.toFixed(2)}`);
            });
            
            // Estudiantes en riesgo
            db.all(`
                SELECT e.id, e.nombre, e.apellido_paterno, 
                       COUNT(CASE WHEN c.calificacion < 6 THEN 1 END) as reprobadas,
                       AVG(c.calificacion) as promedio
                FROM estudiantes e
                JOIN calificaciones c ON e.id = c.estudiante_id
                GROUP BY e.id
                HAVING reprobadas > 2 OR promedio < 6.0
            `, [], (err, enRiesgo) => {
                if (err) reject(err);
                console.log(`\n⚠️  Estudiantes en Riesgo Académico: ${enRiesgo.length}`);
                enRiesgo.forEach(e => {
                    console.log(`  • ${e.nombre} ${e.apellido_paterno}: ${e.reprobadas} materias reprobadas, promedio ${e.promedio.toFixed(2)}`);
                });
                console.log('');
                resolve();
            });
        });
    });
}

// Ejecutar todas las consultas
async function main() {
    try {
        await mostrarEstudiantes();
        await mostrarCalificaciones(1); // Luis García
        await mostrarCalificaciones(3); // Juan Rodríguez (más calificaciones bajas)
        await mostrarTutores();
        await mostrarEstadisticas();
        
        db.close();
        console.log('\n✅ Consulta completada\n');
    } catch (error) {
        console.error('Error:', error);
        db.close();
    }
}

main();