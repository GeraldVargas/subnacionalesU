import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../database.js';

const router = express.Router();

// GET /api/usuarios/roles - Obtener todos los roles
router.get('/roles', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT id_rol, nombre, descripcion
      FROM rol
      ORDER BY nombre
    `);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Error al obtener roles:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener roles',
            error: error.message
        });
    }
});

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        u.id_usuario,
        u.nombre_usuario,
        u.fecha_fin,
        u.id_rol,
        u.id_persona,
        p.nombre,
        p.apellido_paterno,
        p.apellido_materno,
        p.ci,
        p.celular,
        p.email,
        r.nombre as rol_nombre,
        r.descripcion as rol_descripcion
      FROM usuario u
      INNER JOIN persona p ON u.id_persona = p.id_persona
      LEFT JOIN rol r ON u.id_rol = r.id_rol
      ORDER BY u.id_usuario DESC
    `);

        // Formatear la respuesta
        const usuarios = result.rows.map(u => ({
            id_usuario: u.id_usuario,
            nombre_usuario: u.nombre_usuario,
            activo: !u.fecha_fin || new Date(u.fecha_fin) > new Date(),
            persona: {
                nombre: u.nombre,
                apellido_paterno: u.apellido_paterno,
                apellido_materno: u.apellido_materno,
                ci: u.ci,
                celular: u.celular,
                email: u.email
            },
            roles: u.rol_nombre ? [{ name: u.rol_nombre, descripcion: u.rol_descripcion }] : []
        }));

        res.json({
            success: true,
            data: usuarios
        });

    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios',
            error: error.message
        });
    }
});

// POST /api/usuarios - Crear nuevo usuario
router.post('/', async (req, res) => {
    const {
        nombre_usuario,
        contrasena,
        id_rol,
        persona
    } = req.body;

    try {
        // Validaciones
        if (!nombre_usuario || !contrasena || !id_rol || !persona) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos'
            });
        }

        if (!persona.nombre || !persona.apellido_paterno || !persona.ci) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos de la persona (nombre, apellido_paterno, ci)'
            });
        }

        // Verificar si el usuario ya existe
        const usuarioExiste = await pool.query(
            'SELECT id_usuario FROM usuario WHERE nombre_usuario = $1',
            [nombre_usuario]
        );

        if (usuarioExiste.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de usuario ya existe'
            });
        }

        // Verificar si el CI ya existe
        const ciExiste = await pool.query(
            'SELECT id_persona FROM persona WHERE ci = $1',
            [persona.ci]
        );

        if (ciExiste.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'El CI ya está registrado'
            });
        }

        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(contrasena, 10);

        // Iniciar transacción
        await pool.query('BEGIN');

        try {
            // 1. Crear persona
            const personaResult = await pool.query(`
        INSERT INTO persona (nombre, apellido_paterno, apellido_materno, ci, celular, email)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id_persona
      `, [
                persona.nombre,
                persona.apellido_paterno,
                persona.apellido_materno || null,
                persona.ci,
                persona.celular || null,
                persona.email || null
            ]);

            const id_persona = personaResult.rows[0].id_persona;

            // 2. Crear usuario
            const usuarioResult = await pool.query(`
        INSERT INTO usuario (nombre_usuario, contrasena, id_rol, id_persona)
        VALUES ($1, $2, $3, $4)
        RETURNING id_usuario
      `, [nombre_usuario, hashedPassword, id_rol, id_persona]);

            const id_usuario = usuarioResult.rows[0].id_usuario;

            // Commit transacción
            await pool.query('COMMIT');

            // Obtener el usuario completo creado
            const usuarioCompleto = await pool.query(`
        SELECT 
          u.id_usuario,
          u.nombre_usuario,
          u.id_rol,
          u.id_persona,
          p.nombre,
          p.apellido_paterno,
          p.apellido_materno,
          p.ci,
          p.celular,
          p.email,
          r.nombre as rol_nombre
        FROM usuario u
        INNER JOIN persona p ON u.id_persona = p.id_persona
        LEFT JOIN rol r ON u.id_rol = r.id_rol
        WHERE u.id_usuario = $1
      `, [id_usuario]);

            res.status(201).json({
                success: true,
                message: 'Usuario creado exitosamente',
                data: usuarioCompleto.rows[0]
            });

        } catch (error) {
            // Rollback en caso de error
            await pool.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear usuario',
            error: error.message
        });
    }
});

// GET /api/usuarios/:id - Obtener un usuario por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`
      SELECT 
        u.id_usuario,
        u.nombre_usuario,
        u.fecha_fin,
        u.id_rol,
        u.id_persona,
        p.nombre,
        p.apellido_paterno,
        p.apellido_materno,
        p.ci,
        p.celular,
        p.email,
        r.nombre as rol_nombre,
        r.descripcion as rol_descripcion
      FROM usuario u
      INNER JOIN persona p ON u.id_persona = p.id_persona
      LEFT JOIN rol r ON u.id_rol = r.id_rol
      WHERE u.id_usuario = $1
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const u = result.rows[0];
        const usuario = {
            id_usuario: u.id_usuario,
            nombre_usuario: u.nombre_usuario,
            activo: !u.fecha_fin || new Date(u.fecha_fin) > new Date(),
            persona: {
                nombre: u.nombre,
                apellido_paterno: u.apellido_paterno,
                apellido_materno: u.apellido_materno,
                ci: u.ci,
                celular: u.celular,
                email: u.email
            },
            roles: u.rol_nombre ? [{ name: u.rol_nombre, descripcion: u.rol_descripcion }] : []
        };

        res.json({
            success: true,
            data: usuario
        });

    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuario',
            error: error.message
        });
    }
});

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const {
        nombre_usuario,
        contrasena,
        id_rol,
        persona
    } = req.body;

    try {
        // Validaciones
        if (!nombre_usuario || !id_rol || !persona) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos'
            });
        }

        if (!persona.nombre || !persona.apellido_paterno || !persona.ci) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos de la persona (nombre, apellido_paterno, ci)'
            });
        }

        // Verificar si el usuario existe
        const usuarioActual = await pool.query(
            'SELECT id_persona, nombre_usuario FROM usuario WHERE id_usuario = $1',
            [id]
        );

        if (usuarioActual.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar si el nuevo nombre de usuario ya existe (si cambió)
        if (nombre_usuario !== usuarioActual.rows[0].nombre_usuario) {
            const usuarioExiste = await pool.query(
                'SELECT id_usuario FROM usuario WHERE nombre_usuario = $1 AND id_usuario != $2',
                [nombre_usuario, id]
            );

            if (usuarioExiste.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre de usuario ya existe'
                });
            }
        }

        const id_persona = usuarioActual.rows[0].id_persona;

        // Verificar si el CI ya existe en otra persona
        const ciExiste = await pool.query(
            'SELECT id_persona FROM persona WHERE ci = $1 AND id_persona != $2',
            [persona.ci, id_persona]
        );

        if (ciExiste.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'El CI ya está registrado en otra persona'
            });
        }

        // Iniciar transacción
        await pool.query('BEGIN');

        try {
            // 1. Actualizar persona
            await pool.query(`
                UPDATE persona 
                SET nombre = $1, 
                    apellido_paterno = $2, 
                    apellido_materno = $3, 
                    ci = $4, 
                    celular = $5, 
                    email = $6
                WHERE id_persona = $7
            `, [
                persona.nombre,
                persona.apellido_paterno,
                persona.apellido_materno || null,
                persona.ci,
                persona.celular || null,
                persona.email || null,
                id_persona
            ]);

            // 2. Actualizar usuario
            let updateQuery = `
                UPDATE usuario 
                SET nombre_usuario = $1, 
                    id_rol = $2
            `;
            let params = [nombre_usuario, id_rol];

            // Si se proporciona nueva contraseña, hashearla y actualizarla
            if (contrasena && contrasena.trim() !== '') {
                const hashedPassword = await bcrypt.hash(contrasena, 10);
                updateQuery += `, contrasena = $3 WHERE id_usuario = $4`;
                params.push(hashedPassword, id);
            } else {
                updateQuery += ` WHERE id_usuario = $3`;
                params.push(id);
            }

            await pool.query(updateQuery, params);

            // Commit transacción
            await pool.query('COMMIT');

            // Obtener el usuario actualizado
            const usuarioActualizado = await pool.query(`
                SELECT 
                    u.id_usuario,
                    u.nombre_usuario,
                    u.id_rol,
                    u.id_persona,
                    p.nombre,
                    p.apellido_paterno,
                    p.apellido_materno,
                    p.ci,
                    p.celular,
                    p.email,
                    r.nombre as rol_nombre
                FROM usuario u
                INNER JOIN persona p ON u.id_persona = p.id_persona
                LEFT JOIN rol r ON u.id_rol = r.id_rol
                WHERE u.id_usuario = $1
            `, [id]);

            res.json({
                success: true,
                message: 'Usuario actualizado exitosamente',
                data: usuarioActualizado.rows[0]
            });

        } catch (error) {
            // Rollback en caso de error
            await pool.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar usuario',
            error: error.message
        });
    }
});

// DELETE /api/usuarios/:id - Eliminar usuario (soft delete)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar si el usuario existe
        const usuarioExiste = await pool.query(
            'SELECT id_usuario, nombre_usuario FROM usuario WHERE id_usuario = $1',
            [id]
        );

        if (usuarioExiste.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Soft delete: establecer fecha_fin
        await pool.query(
            'UPDATE usuario SET fecha_fin = CURRENT_TIMESTAMP WHERE id_usuario = $1',
            [id]
        );

        res.json({
            success: true,
            message: `Usuario "${usuarioExiste.rows[0].nombre_usuario}" desactivado exitosamente`
        });

    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar usuario',
            error: error.message
        });
    }
});

export default router;
