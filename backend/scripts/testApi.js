const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Colores para la consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`),
    separator: () => console.log(`${colors.yellow}${'='.repeat(80)}${colors.reset}`)
};

let authToken = null;

// Test 1: Health Check
async function testHealthCheck() {
    log.test('Test 1: Health Check');
    try {
        const response = await axios.get(`${BASE_URL}/health`);
        log.success(`Health Check OK - ${response.data.message}`);
        return true;
    } catch (error) {
        log.error(`Health Check failed: ${error.message}`);
        return false;
    }
}

// Test 2: Login
async function testLogin() {
    log.test('Test 2: Login de estudiante');
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            curp: 'GAPL050815HDFRRS09',
            password: 'password123'
        });
        
        authToken = response.data.data.token;
        log.success('Login exitoso');
        log.info(`Token obtenido: ${authToken.substring(0, 30)}...`);
        log.info(`Estudiante: ${response.data.data.estudiante.nombre} ${response.data.data.estudiante.apellido_paterno}`);
        return true;
    } catch (error) {
        log.error(`Login failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

// Test 3: Verificar Token
async function testVerifyToken() {
    log.test('Test 3: Verificar Token');
    try {
        const response = await axios.get(`${BASE_URL}/auth/verify`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        log.success('Token válido');
        log.info(`Estudiante verificado: ${response.data.data.estudiante.nombre}`);
        return true;
    } catch (error) {
        log.error(`Token verification failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

// Test 4: Obtener Perfil
async function testGetProfile() {
    log.test('Test 4: Obtener Perfil');
    try {
        const response = await axios.get(`${BASE_URL}/estudiantes/profile`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        const estudiante = response.data.data.estudiante;
        log.success('Perfil obtenido');
        log.info(`${estudiante.nombre} ${estudiante.apellido_paterno} - ${estudiante.grado}° "${estudiante.grupo}"`);
        return true;
    } catch (error) {
        log.error(`Get profile failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

// Test 5: Obtener Calificaciones
async function testGetCalificaciones() {
    log.test('Test 5: Obtener Calificaciones');
    try {
        const response = await axios.get(`${BASE_URL}/estudiantes/1/calificaciones?periodo=1`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        const data = response.data.data;
        log.success('Calificaciones obtenidas');
        log.info(`Total de materias: ${data.calificaciones.length}`);
        log.info(`Promedio: ${data.promedio}`);
        log.info(`Materias reprobadas: ${data.materiasReprobadas}`);
        return true;
    } catch (error) {
        log.error(`Get calificaciones failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

// Test 6: Obtener Resumen Académico
async function testGetResumen() {
    log.test('Test 6: Obtener Resumen Académico');
    try {
        const response = await axios.get(`${BASE_URL}/estudiantes/1/resumen`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        const data = response.data.data;
        log.success('Resumen académico obtenido');
        log.info(`Estudiante: ${data.estudiante.nombre} ${data.estudiante.apellido_paterno}`);
        log.info(`Promedio: ${data.promedio}`);
        log.info(`Materias reprobadas: ${data.materiasReprobadas}`);
        log.info(`En riesgo: ${data.enRiesgo.status ? 'Sí' : 'No'}`);
        if (data.enRiesgo.status) {
            data.enRiesgo.razones.forEach(razon => log.info(`  - ${razon}`));
        }
        return true;
    } catch (error) {
        log.error(`Get resumen failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

// Test 7: Verificar Riesgo Académico
async function testCheckRiesgo() {
    log.test('Test 7: Verificar Riesgo Académico (Juan Rodríguez - Alto Riesgo)');
    try {
        // Login con Juan Rodríguez (estudiante con 5 materias reprobadas)
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            curp: 'ROPJ070320HDFRRS07',
            password: 'password123'
        });
        
        const juanToken = loginResponse.data.data.token;
        
        const response = await axios.get(`${BASE_URL}/estudiantes/3/riesgo`, {
            headers: { Authorization: `Bearer ${juanToken}` }
        });
        
        const data = response.data.data;
        log.success('Verificación de riesgo completada');
        log.info(`Estudiante: ${data.estudiante.nombre}`);
        log.info(`Promedio: ${data.promedio}`);
        log.info(`Materias reprobadas: ${data.materiasReprobadas}`);
        
        if (data.enRiesgo.status) {
            log.error(`⚠️  ESTUDIANTE EN RIESGO ACADÉMICO`);
            data.enRiesgo.razones.forEach(razon => log.info(`  - ${razon}`));
        } else {
            log.success('Estudiante en buen desempeño');
        }
        return true;
    } catch (error) {
        log.error(`Check riesgo failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

// Test 8: Obtener Tutores
async function testGetTutores() {
    log.test('Test 8: Obtener Tutores');
    try {
        const response = await axios.get(`${BASE_URL}/estudiantes/1/tutores`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        const tutores = response.data.data.tutores;
        log.success(`Tutores obtenidos: ${tutores.length}`);
        tutores.forEach(tutor => {
            log.info(`${tutor.nombre} ${tutor.apellido_paterno} (${tutor.relacion}) - ${tutor.telefono}`);
        });
        return true;
    } catch (error) {
        log.error(`Get tutores failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

// Test 9: Obtener Todos los Estudiantes
async function testGetAllEstudiantes() {
    log.test('Test 9: Obtener Todos los Estudiantes');
    try {
        const response = await axios.get(`${BASE_URL}/estudiantes`);
        
        const estudiantes = response.data.data.estudiantes;
        log.success(`Total de estudiantes: ${estudiantes.length}`);
        estudiantes.forEach(est => {
            log.info(`[${est.id}] ${est.nombre} ${est.apellido_paterno} - ${est.grado}° "${est.grupo}"`);
        });
        return true;
    } catch (error) {
        log.error(`Get all estudiantes failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

// Test 10: Intentar acceder sin token (debe fallar)
async function testUnauthorized() {
    log.test('Test 10: Intentar acceso sin token (debe fallar)');
    try {
        await axios.get(`${BASE_URL}/estudiantes/profile`);
        log.error('¡Error! El acceso sin token debería ser denegado');
        return false;
    } catch (error) {
        if (error.response?.status === 401) {
            log.success('Acceso denegado correctamente (401)');
            return true;
        }
        log.error(`Unexpected error: ${error.message}`);
        return false;
    }
}

// Ejecutar todos los tests
async function runAllTests() {
    console.log('\n');
    log.separator();
    console.log('🧪 EJECUTANDO TESTS DE LA API');
    log.separator();
    console.log('\n');
    
    const tests = [
        testHealthCheck,
        testLogin,
        testVerifyToken,
        testGetProfile,
        testGetCalificaciones,
        testGetResumen,
        testCheckRiesgo,
        testGetTutores,
        testGetAllEstudiantes,
        testUnauthorized
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        const result = await test();
        console.log('');
        
        if (result) {
            passed++;
        } else {
            failed++;
        }
        
        // Pequeña pausa entre tests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    log.separator();
    console.log(`\n📊 RESULTADOS:`);
    log.success(`Tests pasados: ${passed}`);
    if (failed > 0) {
        log.error(`Tests fallidos: ${failed}`);
    }
    log.separator();
    console.log('\n');
}

// Ejecutar
runAllTests().catch(error => {
    log.error(`Error fatal: ${error.message}`);
    process.exit(1);
});