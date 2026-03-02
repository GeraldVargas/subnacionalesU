import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'subnacionales',
    user: 'postgres',
    password: 'pass'
});

async function listarUsuarios() {
    let client;
    try {
        client = await pool.connect();
        
        console.log('📋 USUARIOS EN LA BD:\n');

        const result = await client.query(`
            SELECT u.id_usuario, u.nombre_usuario, u.id_rol, r.nombre as rol_nombre
            FROM usuario u
            LEFT JOIN rol r ON u.id_rol = r.id_rol
            ORDER BY u.id_rol, u.id_usuario
        `);

        console.log('ID\tUsename\t\tid_rol\tRol');
        console.log('─'.repeat(60));
        result.rows.forEach(row => {
            console.log(`${row.id_usuario}\t${row.nombre_usuario.padEnd(15)}\t${row.id_rol}\t${row.rol_nombre}`);
        });

        console.log('\n\n📊 ROLES EN LA BD:\n');
        const roleResult = await client.query(`
            SELECT id_rol, nombre, descripcion
            FROM rol
            ORDER BY id_rol
        `);

        roleResult.rows.forEach(row => {
            console.log(`  ID ${row.id_rol}: ${row.nombre}`);
            console.log(`    Descripción: ${row.descripcion}\n`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

listarUsuarios();
