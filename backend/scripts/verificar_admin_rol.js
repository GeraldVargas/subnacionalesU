import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'subnacionales',
    user: 'postgres',
    password: 'pass'
});

async function verificar() {
    let client;
    try {
        client = await pool.connect();
        
        console.log('🔍 Verificando usuario admin y rol...\n');

        // Buscar usuario admin
        const result = await client.query(`
            SELECT u.id_usuario, u.nombre_usuario, u.id_rol, r.nombre as rol_nombre
            FROM usuario u
            LEFT JOIN rol r ON u.id_rol = r.id_rol
            WHERE u.nombre_usuario IN ('admin', 'administrador')
            ORDER BY u.id_usuario
        `);

        if (result.rows.length === 0) {
            console.log('⚠️ No encontré usuario "admin" o "administrador"');
            console.log('\nTodos los usuarios:');
            
            const allUsers = await client.query(`
                SELECT u.id_usuario, u.nombre_usuario, u.id_rol, r.nombre as rol_nombre
                FROM usuario u
                LEFT JOIN rol r ON u.id_rol = r.id_rol
                ORDER BY u.id_usuario
            `);
            
            allUsers.rows.forEach(row => {
                console.log(`  ${row.id_usuario}. ${row.nombre_usuario.padEnd(20)} → Rol ID: ${row.id_rol}, Nombre: ${row.rol_nombre}`);
            });
        } else {
            console.log('✅ Usuario admin encontrado:\n');
            result.rows.forEach(row => {
                console.log(`  ID Usuario: ${row.id_usuario}`);
                console.log(`  Nombre: ${row.nombre_usuario}`);
                console.log(`  ID Rol: ${row.id_rol}`);
                console.log(`  Nombre Rol: ${row.rol_nombre}`);
                console.log(`  \n  ⚠️ IMPORTANTE: El rol en navigation.js debe ser EXACTAMENTE: "${row.rol_nombre}"`);
            });
        }

        console.log('\n\nTodos los roles disponibles:');
        const rolesList = await client.query(`
            SELECT id_rol, nombre 
            FROM rol 
            ORDER BY id_rol
        `);
        
        rolesList.rows.forEach(row => {
            console.log(`  ID: ${row.id_rol} → "${row.nombre}"`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

verificar();
