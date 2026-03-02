import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'subnacionales',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'pass'
});

async function ejecutarScript() {
    try {
        console.log('📂 Leyendo archivo SQL...');
        const sqlPath = path.join(projectRoot, 'sql', '06_agregar_roles_y_permisos.sql');
        const sql = fs.readFileSync(sqlPath, 'utf-8');
        
        console.log('🔗 Conectando a PostgreSQL...');
        const client = await pool.connect();
        
        console.log('⚙️  Ejecutando script SQL...');
        
        // Dividir por puntos y coma para ejecutar línea por línea
        const statements = sql.split(';').filter(stmt => stmt.trim());
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i].trim();
            if (statement) {
                try {
                    process.stdout.write(`⏳ Ejecutando sentencia ${i + 1}/${statements.length}... `);
                    await client.query(statement);
                    console.log('✓');
                } catch (err) {
                    console.log('\n');
                    console.error(`❌ Error en sentencia ${i + 1}:`);
                    console.error(`   Primeras 150 caracteres:`);
                    console.error(`   ${statement.substring(0, 150)}`);
                    console.error(`   Error: ${err.message}`);
                    // No lanzar error, continuar con siguiente sentencia
                }
            }
        }
        
        console.log('\n✅ Script procesado');
        
        // Verificar que los roles se crearon
        const result = await client.query('SELECT id_rol, nombre, descripcion FROM rol ORDER BY id_rol');
        console.log('\n📋 Roles en la BD:');
        console.table(result.rows);
        
        // Verificar que las tablas se crearon
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('delegado_mesa', 'jefe_recinto', 'recinto')
            ORDER BY table_name
        `);
        console.log('\n📊 Tablas creadas:');
        console.table(tables.rows);
        
        client.release();
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error crítico:', error.message);
        process.exit(1);
    }
}

ejecutarScript();
