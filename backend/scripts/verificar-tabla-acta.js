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

async function verificarTablaActa() {
    try {
        console.log('🔍 Verificando estructura de la tabla acta...\n');

        const result = await pool.query(`
            SELECT 
                column_name,
                data_type,
                is_nullable,
                column_default
            FROM information_schema.columns
            WHERE table_name = 'acta'
            ORDER BY ordinal_position
        `);

        if (result.rows.length === 0) {
            console.log('❌ La tabla acta no existe');
        } else {
            console.log('📋 Columnas de la tabla acta:');
            result.rows.forEach(col => {
                const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
                const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
                console.log(`   - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
            });

            // Verificar columnas específicas que agregamos
            const columnNames = result.rows.map(r => r.column_name);
            console.log('\n🔍 Verificando columnas necesarias:');
            
            const requiredColumns = ['editada', 'fecha_ultima_edicion', 'imagen_url'];
            requiredColumns.forEach(colName => {
                if (columnNames.includes(colName)) {
                    console.log(`   ✅ ${colName} - Existe`);
                } else {
                    console.log(`   ❌ ${colName} - NO EXISTE`);
                }
            });
        }

        // Contar registros
        const countResult = await pool.query('SELECT COUNT(*) FROM acta');
        console.log(`\n📊 Total de registros en acta: ${countResult.rows[0].count}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

verificarTablaActa();
