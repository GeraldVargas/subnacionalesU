import pg from 'pg';
import bcrypt from 'bcrypt';
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

async function crearUsuariosPrueba() {
    let client;
    try {
        client = await pool.connect();
        
        console.log('👥 Creando usuarios de prueba...\n');

        // Verificar si existe tabla persona
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_name = 'persona'
            ) as exists
        `);

        const tienePersona = tableCheck.rows[0].exists;

        // Usuarios a crear: delegados y jefes
        const usuarios = [
            { nombre_usuario: 'delegado1', contrasena: 'Delegado@123', id_rol: 3, nombre: 'Delegado', apellido_paterno: 'Uno' },
            { nombre_usuario: 'delegado2', contrasena: 'Delegado@123', id_rol: 3, nombre: 'Delegado', apellido_paterno: 'Dos' },
            { nombre_usuario: 'jefe1', contrasena: 'Jefe@123', id_rol: 4, nombre: 'Jefe', apellido_paterno: 'Uno' },
            { nombre_usuario: 'jefe2', contrasena: 'Jefe@123', id_rol: 4, nombre: 'Jefe', apellido_paterno: 'Dos' }
        ];

        for (const usr of usuarios) {
            try {
                // Hash de contraseña
                const hashedPassword = await bcrypt.hash(usr.contrasena, 10);

                if (tienePersona) {
                    // Si existe tabla persona, crear persona primero
                    const personaResult = await client.query(
                        `SELECT id_persona FROM persona 
                         WHERE nombre = $1 AND apellido_paterno = $2 LIMIT 1`,
                        [usr.nombre, usr.apellido_paterno]
                    );

                    let id_persona;
                    if (personaResult.rows.length > 0) {
                        id_persona = personaResult.rows[0].id_persona;
                    } else {
                        const insertPersona = await client.query(
                            `INSERT INTO persona (nombre, apellido_paterno, ci)
                             VALUES ($1, $2, $3)
                             RETURNING id_persona`,
                            [usr.nombre, usr.apellido_paterno, `CI-${usr.nombre_usuario.toUpperCase()}`]
                        );
                        id_persona = insertPersona.rows[0].id_persona;
                    }

                    await client.query(
                        `INSERT INTO usuario (nombre_usuario, contrasena, id_rol, id_persona)
                         VALUES ($1, $2, $3, $4)
                         ON CONFLICT (nombre_usuario) DO UPDATE 
                         SET contrasena = $2, id_rol = $3`,
                        [usr.nombre_usuario, hashedPassword, usr.id_rol, id_persona]
                    );
                } else {
                    // Sin tabla persona, crear usuario directo
                    await client.query(
                        `INSERT INTO usuario (nombre_usuario, contrasena, id_rol)
                         VALUES ($1, $2, $3)
                         ON CONFLICT (nombre_usuario) DO UPDATE 
                         SET contrasena = $2, id_rol = $3`,
                        [usr.nombre_usuario, hashedPassword, usr.id_rol]
                    );
                }

                console.log(`✅ Usuario creado: ${usr.nombre_usuario} (Rol ID: ${usr.id_rol})`);
            } catch (e) {
                console.log(`⚠️  ${usr.nombre_usuario}: ${e.message.substring(0, 60)}`);
            }
        }

        // Verificar
        console.log('\n📊 Usuarios creados:');
        const result = await client.query(`
            SELECT u.nombre_usuario, u.id_rol, r.nombre as rol_nombre
            FROM usuario u
            LEFT JOIN rol r ON u.id_rol = r.id_rol
            WHERE u.id_rol IN (3, 4)
            ORDER BY u.id_rol, u.nombre_usuario
        `);
        
        result.rows.forEach(row => {
            console.log(`   👤 ${row.nombre_usuario.padEnd(20)} → ${row.rol_nombre}`);
        });

        console.log('\n✅ Usuarios de prueba creados\n');
        console.log('Credenciales para pruebas:');
        console.log('   delegado1 / Delegado@123');
        console.log('   delegado2 / Delegado@123');
        console.log('   jefe1 / Jefe@123');
        console.log('   jefe2 / Jefe@123');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

crearUsuariosPrueba();
