import pg from 'pg';
const pool = new pg.Pool({
    host: 'localhost',
    port: 5432,
    database: 'subnacionales',
    user: 'postgres',
    password: 'pass'
});

(async () => {
    try {
        const res = await pool.query('SELECT * FROM recinto LIMIT 1');
        console.log('Recinto exists:', res.rows.length > 0);
        if (res.rows.length > 0) {
            console.log('Sample:', res.rows[0]);
        }
    } catch(e) {
        console.error('Error:', e.message);
    }
    await pool.end();
})();
