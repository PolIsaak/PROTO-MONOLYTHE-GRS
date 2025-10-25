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
console.log('🔄 RESETEANDO CONTRASEÑAS A "password123"');
console.log('================================================================================\n');

const PASSWORD_DEFAULT = 'password123';

// Obtener todos los estudiantes
db.all('SELECT id, nombre, apellido_paterno, curp FROM estudiantes', [], async (err, estudiantes) => {
  if (err) {
    console.error('❌ Error consultando estudiantes:', err);
    db.close();
    return;
  }

  console.log(`📚 Encontrados ${estudiantes.length} estudiantes\n`);

  // Generar hash de la contraseña
  const passwordHash = bcrypt.hashSync(PASSWORD_DEFAULT, 10);

  // Actualizar cada estudiante
  const stmt = db.prepare('UPDATE estudiantes SET password_hash = ? WHERE id = ?');

  let updated = 0;
  let errors = 0;

  for (const est of estudiantes) {
    stmt.run(passwordHash, est.id, function(err) {
      if (err) {
        console.error(`❌ Error actualizando ${est.nombre}: ${err.message}`);
        errors++;
      } else {
        console.log(`✅ ${est.nombre} ${est.apellido_paterno} (CURP: ${est.curp})`);
        console.log(`   → Contraseña: ${PASSWORD_DEFAULT}\n`);
        updated++;
      }

      // Verificar si terminamos
      if (updated + errors === estudiantes.length) {
        stmt.finalize();
        
        console.log('─'.repeat(80));
        console.log(`\n📊 RESUMEN:`);
        console.log(`   ✅ Actualizados: ${updated}`);
        console.log(`   ❌ Errores: ${errors}`);
        console.log(`\n🔑 Contraseña para TODOS los estudiantes: "${PASSWORD_DEFAULT}"`);
        console.log('\n💡 Ahora puedes ejecutar: npm run test-api');
        console.log('================================================================================\n');
        
        db.close();
      }
    });
  }
});