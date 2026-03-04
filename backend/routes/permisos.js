import express from 'express';
import pool from '../database.js';
import { verificarToken, soloAdministrador } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// RUTAS PARA DELEGADO DE MESA
// ============================================

// GET /api/permisos/delegado/mi-mesa - Obtener las mesas asignadas del delegado
router.get('/delegado/mi-mesa', verificarToken, async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;

        const result = await pool.query(`
            SELECT 
                dm.id_delegado_mesa,
                dm.id_usuario,
                dm.id_mesa,
                m.codigo as mesa_codigo,
                m.descripcion as mesa_descripcion,
                m.numero_mesa,
                m.id_recinto,
                r.nombre as recinto_nombre,
                g.nombre as distrito_nombre,
                dm.fecha_asignacion,
                dm.activo
            FROM delegado_mesa dm
            JOIN mesa m ON dm.id_mesa = m.id_mesa
            LEFT JOIN recinto r ON m.id_recinto = r.id_recinto
            LEFT JOIN geografico g ON r.id_geografico = g.id_geografico
            WHERE dm.id_usuario = $1 AND dm.activo = TRUE
            ORDER BY m.numero_mesa
        `, [id_usuario]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No tienes mesas asignadas'
            });
        }

        // Si hay solo una mesa, retornar como objeto (compatibilidad con TranscripcionNueva.jsx)
        // Si hay múltiples mesas, retornar como array (para MiMesa.jsx)
        res.json({ 
            success: true, 
            data: result.rows.length === 1 ? result.rows[0] : result.rows 
        });
    } catch (error) {
        console.error('Error al obtener mesas asignadas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener mesas asignadas',
            error: error.message
        });
    }
});

// GET /api/permisos/delegado/votos-mi-mesa - Ver votos solo de su mesa
router.get('/delegado/votos-mi-mesa', verificarToken, async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;

        const result = await pool.query(`
            SELECT 
                v.id_voto,
                v.id_acta,
                v.id_frente,
                fp.nombre as frente_nombre,
                v.cantidad,
                v.tipo_cargo,
                v.fecha_registro,
                a.fecha_registro as acta_fecha,
                a.votos_totales,
                a.votos_validos,
                a.votos_nulos,
                a.votos_blancos
            FROM voto v
            JOIN frente_politico fp ON v.id_frente = fp.id_frente
            JOIN acta a ON v.id_acta = a.id_acta
            JOIN mesa m ON a.id_mesa = m.id_mesa
            JOIN delegado_mesa dm ON m.id_mesa = dm.id_mesa
            WHERE dm.id_usuario = $1 AND dm.activo = TRUE
            ORDER BY a.fecha_registro DESC
        `, [id_usuario]);

        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error al obtener votos de mesa:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener votos de mesa',
            error: error.message
        });
    }
});

// ============================================
// RUTAS PARA JEFE DE RECINTO
// ============================================

// GET /api/permisos/jefe/mi-recinto - Obtener el recinto asignado del jefe
router.get('/jefe/mi-recinto', verificarToken, async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;

        const result = await pool.query(`
            SELECT 
                jr.id_jefe_recinto,
                jr.id_usuario,
                jr.id_recinto,
                r.nombre as recinto_nombre,
                r.direccion,
                r.id_geografico,
                g.nombre as distrito_nombre,
                jr.fecha_asignacion,
                jr.activo
            FROM jefe_recinto jr
            JOIN recinto r ON jr.id_recinto = r.id_recinto
            LEFT JOIN geografico g ON r.id_geografico = g.id_geografico
            WHERE jr.id_usuario = $1 AND jr.activo = TRUE
            LIMIT 1
        `, [id_usuario]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No tienes un recinto asignado'
            });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error al obtener recinto asignado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener recinto asignado',
            error: error.message
        });
    }
});

// GET /api/permisos/jefe/mesas-recinto - Ver mesas de su recinto
router.get('/jefe/mesas-recinto', verificarToken, async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;

        const result = await pool.query(`
            SELECT 
                m.id_mesa,
                m.codigo,
                m.descripcion,
                m.numero_mesa,
                m.id_recinto,
                r.nombre as recinto_nombre
            FROM mesa m
            JOIN recinto r ON m.id_recinto = r.id_recinto
            JOIN jefe_recinto jr ON r.id_recinto = jr.id_recinto
            WHERE jr.id_usuario = $1 AND jr.activo = TRUE
            ORDER BY m.numero_mesa ASC
        `, [id_usuario]);

        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error al obtener mesas del recinto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener mesas del recinto',
            error: error.message
        });
    }
});

// GET /api/permisos/jefe/votos-mi-recinto - Ver votos solo de su recinto
router.get('/jefe/votos-mi-recinto', verificarToken, async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;

        const result = await pool.query(`
            SELECT 
                v.id_voto,
                v.id_acta,
                v.id_frente,
                fp.nombre as frente_nombre,
                v.cantidad,
                v.tipo_cargo,
                v.fecha_registro,
                a.fecha_registro as acta_fecha,
                a.votos_totales,
                a.votos_validos,
                a.votos_nulos,
                a.votos_blancos,
                m.codigo as mesa_codigo,
                m.numero_mesa,
                m.id_mesa
            FROM voto v
            JOIN frente_politico fp ON v.id_frente = fp.id_frente
            JOIN acta a ON v.id_acta = a.id_acta
            JOIN mesa m ON a.id_mesa = m.id_mesa
            JOIN recinto r ON m.id_recinto = r.id_recinto
            JOIN jefe_recinto jr ON r.id_recinto = jr.id_recinto
            WHERE jr.id_usuario = $1 AND jr.activo = TRUE
            ORDER BY a.fecha_registro DESC, m.numero_mesa ASC
        `, [id_usuario]);

        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error al obtener votos del recinto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener votos del recinto',
            error: error.message
        });
    }
});

// ============================================
// RUTAS PARA ADMINISTRADOR - GESTIONAR ASIGNACIONES
// ============================================

// POST /api/permisos/asignar-delegado - Asignar delegado a mesa
router.post('/asignar-delegado', verificarToken, async (req, res) => {
    const { id_usuario, id_mesa } = req.body;

    try {
        // Verificar que el usuario logueado sea Administrador (id_rol=1) u Operador (id_rol=2)
        if (req.usuario.id_rol !== 1 && req.usuario.id_rol !== 2) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para asignar delegados'
            });
        }

        if (!id_usuario || !id_mesa) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos (id_usuario, id_mesa)'
            });
        }

        // Verificar que el usuario existe y tiene rol de Delegado de Mesa (id_rol = 3)
        const usuarioResult = await pool.query(
            'SELECT id_usuario, id_rol FROM usuario WHERE id_usuario = $1',
            [id_usuario]
        );

        if (usuarioResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        if (usuarioResult.rows[0].id_rol !== 3) {
            return res.status(400).json({
                success: false,
                message: 'El usuario debe tener rol de Delegado de Mesa'
            });
        }

        // Verificar que la mesa existe
        const mesaResult = await pool.query(
            'SELECT id_mesa FROM mesa WHERE id_mesa = $1',
            [id_mesa]
        );

        if (mesaResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada'
            });
        }

        // Insertar asignación
        const result = await pool.query(`
            INSERT INTO delegado_mesa (id_usuario, id_mesa, activo)
            VALUES ($1, $2, TRUE)
            ON CONFLICT (id_usuario, id_mesa) 
            DO UPDATE SET activo = TRUE
            RETURNING id_delegado_mesa, id_usuario, id_mesa, fecha_asignacion, activo
        `, [id_usuario, id_mesa]);

        res.status(201).json({
            success: true,
            message: 'Delegado asignado a mesa exitosamente',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error al asignar delegado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al asignar delegado',
            error: error.message
        });
    }
});

// POST /api/permisos/asignar-jefe - Asignar jefe a recinto
router.post('/asignar-jefe', verificarToken, async (req, res) => {
    const { id_usuario, id_recinto } = req.body;

    try {
        // Verificar que el usuario logueado sea Administrador (id_rol=1) u Operador (id_rol=2)
        if (req.usuario.id_rol !== 1 && req.usuario.id_rol !== 2) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para asignar jefes'
            });
        }

        if (!id_usuario || !id_recinto) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos (id_usuario, id_recinto)'
            });
        }

        // Verificar que el usuario existe y tiene rol de Jefe de Recinto (id_rol = 4)
        const usuarioResult = await pool.query(
            'SELECT id_usuario, id_rol FROM usuario WHERE id_usuario = $1',
            [id_usuario]
        );

        if (usuarioResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        if (usuarioResult.rows[0].id_rol !== 3 && usuarioResult.rows[0].id_rol !== 4) {
            return res.status(400).json({
                success: false,
                message: 'El usuario debe tener rol de Delegado de Mesa o Jefe de Recinto'
            });
        }

        // Verificar que el recinto existe
        const recintoResult = await pool.query(
            'SELECT id_recinto FROM recinto WHERE id_recinto = $1',
            [id_recinto]
        );

        if (recintoResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Recinto no encontrado'
            });
        }

        // Insertar asignación
        const result = await pool.query(`
            INSERT INTO jefe_recinto (id_usuario, id_recinto, activo)
            VALUES ($1, $2, TRUE)
            ON CONFLICT (id_usuario, id_recinto) 
            DO UPDATE SET activo = TRUE
            RETURNING id_jefe_recinto, id_usuario, id_recinto, fecha_asignacion, activo
        `, [id_usuario, id_recinto]);

        res.status(201).json({
            success: true,
            message: 'Jefe asignado a recinto exitosamente',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error al asignar jefe:', error);
        res.status(500).json({
            success: false,
            message: 'Error al asignar jefe',
            error: error.message
        });
    }
});

// GET /api/permisos/delegados - Obtener todos los delegados (Admin/Operador)
router.get('/delegados', verificarToken, async (req, res) => {
    // Verificar que el usuario logueado sea Administrador (id_rol=1) u Operador (id_rol=2)
    if (req.usuario.id_rol !== 1 && req.usuario.id_rol !== 2) {
        return res.status(403).json({
            success: false,
            message: 'No tienes permisos para ver delegados'
        });
    }
    try {
        const result = await pool.query(`
            SELECT 
                dm.id_delegado_mesa,
                dm.id_usuario,
                u.nombre_usuario,
                dm.id_mesa,
                m.numero_mesa,
                r.nombre as recinto,
                dm.fecha_asignacion,
                dm.activo
            FROM delegado_mesa dm
            JOIN usuario u ON dm.id_usuario = u.id_usuario
            JOIN mesa m ON dm.id_mesa = m.id_mesa
            LEFT JOIN recinto r ON m.id_recinto = r.id_recinto
            WHERE dm.activo = TRUE
            ORDER BY dm.id_usuario, m.numero_mesa
        `);

        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error al obtener delegados:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener delegados',
            error: error.message
        });
    }
});

// GET /api/permisos/jefes - Obtener todos los jefes de recinto (Admin/Operador)
router.get('/jefes', verificarToken, async (req, res) => {
    // Verificar que el usuario logueado sea Administrador (id_rol=1) u Operador (id_rol=2)
    if (req.usuario.id_rol !== 1 && req.usuario.id_rol !== 2) {
        return res.status(403).json({
            success: false,
            message: 'No tienes permisos para ver jefes'
        });
    }
    try {
        const result = await pool.query(`
            SELECT 
                jr.id_jefe_recinto,
                jr.id_usuario,
                u.nombre_usuario,
                jr.id_recinto,
                r.nombre,
                r.direccion,
                jr.fecha_asignacion,
                jr.activo,
                (SELECT COUNT(*) FROM mesa m WHERE m.id_recinto = r.id_recinto) as mesas_count
            FROM jefe_recinto jr
            JOIN usuario u ON jr.id_usuario = u.id_usuario
            JOIN recinto r ON jr.id_recinto = r.id_recinto
            WHERE jr.activo = TRUE
            ORDER BY jr.id_usuario, r.nombre
        `);

        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error al obtener jefes de recinto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener jefes de recinto',
            error: error.message
        });
    }
});

// DELETE /api/permisos/delegado/:id - Desactivar asignación de delegado
router.delete('/delegado/:id', verificarToken, async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar que el usuario logueado sea Administrador (id_rol=1) u Operador (id_rol=2)
        if (req.usuario.id_rol !== 1 && req.usuario.id_rol !== 2) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para desactivar delegados'
            });
        }
        const result = await pool.query(
            'UPDATE delegado_mesa SET activo = FALSE WHERE id_delegado_mesa = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Asignación no encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Asignación de delegado desactivada',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error al desactivar delegado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al desactivar delegado',
            error: error.message
        });
    }
});

// DELETE /api/permisos/jefe/:id - Desactivar asignación de jefe
router.delete('/jefe/:id', verificarToken, async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar que el usuario logueado sea Administrador (id_rol=1) u Operador (id_rol=2)
        if (req.usuario.id_rol !== 1 && req.usuario.id_rol !== 2) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para desactivar jefes'
            });
        }
        const result = await pool.query(
            'UPDATE jefe_recinto SET activo = FALSE WHERE id_jefe_recinto = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Asignación no encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Asignación de jefe desactivada',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error al desactivar jefe:', error);
        res.status(500).json({
            success: false,
            message: 'Error al desactivar jefe',
            error: error.message
        });
    }
});

export default router;
