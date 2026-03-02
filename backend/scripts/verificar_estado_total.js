import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'subnacionales',
    user: 'postgres',
    password: 'pass'
});

async function verificarEstado() {
    let client;
    try {
        client = await pool.connect();
        
        console.log('📋 VERIFICACIÓN DE ESTADO TOTAL DEL SISTEMA\n');
        console.log('═'.repeat(60));

        // 1. Contar usuarios por rol
        console.log('\n👥 USUARIOS POR ROL:');
        const usuariosRol = await client.query(`
            SELECT r.nombre, COUNT(u.id_usuario) as cantidad
            FROM rol r
            LEFT JOIN usuario u ON r.id_rol = u.id_rol
            GROUP BY r.id_rol, r.nombre
            ORDER BY r.id_rol
        `);
        usuariosRol.rows.forEach(row => {
            console.log(`   ${row.nombre.padEnd(30)} → ${row.cantidad} usuarios`);
        });

        // 2. Mesas
        console.log('\n🗂️  MESAS:');
        const mesas = await client.query(`
            SELECT COUNT(*) as total FROM mesa
        `);
        console.log(`   Total mesas: ${mesas.rows[0].total}`);

        // 3. Recintos
        console.log('\n🏛️  RECINTOS:');
        const recintos = await client.query(`
            SELECT COUNT(*) as total FROM recinto
        `);
        console.log(`   Total recintos: ${recintos.rows[0].total}`);

        // 4. Asignaciones
        console.log('\n🔗 ASIGNACIONES:');
        const delegados = await client.query(`
            SELECT COUNT(*) as total FROM delegado_mesa
        `);
        console.log(`   Delegados asignados a mesas: ${delegados.rows[0].total}`);

        const jefes = await client.query(`
            SELECT COUNT(*) as total FROM jefe_recinto
        `);
        console.log(`   Jefes asignados a recintos: ${jefes.rows[0].total}`);

        // 5. Datos de prueba específicos
        console.log('\n🧪 DATOS DE PRUEBA:');
        console.log('\n   Usuarios delegados/jefes:');
        const delegadosJefes = await client.query(`
            SELECT u.nombre_usuario, r.nombre as rol
            FROM usuario u
            JOIN rol r ON u.id_rol = r.id_rol
            WHERE u.id_rol IN (3, 4)
            ORDER BY u.id_usuario
        `);
        delegadosJefes.rows.forEach(row => {
            console.log(`      • ${row.nombre_usuario} → ${row.rol}`);
        });

        console.log('\n   Primeras 3 mesas:');
        const mesasLista = await client.query(`
            SELECT id_mesa, numero_mesa FROM mesa LIMIT 3
        `);
        mesasLista.rows.forEach(row => {
            console.log(`      • Mesa #${row.numero_mesa} (ID: ${row.id_mesa})`);
        });

        console.log('\n   Primeros 3 recintos:');
        const recintosLista = await client.query(`
            SELECT id_recinto, nombre FROM recinto LIMIT 3
        `);
        recintosLista.rows.forEach(row => {
            console.log(`      • ${row.nombre} (ID: ${row.id_recinto})`);
        });

        console.log('\n' + '═'.repeat(60));
        console.log('✅ ESTADO: Sistema listo para pruebas\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

verificarEstado();
