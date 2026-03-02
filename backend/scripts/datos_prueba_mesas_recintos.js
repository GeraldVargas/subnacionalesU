import pg from 'pg';
import { fileURLToPath } from 'url';
import path from 'path';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'subnacionales',
    user: 'postgres',
    password: 'pass'
});

async function agregarDatosDeprueba() {
    let client;
    try {
        client = await pool.connect();
        
        console.log('📊 Agregando datos de prueba...\n');

        // 1. Agregar recintos
        console.log('🏛️  Agregando recintos...');
        const recintos = [
            { nombre: 'Recinto Colcapirhua Centro', direccion: 'Calle Principal 123' },
            { nombre: 'Recinto Aiquile', direccion: 'Zona Centro' },
            { nombre: 'Recinto Tarata', direccion: 'Plaza Principal' }
        ];

        for (const recinto of recintos) {
            await client.query(
                `INSERT INTO recinto (nombre, direccion)
                 VALUES ($1, $2)
                 ON CONFLICT DO NOTHING`,
                [recinto.nombre, recinto.direccion]
            );
        }
        console.log(`✅ ${recintos.length} recintos agregados\n`);

        // 2. Agregar mesas
        console.log('📋 Agregando mesas...');
        const mesas = [
            { codigo: 'MESA-001', descripcion: 'Mesa Electoral 001' },
            { codigo: 'MESA-002', descripcion: 'Mesa Electoral 002' },
            { codigo: 'MESA-003', descripcion: 'Mesa Electoral 003' },
            { codigo: 'MESA-004', descripcion: 'Mesa Electoral 004' },
            { codigo: 'MESA-005', descripcion: 'Mesa Electoral 005' },
            { codigo: 'MESA-006', descripcion: 'Mesa Electoral 006' }
        ];

        for (const mesa of mesas) {
            await client.query(
                `INSERT INTO mesa (codigo, descripcion)
                 VALUES ($1, $2)
                 ON CONFLICT (codigo) DO NOTHING`,
                [mesa.codigo, mesa.descripcion]
            );
        }
        console.log(`✅ ${mesas.length} mesas agregadas\n`);

        // 3. Verificar datos
        const resultRecintos = await client.query('SELECT COUNT(*) as count FROM recinto');
        const resultMesas = await client.query('SELECT COUNT(*) as count FROM mesa');

        console.log('📊 Estado actual:');
        console.log(`   📌 Recintos en BD: ${resultRecintos.rows[0].count}`);
        console.log(`   📌 Mesas en BD: ${resultMesas.rows[0].count}`);

        console.log('\n✅ Datos de prueba agregados exitosamente');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

agregarDatosDeprueba();
