import pool from '../database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function crearTablaFrentePolitico() {
    try {
        console.log('📋 Creando tabla frente_politico...');

        const sqlPath = path.join(__dirname, '../sql/02_crear_tabla_frente_politico.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await pool.query(sql);

        console.log('✅ Tabla frente_politico creada correctamente');
        console.log('✅ Datos de ejemplo insertados');

        // Verificar
        const result = await pool.query('SELECT * FROM frente_politico');
        console.log(`\n📊 Frentes políticos registrados: ${result.rows.length}`);
        result.rows.forEach(frente => {
            console.log(`   - ${frente.nombre} (${frente.siglas || 'Sin siglas'})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

crearTablaFrentePolitico();
