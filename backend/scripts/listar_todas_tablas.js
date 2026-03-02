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
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        console.log('Tablas en la BD:');
        result.rows.forEach(row => {
            console.log(`  - ${row.table_name}`);
        });
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await pool.end();
    }
}

verificar();
