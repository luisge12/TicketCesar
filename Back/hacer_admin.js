import pkg from 'pg';
const { Pool } = pkg;

// Conexión directa a la base de datos de Render
const pool = new Pool({
  connectionString: "postgresql://tcr_admin:4breIeglZad8EFofhvryXzzXj9nudCYi@dpg-d7loss67r5hc73c7cf5g-a.oregon-postgres.render.com/ticketcesar?ssl=true",
});

// CAMBIA ESTO POR TU CORREO
const email = 'admin.cesarrengifo@gmail.com';

async function makeAdmin() {
  console.log(`Conectando a la base de datos para actualizar a: ${email}...`);
  try {
    const res = await pool.query(
      "UPDATE users SET role = 'admin', is_verified = true WHERE email = $1 RETURNING email, role, is_verified",
      [email]
    );

    if (res.rowCount > 0) {
      console.log('--------------------------------------------------');
      console.log('✅ ¡ACTUALIZACIÓN EXITOSA!');
      console.log('Usuario:', res.rows[0].email);
      console.log('Nuevo Rol:', res.rows[0].role);
      console.log('Verificado:', res.rows[0].is_verified);
      console.log('--------------------------------------------------');
      console.log('Ya puedes iniciar sesión en Render como administrador.');
    } else {
      console.log('--------------------------------------------------');
      console.log('❌ ERROR: No se encontró el usuario.');
      console.log('Asegúrate de que el correo esté bien escrito y registrado en Render.');
      console.log('--------------------------------------------------');
    }
  } catch (err) {
    console.error('❌ ERROR CRÍTICO:', err.message);
  } finally {
    await pool.end();
  }
}

makeAdmin();
