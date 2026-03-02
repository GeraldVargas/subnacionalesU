import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'subnacionales',
    user: 'postgres',
    password: 'pass'
});

async function verificarTablas() {
    let client;
    try {
        client = await pool.connect();
        
        console.log('🔍 Revisando tablas y columnas...\n');

        // 1. Verificar usuario tabla
        console.log('1️⃣ Tabla USUARIO:');
        const usuario = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'usuario'
            ORDER BY ordinal_position
        `);
        usuario.rows.forEach(r => {
            console.log(`   ${r.column_name} (${r.data_type})`);
        });

        // 2. Verificar mesa tabla
        console.log('\n2️⃣ Tabla MESA:');
        const mesa = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'mesa'
            ORDER BY ordinal_position
        `);
        mesa.rows.forEach(r => {
            console.log(`   ${r.column_name} (${r.data_type})`);
        });

        // 3. Verificar recinto tabla
        console.log('\n3️⃣ Tabla RECINTO:');
        const recinto = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'recinto'
            ORDER BY ordinal_position
        `);
        recinto.rows.forEach(r => {
            console.log(`   ${r.column_name} (${r.data_type})`);
        });

        // 4. Verificar geografico tabla
        console.log('\n4️⃣ Tabla GEOGRAFICO:');
        const geografico = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'geografico'
            ORDER BY ordinal_position
        `);
        geografico.rows.forEach(r => {
            console.log(`   ${r.column_name} (${r.data_type})`);
        });

        // 5. Query de prueba: GET /usuarios?id_rol=4
        console.log('\n\n📋 TEST: GET /usuarios?id_rol=4');
        const usuariosTest = await client.query(`
            SELECT
              u.id_usuario,
              u.nombre_usuario,
              u.id_rol,
              r.nombre as rol_nombre
            FROM usuario u
            LEFT JOIN rol r ON u.id_rol = r.id_rol
            WHERE u.id_rol = $1
            ORDER BY u.id_usuario DESC
        `, [4]);
        console.log(`   ✅ Retorna ${usuariosTest.rows.length} regintos de jefe`);
        usuariosTest.rows.forEach(r => {
            console.log(`      - ${r.nombre_usuario} (rol: ${r.rol_nombre})`);
        });

        // 6. Query de prueba: GET /geografico?tipo=recinto
        console.log('\n📋 TEST: GET /geografico?tipo=recinto');
        const recintosTest = await client.query(`
            SELECT 
              id_recinto as id_geografico,
              id_recinto,
              nombre,
              null as codigo,
              direccion as ubicacion,
              'recinto'::text as tipo,
              null as fk_id_geografico,
              null as nombre_padre
            FROM recinto
            ORDER BY nombre
        `);
        console.log(`   ✅ Retorna ${recintosTest.rows.length} recintos`);
        recintosTest.rows.slice(0, 3).forEach(r => {
            console.log(`      - ${r.nombre} (ID: ${r.id_recinto})`);
        });

        // 7. Query de prueba: GET /permisos/jefes
        console.log('\n📋 TEST: GET /permisos/jefes');
        const jefesTest = await client.query(`
            SELECT 
              jr.id_jefe_recinto,
              jr.id_usuario,
              u.nombre_usuario,
              jr.id_recinto,
              r.nombre,
              jr.activo
            FROM jefe_recinto jr
            JOIN usuario u ON jr.id_usuario = u.id_usuario
            JOIN recinto r ON jr.id_recinto = r.id_recinto
            WHERE jr.activo = TRUE
            ORDER BY jr.id_usuario, r.nombre
        `);
        console.log(`   ✅ Retorna ${jefesTest.rows.length} asignaciones activas de jefe`);
        jefesTest.rows.forEach(r => {
            console.log(`      - ${r.nombre_usuario} → ${r.nombre}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

verificarTablas();
