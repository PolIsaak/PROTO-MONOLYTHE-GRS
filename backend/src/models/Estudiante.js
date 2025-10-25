const { dbAsync } = require('../config/database');
const bcrypt = require('bcrypt');

class Estudiante {
    /**
     * Buscar estudiante por CURP
     */
    static async findByCurp(curp) {
        const sql = `
            SELECT id, curp, nombre, apellido_paterno, apellido_materno, 
                   grado, grupo, password_hash, created_at
            FROM estudiantes
            WHERE curp = ?
        `;
        return await dbAsync.get(sql, [curp]);
    }
    
    /**
     * Buscar estudiante por ID
     */
    static async findById(id) {
        const sql = `
            SELECT id, curp, nombre, apellido_paterno, apellido_materno, 
                   grado, grupo, created_at
            FROM estudiantes
            WHERE id = ?
        `;
        return await dbAsync.get(sql, [id]);
    }
    
    /**
     * Obtener todos los estudiantes
     */
    static async getAll() {
        const sql = `
            SELECT id, curp, nombre, apellido_paterno, apellido_materno, 
                   grado, grupo, created_at
            FROM estudiantes
            ORDER BY grado, grupo, apellido_paterno
        `;
        return await dbAsync.all(sql);
    }
    
    /**
     * Verificar contraseña
     */
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
    
    /**
     * Crear nuevo estudiante
     */
    static async create(estudianteData) {
        const { curp, nombre, apellido_paterno, apellido_materno, grado, grupo, password } = estudianteData;
        
        // Hash de la contraseña
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        const sql = `
            INSERT INTO estudiantes (curp, nombre, apellido_paterno, apellido_materno, grado, grupo, password_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const result = await dbAsync.run(sql, [
            curp, nombre, apellido_paterno, apellido_materno, grado, grupo, passwordHash
        ]);
        
        return result.lastID;
    }
    
    /**
     * Obtener calificaciones de un estudiante por periodo
     */
    static async getCalificaciones(estudianteId, periodoId = null) {
        let sql = `
            SELECT 
                c.id,
                c.calificacion,
                c.fecha_registro,
                m.nombre as materia,
                m.clave as materia_clave,
                p.nombre as periodo,
                p.numero as periodo_numero
            FROM calificaciones c
            JOIN materias m ON c.materia_id = m.id
            JOIN periodos p ON c.periodo_id = p.id
            WHERE c.estudiante_id = ?
        `;
        
        const params = [estudianteId];
        
        if (periodoId) {
            sql += ` AND c.periodo_id = ?`;
            params.push(periodoId);
        }
        
        sql += ` ORDER BY p.numero, m.nombre`;
        
        return await dbAsync.all(sql, params);
    }
    
    /**
     * Calcular promedio general del estudiante
     */
    static async getPromedio(estudianteId, periodoId = null) {
        let sql = `
            SELECT AVG(calificacion) as promedio
            FROM calificaciones
            WHERE estudiante_id = ?
        `;
        
        const params = [estudianteId];
        
        if (periodoId) {
            sql += ` AND periodo_id = ?`;
            params.push(periodoId);
        }
        
        const result = await dbAsync.get(sql, params);
        return result ? parseFloat(result.promedio).toFixed(2) : null;
    }
    
    /**
     * Contar materias reprobadas
     */
    static async countMateriasReprobadas(estudianteId, periodoId = null) {
        let sql = `
            SELECT COUNT(*) as total
            FROM calificaciones
            WHERE estudiante_id = ? AND calificacion < 6.0
        `;
        
        const params = [estudianteId];
        
        if (periodoId) {
            sql += ` AND periodo_id = ?`;
            params.push(periodoId);
        }
        
        const result = await dbAsync.get(sql, params);
        return result ? result.total : 0;
    }
    
    /**
     * Obtener tutores de un estudiante
     */
    static async getTutores(estudianteId) {
        const sql = `
            SELECT 
                t.id,
                t.nombre,
                t.apellido_paterno,
                t.apellido_materno,
                t.telefono,
                t.email,
                et.relacion
            FROM tutores t
            JOIN estudiante_tutor et ON t.id = et.tutor_id
            WHERE et.estudiante_id = ?
        `;
        
        return await dbAsync.all(sql, [estudianteId]);
    }
    
    /**
     * Verificar si el estudiante está en riesgo académico
     */
    static async isEnRiesgo(estudianteId, periodoId = null, config) {
        const promedio = await this.getPromedio(estudianteId, periodoId);
        const materiasReprobadas = await this.countMateriasReprobadas(estudianteId, periodoId);
        
        const enRiesgo = {
            status: false,
            razones: []
        };
        
        if (promedio < config.alertas.promedioMinimo) {
            enRiesgo.status = true;
            enRiesgo.razones.push(`Promedio bajo: ${promedio}`);
        }
        
        if (materiasReprobadas > config.alertas.materiasReprobadasMaximo) {
            enRiesgo.status = true;
            enRiesgo.razones.push(`${materiasReprobadas} materias reprobadas (máximo: ${config.alertas.materiasReprobadasMaximo})`);
        }
        
        return enRiesgo;
    }
    
    /**
     * Obtener resumen académico completo
     */
    static async getResumenAcademico(estudianteId, periodoId = null) {
        const estudiante = await this.findById(estudianteId);
        const calificaciones = await this.getCalificaciones(estudianteId, periodoId);
        const promedio = await this.getPromedio(estudianteId, periodoId);
        const materiasReprobadas = await this.countMateriasReprobadas(estudianteId, periodoId);
        const tutores = await this.getTutores(estudianteId);
        
        return {
            estudiante,
            calificaciones,
            promedio: parseFloat(promedio),
            materiasReprobadas,
            tutores
        };
    }
}

module.exports = Estudiante;