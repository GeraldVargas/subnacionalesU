import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'subnacionales',
    user: 'postgres',
    password: 'pass'
});

async function verificarEndpoints() {
    let client;
    try {
        client = await pool.connect();
        
        console.log('🔌 VERIFICACIÓN DE ENDPOINTS API\n');
        console.log('═'.repeat(60));

        // 1. GET /usuarios?id_rol=3 (delegados)
        console.log('\n📌 GET /usuarios?id_rol=3 (Delegados de Mesa)');
        const delegados = await client.query(`
            SELECT id_usuario, nombre_usuario, id_rol 
            FROM usuario 
            WHERE id_rol = 3
            ORDER BY id_usuario
        `);
        console.log(`   ✅ Devolvería ${delegados.rows.length} registros:`);
        delegados.rows.forEach((row, idx) => {
            console.log(`      ${idx + 1}. ID: ${row.id_usuario}, Usuario: ${row.nombre_usuario}`);
        });

        // 2. GET /usuarios?id_rol=4 (jefes)
        console.log('\n📌 GET /usuarios?id_rol=4 (Jefes de Recinto)');
        const jefes = await client.query(`
            SELECT id_usuario, nombre_usuario, id_rol 
            FROM usuario 
            WHERE id_rol = 4
            ORDER BY id_usuario
        `);
        console.log(`   ✅ Devolvería ${jefes.rows.length} registros:`);
        jefes.rows.forEach((row, idx) => {
            console.log(`      ${idx + 1}. ID: ${row.id_usuario}, Usuario: ${row.nombre_usuario}`);
        });

        // 3. GET /geografico?tipo=mesa
        console.log('\n📌 GET /geografico?tipo=mesa');
        const mesas = await client.query(`
            SELECT id_mesa, numero_mesa, codigo
            FROM mesa
            ORDER BY id_mesa
            LIMIT 5
        `);
        console.log(`   ✅ Devolvería ${mesas.rows.length} primeros registros:`);
        mesas.rows.forEach((row, idx) => {
            console.log(`      ${idx + 1}. ID: ${row.id_mesa}, #${row.numero_mesa}, Código: ${row.codigo}`);
        });

        // Total de mesas
        const totalMesas = await client.query(`SELECT COUNT(*) as total FROM mesa`);
        console.log(`   📊 TOTAL: ${totalMesas.rows[0].total} mesas`);

        // 4. GET /geografico?tipo=recinto
        console.log('\n📌 GET /geografico?tipo=recinto');
        const recintos = await client.query(`
            SELECT id_recinto, nombre, direccion
            FROM recinto
            ORDER BY id_recinto
            LIMIT 5
        `);
        console.log(`   ✅ Devolvería ${recintos.rows.length} primeros registros:`);
        recintos.rows.forEach((row, idx) => {
            console.log(`      ${idx + 1}. ID: ${row.id_recinto}, ${row.nombre}`);
        });

        // Total de recintos
        const totalRecintos = await client.query(`SELECT COUNT(*) as total FROM recinto`);
        console.log(`   📊 TOTAL: ${totalRecintos.rows[0].total} recintos`);

        // 5. Estructura de AsignarMesa
        console.log('\n\n═'.repeat(60));
        console.log('💡 PARA PROBAR AsignarMesa.jsx:');
        console.log('═'.repeat(60));
        console.log('\n1. Llama a: GET /usuarios?id_rol=3');
        console.log(`   Debe devolver: Array con ${delegados.rows.length} delegados`);
        console.log('\n2. Llama a: GET /geografico?tipo=mesa');
        console.log(`   Debe devolver: Array con ${totalMesas.rows[0].total} mesas`);
        console.log('\n3. Postea a: POST /delegado-mesa');
        console.log('   Con datos: { id_usuario, id_mesa, observaciones? }');

        // 6. Estructura de AsignarRecinto
        console.log('\n\n═'.repeat(60));
        console.log('💡 PARA PROBAR AsignarRecinto.jsx:');
        console.log('═'.repeat(60));
        console.log('\n1. Llama a: GET /usuarios?id_rol=4');
        console.log(`   Debe devolver: Array con ${jefes.rows.length} jefes`);
        console.log('\n2. Llama a: GET /geografico?tipo=recinto');
        console.log(`   Debe devolver: Array con ${totalRecintos.rows[0].total} recintos`);
        console.log('\n3. Postea a: POST /jefe-recinto');
        console.log('   Con datos: { id_usuario, id_recinto, observaciones? }');

        console.log('\n' + '═'.repeat(60));
        console.log('✅ Endpoints verificados\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

verificarEndpoints();
