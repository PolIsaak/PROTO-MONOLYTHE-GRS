const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/escuela.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err);
    console.error('Path intentado:', dbPath);
    process.exit(1);
  }
  console.log('✅ Conexión exitosa a escuela.db');
  console.log('📁 Path:', dbPath, '\n');
});

console.log('================================================================================');
console.log('🔍 VERIFICANDO CONTRASEÑAS ACTUALES');
console.log('================================================================================\n');

// Contraseñas comunes para probar
const commonPasswords = [
  'password123',
  '123456',
  'estudiante',
  'estudiante123',
  'escuela123',
  'admin123'
];

// Obtener todos los estudiantes
db.all('SELECT id, nombre, apellido_paterno, curp, password_hash FROM estudiantes', [], (err, estudiantes) => {
  if (err) {
    console.error('❌ Error consultando estudiantes:', err);
    db.close();
    return;
  }

  console.log(`📚 Verificando ${estudiantes.length} estudiantes\n`);

  let foundPasswords = 0;
  let notFoundPasswords = 0;

  estudiantes.forEach(est => {
    console.log(`👤 ${est.nombre} ${est.apellido_paterno}`);
    console.log(`   CURP: ${est.curp}`);
    console.log(`   Hash: ${est.password_hash.substring(0, 30)}...`);

    let passwordFound = false;

    // Intentar cada contraseña común
    for (const pwd of commonPasswords) {
      try {
        const match = bcrypt.compareSync(pwd, est.password_hash);
        if (match) {
          console.log(`   ✅ Password encontrada: "${pwd}"`);
          passwordFound = true;
          foundPasswords++;
          break;
        }
      } catch (error) {
        // El hash podría estar corrupto o en formato incorrecto
      }
    }

    if (!passwordFound) {
      console.log('   ❌ Password NO encontrada en lista de comunes');
      notFoundPasswords++;
    }

    console.log('');
  });

  console.log('─'.repeat(80));
  console.log('\n📊 RESUMEN:');
  console.log(`   ✅ Contraseñas encontradas: ${foundPasswords}`);
  console.log(`   ❌ Contraseñas no encontradas: ${notFoundPasswords}`);

  if (notFoundPasswords > 0) {
    console.log('\n⚠️  ACCIÓN REQUERIDA:');
    console.log('   Algunas contraseñas no coinciden con las comunes.');
    console.log('   Ejecuta: node scripts/reset-passwords.js');
    console.log('   Para configurar "password123" en todos los estudiantes.');
  } else {
    console.log('\n✅ LISTO PARA TESTS:');
    console.log('   Todas las contraseñas son conocidas.');
    console.log('   Ejecuta: node scripts/testApi-fixed.js');
  }

  console.log('================================================================================\n');
  db.close();
});