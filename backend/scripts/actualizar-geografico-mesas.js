import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'gubernamentales',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

async function actualizarGeograficoMesas() {
    try {
        console.log('🔍 Verificando mesas sin id_geografico...\n');

        // 1. Verificar mesas sin geografico
        const mesasSinGeo = await pool.query(`
            SELECT m.id_mesa, m.codigo, r.nombre as nombre_recinto, r.id_geografico, g.nombre as nombre_geografico
            FROM mesa m
            LEFT JOIN recinto r ON m.id_recinto = r.id_recinto
            LEFT JOIN geografico g ON m.id_geografico = g.id_geografico
            WHERE m.id_geografico IS NULL AND r.id_geografico IS NOT NULL
        `);

        if (mesasSinGeo.rows.length === 0) {
            console.log('✅ Todas las mesas ya tienen id_geografico asignado');
            
            // Mostrar mesas con geografico
            const mesasConGeo = await pool.query(`
                SELECT m.codigo, r.nombre as recinto, g.nombre as distrito
                FROM mesa m
                INNER JOIN recinto r ON m.id_recinto = r.id_recinto
                INNER JOIN geografico g ON m.id_geografico = g.id_geografico
                LIMIT 5
            `);
            
            console.log('\n📋 Ejemplo de mesas con distrito asignado:');
            mesasConGeo.rows.forEach(m => {
                console.log(`   Mesa: ${m.codigo} | Recinto: ${m.recinto} | Distrito: ${m.distrito}`);
            });
        } else {
            console.log(`⚠️  Encontradas ${mesasSinGeo.rows.length} mesas sin id_geografico:\n`);
            mesasSinGeo.rows.forEach(m => {
                console.log(`   Mesa: ${m.codigo} | Recinto: ${m.nombre_recinto} | Distrito a asignar: ${m.nombre_geografico}`);
            });

            console.log('\n🔧 Actualizando mesas con el id_geografico de su recinto...');

            // 2. Actualizar mesas con el geografico del recinto
            const resultado = await pool.query(`
                UPDATE mesa m
                SET id_geografico = r.id_geografico
                FROM recinto r
                WHERE m.id_recinto = r.id_recinto
                AND m.id_geografico IS NULL
                AND r.id_geografico IS NOT NULL
                RETURNING m.codigo, m.id_geografico
            `);

            console.log(`✅ ${resultado.rowCount} mesas actualizadas exitosamente\n`);
        }

        // 3. Verificar si hay recintos sin geografico
        const recintosSinGeo = await pool.query(`
            SELECT r.id_recinto, r.nombre, r.id_geografico
            FROM recinto r
            WHERE r.id_geografico IS NULL
        `);

        if (recintosSinGeo.rows.length > 0) {
            console.log(`\n⚠️  Encontrados ${recintosSinGeo.rows.length} recintos sin distrito asignado:`);
            recintosSinGeo.rows.forEach(r => {
                console.log(`   Recinto: ${r.nombre} (ID: ${r.id_recinto})`);
            });
            console.log('\n💡 Estos recintos deben tener un distrito asignado desde la interfaz web');
        }

        await pool.end();
        console.log('\n✅ Verificación completada');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
        process.exit(1);
    }
}

actualizarGeograficoMesas();
