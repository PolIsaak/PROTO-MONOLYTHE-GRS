const { dbAsync } = require('../config/database');

class Tutor {
    /**
     * Buscar tutor por ID
     */
    static async findById(id) {
        const sql = `
            SELECT id, nombre, apellido_paterno, apellido_materno, 
                   telefono, email, created_at
            FROM tutores
            WHERE id = ?
        `;
        return await dbAsync.get(sql, [id]);
    }
    
    /**
     * Buscar tutor por email
     */
    static async findByEmail(email) {
        const sql = `
            SELECT id, nombre, apellido_paterno, apellido_materno, 
                   telefono, email, created_at
            FROM tutores
            WHERE email = ?
        `;
        return await dbAsync.get(sql, [email]);
    }
    
    /**
     * Obtener estudiantes asignados a un tutor
     */
    static async getEstudiantes(tutorId) {
        const sql = `
            SELECT 
                e.id,
                e.curp,
                e.nombre,
                e.apellido_paterno,
                e.apellido_materno,
                e.grado,
                e.grupo,
                et.relacion
            FROM estudiantes e
            JOIN estudiante_tutor et ON e.id = et.estudiante_id
            WHERE et.tutor_id = ?
            ORDER BY e.grado, e.grupo, e.apellido_paterno
        `;
        
        return await dbAsync.all(sql, [tutorId]);
    }
    
    /**
     * Obtener resumen de estudiantes en riesgo para un tutor
     */
    static async getEstudiantesEnRiesgo(tutorId, config) {
        const sql = `
            SELECT 
                e.id,
                e.curp,
                e.nombre,
                e.apellido_paterno,
                e.apellido_materno,
                e.grado,
                e.grupo,
                AVG(c.calificacion) as promedio,
                COUNT(CASE WHEN c.calificacion < 6.0 THEN 1 END) as materias_reprobadas
            FROM estudiantes e
            JOIN estudiante_tutor et ON e.id = et.estudiante_id
            JOIN calificaciones c ON e.id = c.estudiante_id
            WHERE et.tutor_id = ?
            GROUP BY e.id
            HAVING promedio < ? OR materias_reprobadas > ?
            ORDER BY materias_reprobadas DESC, promedio ASC
        `;
        
        return await dbAsync.all(sql, [
            tutorId, 
            config.alertas.promedioMinimo,
            config.alertas.materiasReprobadasMaximo
        ]);
    }
    
    /**
     * Crear nuevo tutor
     */
    static async create(tutorData) {
        const { nombre, apellido_paterno, apellido_materno, telefono, email } = tutorData;
        
        const sql = `
            INSERT INTO tutores (nombre, apellido_paterno, apellido_materno, telefono, email)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const result = await dbAsync.run(sql, [
            nombre, apellido_paterno, apellido_materno, telefono, email
        ]);
        
        return result.lastID;
    }
    
    /**
     * Asignar estudiante a tutor
     */
    static async assignEstudiante(tutorId, estudianteId, relacion) {
        const sql = `
            INSERT INTO estudiante_tutor (estudiante_id, tutor_id, relacion)
            VALUES (?, ?, ?)
        `;
        
        try {
            await dbAsync.run(sql, [estudianteId, tutorId, relacion]);
            return true;
        } catch (error) {
            // Si ya existe la relación, devolver false
            if (error.message.includes('UNIQUE constraint failed')) {
                return false;
            }
            throw error;
        }
    }
}

module.exports = Tutor;