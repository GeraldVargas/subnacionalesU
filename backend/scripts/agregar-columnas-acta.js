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

async function agregarColumnasActa() {
    try {
        console.log('🔧 Agregando columnas a la tabla acta...\n');

        // Verificar si las columnas ya existen
        const checkQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'acta' 
            AND column_name IN ('editada', 'fecha_ultima_edicion', 'imagen_url')
        `;
        
        const existingColumns = await pool.query(checkQuery);
        const columnNames = existingColumns.rows.map(row => row.column_name);
        
        console.log('Columnas existentes:', columnNames);

        // Agregar columna 'editada' si no existe
        if (!columnNames.includes('editada')) {
            await pool.query(`
                ALTER TABLE acta ADD COLUMN editada BOOLEAN DEFAULT FALSE
            `);
            console.log('✅ Columna "editada" agregada');
        } else {
            console.log('ℹ️  Columna "editada" ya existe');
        }

        // Agregar columna 'fecha_ultima_edicion' si no existe
        if (!columnNames.includes('fecha_ultima_edicion')) {
            await pool.query(`
                ALTER TABLE acta ADD COLUMN fecha_ultima_edicion TIMESTAMP
            `);
            console.log('✅ Columna "fecha_ultima_edicion" agregada');
        } else {
            console.log('ℹ️  Columna "fecha_ultima_edicion" ya existe');
        }

        // Agregar columna 'imagen_url' si no existe
        if (!columnNames.includes('imagen_url')) {
            await pool.query(`
                ALTER TABLE acta ADD COLUMN imagen_url VARCHAR(500)
            `);
            console.log('✅ Columna "imagen_url" agregada');
        } else {
            console.log('ℹ️  Columna "imagen_url" ya existe');
        }

        // Crear índices
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_acta_editada ON acta(editada)
        `);
        console.log('✅ Índice para "editada" creado');

        console.log('\n🎉 ¡Proceso completado exitosamente!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

agregarColumnasActa();
