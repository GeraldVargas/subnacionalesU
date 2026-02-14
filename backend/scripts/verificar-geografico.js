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

async function verificarGeografico() {
    try {
        console.log('🔍 Verificando datos geográficos...\n');

        // Contar todos los registros
        const countResult = await pool.query('SELECT COUNT(*) FROM geografico');
        console.log(`📊 Total de registros: ${countResult.rows[0].count}\n`);

        // Contar por tipo
        const tiposResult = await pool.query(`
            SELECT tipo, COUNT(*) as cantidad
            FROM geografico
            GROUP BY tipo
            ORDER BY cantidad DESC
        `);
        
        console.log('📋 Registros por tipo:');
        tiposResult.rows.forEach(row => {
            console.log(`   - ${row.tipo || '(sin tipo)'}: ${row.cantidad}`);
        });

        // Mostrar algunos registros de ejemplo
        const ejemplosResult = await pool.query(`
            SELECT id_geografico, nombre, tipo, codigo
            FROM geografico
            ORDER BY id_geografico
            LIMIT 10
        `);

        console.log('\n📝 Primeros 10 registros:');
        ejemplosResult.rows.forEach(row => {
            console.log(`   ID: ${row.id_geografico} | ${row.nombre} | Tipo: ${row.tipo || 'N/A'} | Código: ${row.codigo || 'N/A'}`);
        });

        // Buscar específicamente Distrito o Municipio
        const distritosResult = await pool.query(`
            SELECT id_geografico, nombre, tipo, codigo
            FROM geografico
            WHERE tipo IN ('Distrito', 'Municipio')
            ORDER BY nombre
        `);

        console.log(`\n🏛️  Registros de tipo Distrito o Municipio: ${distritosResult.rows.length}`);
        if (distritosResult.rows.length > 0) {
            distritosResult.rows.forEach(row => {
                console.log(`   - ${row.nombre} (${row.tipo}) - Código: ${row.codigo || 'N/A'}`);
            });
        } else {
            console.log('   ⚠️  No hay registros con tipo "Distrito" o "Municipio"');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

verificarGeografico();
