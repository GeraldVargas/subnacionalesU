import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

// Cargar variables de entorno
dotenv.config({ path: new URL('../.env', import.meta.url) });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'subnacionales',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
});

async function inicializarDatos() {
    try {
        console.log('🔧 Inicializando datos de la base de datos...');

        // Insertar tipos de elección
        await pool.query(`
            INSERT INTO tipo_eleccion (nombre, codigo) VALUES
                ('Elecciones Subnacionales', 'SUBNAC'),
                ('Elecciones Generales', 'GENERAL'),
                ('Referéndum', 'REFER')
            ON CONFLICT DO NOTHING
        `);

        const tipos = await pool.query('SELECT * FROM tipo_eleccion');
        console.log('✅ Tipos de elección disponibles:', tipos.rows.length);

        await pool.end();
        console.log('✅ Datos inicializados correctamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al inicializar datos:', error);
        process.exit(1);
    }
}

inicializarDatos();
