import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'subnacionales',
    user: 'postgres',
    password: 'pass'
});

async function checkRecinto() {
    let client;
    try {
        client = await pool.connect();
        
        console.log('🔍 Verificar tabla RECINTO:\n');

        const columns = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'recinto'
            ORDER BY ordinal_position
        `);

        console.log('Columnas en tabla recinto:');
        columns.rows.forEach(r => {
            console.log(`  ${r.column_name} (${r.data_type}) ${r.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'}`);
        });

        console.log('\nPrimeros 3 registros:');
        const data = await client.query('SELECT * FROM recinto LIMIT 3');
        data.rows.forEach((r, idx) => {
            console.log(`  ${idx + 1}. ${JSON.stringify(r)}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

checkRecinto();
