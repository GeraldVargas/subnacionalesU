// Script temporal para aplicar migración SQL
import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leer variables de entorno
dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function aplicarMigracion() {
    const client = await pool.connect();
    try {
        console.log('🔄 Aplicando migración...\n');

        // Leer el archivo SQL
        const sqlPath = path.join(__dirname, 'sql', '07_agregar_campos_aprobacion.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Ejecutar la migración
        await client.query(sql);

        console.log('\n✅ Migración aplicada exitosamente!');
    } catch (error) {
        console.error('❌ Error al aplicar migración:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

aplicarMigracion();
