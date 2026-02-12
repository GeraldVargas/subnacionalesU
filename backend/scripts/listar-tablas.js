import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

async function listarTablas() {
    try {
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);

        console.log('\n📊 TABLAS EN TU BASE DE DATOS:\n');
        console.log(`Total: ${result.rows.length} tablas\n`);

        result.rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.table_name}`);
        });

        await pool.end();

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

listarTablas();
