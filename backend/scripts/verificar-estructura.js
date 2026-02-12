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

async function verificarEstructura() {
    try {
        console.log('🔍 Verificando estructura de la base de datos...\n');

        const tablas = ['mesa', 'tipo_eleccion'];

        for (const tabla of tablas) {
            console.log(`\n📋 Tabla: ${tabla}`);
            console.log('='.repeat(50));

            const result = await pool.query(`
                SELECT 
                    column_name,
                    data_type,
                    character_maximum_length,
                    is_nullable,
                    column_default
                FROM information_schema.columns
                WHERE table_name = $1
                ORDER BY ordinal_position
            `, [tabla]);

            if (result.rows.length === 0) {
                console.log(`❌ La tabla ${tabla} no existe`);
            } else {
                result.rows.forEach(col => {
                    const tipo = col.character_maximum_length
                        ? `${col.data_type}(${col.character_maximum_length})`
                        : col.data_type;
                    const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
                    const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
                    console.log(`  - ${col.column_name}: ${tipo} ${nullable}${defaultVal}`);
                });
            }
        }

        await pool.end();
        console.log('\n✅ Verificación completada');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

verificarEstructura();
