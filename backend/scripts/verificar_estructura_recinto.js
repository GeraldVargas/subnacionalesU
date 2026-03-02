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
    try {
        const result = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'recinto' 
            ORDER BY ordinal_position
        `);
        console.log('Columnas de la tabla recinto:');
        result.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type}`);
        });
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await pool.end();
    }
}

verificar();
