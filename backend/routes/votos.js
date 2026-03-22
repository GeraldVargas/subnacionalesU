import express from 'express';
import pool from '../database.js';
import { verificarToken, verificarRolPorId } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();

// Configuración para __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asegurar que el directorio de uploads existe
const uploadDir = path.join(__dirname, '../uploads/actas');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de multer para imágenes de actas
const storageActas = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'acta-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadActa = multer({
    storage: storageActas,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten imágenes (JPEG, PNG) o PDF'));
    }
});

// GET /api/votos - Obtener todos los registros de votos
router.get('/', verificarToken, async (req, res) => {
    try {
        const baseQuery = `
            SELECT
                a.id_acta,
                a.id_mesa,
                a.fecha_registro,
                a.votos_totales,
                a.votos_validos,
                a.votos_nulos,
                a.votos_blancos,
                a.estado,
                a.editada,
                a.fecha_ultima_edicion,
                a.imagen_url,
                a.estado_aprobacion,
                a.motivo_rechazo,
                a.fecha_aprobacion,
                a.id_usuario_aprobador,
                m.codigo as codigo_mesa,
                m.numero_mesa,
                r.nombre as nombre_recinto,
                g.nombre as nombre_geografico,
                u.nombre_usuario,
                ua.nombre_usuario as usuario_aprobador,
                te.nombre as tipo_eleccion
            FROM acta a
            INNER JOIN mesa m ON a.id_mesa = m.id_mesa
            LEFT JOIN recinto r ON m.id_recinto = r.id_recinto
            LEFT JOIN geografico g ON m.id_geografico = g.id_geografico
            LEFT JOIN usuario u ON a.id_usuario = u.id_usuario
            LEFT JOIN usuario ua ON a.id_usuario_aprobador = ua.id_usuario
            LEFT JOIN tipo_eleccion te ON a.id_tipo_eleccion = te.id_tipo_eleccion
        `;

        let query = baseQuery;
        let params = [];

        if (req.usuario.id_rol === 3) {
            query += `
                INNER JOIN delegado_mesa dm ON dm.id_mesa = a.id_mesa AND dm.id_usuario = $1 AND dm.activo = TRUE
                ORDER BY a.fecha_registro DESC
            `;
            params = [req.usuario.id_usuario];
        } else if (req.usuario.id_rol === 4) {
            query += `
                INNER JOIN jefe_recinto jr ON jr.id_recinto = m.id_recinto AND jr.id_usuario = $1 AND jr.activo = TRUE
                ORDER BY a.fecha_registro DESC
            `;
            params = [req.usuario.id_usuario];
        } else {
            query += ` ORDER BY a.fecha_registro DESC`;
        }

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Error al obtener votos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener votos',
            error: error.message
        });
    }
});

// GET /api/votos/recintos - Obtener recintos por geografico
router.get('/recintos', verificarToken, async (req, res) => {
    const { id_geografico } = req.query;

    try {
        let query = `
            SELECT 
                r.id_recinto,
                r.nombre,
                r.direccion,
                r.id_geografico,
                g.nombre as nombre_geografico,
                COUNT(DISTINCT m.id_mesa) as cantidad_mesas
            FROM recinto r
            LEFT JOIN geografico g ON r.id_geografico = g.id_geografico
            LEFT JOIN mesa m ON r.id_recinto = m.id_recinto
        `;

        const params = [];
        if (id_geografico) {
            // Buscar recintos en el nodo seleccionado + todos sus descendientes (recursivo)
            // Y también en todos sus ancestros — cubre el caso en que el recinto está
            // vinculado a un nivel superior (asiento) y se filtra por zona/distrito hijo
            query += ` WHERE r.id_geografico IN (
                WITH RECURSIVE desc_geo AS (
                    SELECT id_geografico, fk_id_geografico FROM geografico WHERE id_geografico = $1
                    UNION ALL
                    SELECT g.id_geografico, g.fk_id_geografico FROM geografico g
                    INNER JOIN desc_geo dg ON g.fk_id_geografico = dg.id_geografico
                ),
                anc_geo AS (
                    SELECT id_geografico, fk_id_geografico FROM geografico WHERE id_geografico = $1
                    UNION ALL
                    SELECT g.id_geografico, g.fk_id_geografico FROM geografico g
                    INNER JOIN anc_geo ag ON g.id_geografico = ag.fk_id_geografico
                )
                SELECT id_geografico FROM desc_geo
                UNION
                SELECT id_geografico FROM anc_geo
            )`;
            params.push(id_geografico);
        }

        query += ` GROUP BY r.id_recinto, r.nombre, r.direccion, r.id_geografico, g.nombre ORDER BY r.nombre`;

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Error al obtener recintos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener recintos',
            error: error.message
        });
    }
});

// POST /api/votos/recintos - Crear nuevo recinto
router.post('/recintos', verificarToken, async (req, res) => {
    const { nombre, direccion, id_geografico } = req.body;

    try {
        if (!nombre || !id_geografico) {
            return res.status(400).json({
                success: false,
                message: 'El nombre y el distrito son requeridos'
            });
        }

        const result = await pool.query(`
            INSERT INTO recinto (nombre, direccion, id_geografico)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [nombre, direccion, id_geografico]);

        res.json({
            success: true,
            message: 'Recinto creado exitosamente',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error al crear recinto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear recinto',
            error: error.message
        });
    }
});

// PUT /api/votos/recintos/:id - Actualizar recinto
router.put('/recintos/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const { nombre, direccion, id_geografico } = req.body;

    try {
        const result = await pool.query(`
            UPDATE recinto
            SET nombre = $1, direccion = $2, id_geografico = $3
            WHERE id_recinto = $4
            RETURNING *
        `, [nombre, direccion, id_geografico, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Recinto no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Recinto actualizado exitosamente',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error al actualizar recinto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar recinto',
            error: error.message
        });
    }
});

// DELETE /api/votos/recintos/:id - Eliminar recinto (cascade: mesas + actas + votos + imágenes)
router.delete('/recintos/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Verificar que el recinto existe
        const recintoCheck = await client.query(
            'SELECT id_recinto FROM recinto WHERE id_recinto = $1', [id]
        );
        if (recintoCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Recinto no encontrado' });
        }

        // Obtener todas las mesas del recinto
        const mesasRes = await client.query(
            'SELECT id_mesa FROM mesa WHERE id_recinto = $1', [id]
        );
        const mesaIds = mesasRes.rows.map(r => r.id_mesa);

        if (mesaIds.length > 0) {
            // Obtener imágenes de actas para eliminar archivos
            const imagenesRes = await client.query(
                `SELECT imagen_url FROM acta WHERE id_mesa = ANY($1) AND imagen_url IS NOT NULL`,
                [mesaIds]
            );
            // Eliminar votos de las actas de esas mesas
            await client.query(
                `DELETE FROM voto WHERE id_acta IN (SELECT id_acta FROM acta WHERE id_mesa = ANY($1))`,
                [mesaIds]
            );
            // Eliminar actas de esas mesas
            await client.query('DELETE FROM acta WHERE id_mesa = ANY($1)', [mesaIds]);
            // Eliminar mesas
            await client.query('DELETE FROM mesa WHERE id_recinto = $1', [id]);
            // Eliminar archivos de imagen
            imagenesRes.rows.forEach(row => {
                try {
                    const filePath = path.join(__dirname, '..', row.imagen_url);
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                } catch { /* ignorar errores de archivo */ }
            });
        }

        // Eliminar recinto
        await client.query('DELETE FROM recinto WHERE id_recinto = $1', [id]);
        await client.query('COMMIT');

        res.json({
            success: true,
            message: `Recinto eliminado junto con ${mesaIds.length} mesa(s) y sus actas`
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al eliminar recinto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar recinto',
            error: error.message
        });
    } finally {
        client.release();
    }
});

// GET /api/votos/mesas - Obtener mesas por recinto
router.get('/mesas', verificarToken, async (req, res) => {
    const { id_recinto } = req.query;

    try {
        let query = `
            SELECT 
                m.id_mesa,
                m.codigo,
                m.descripcion,
                m.numero_mesa,
                m.id_recinto,
                r.nombre as nombre_recinto,
                COUNT(DISTINCT a.id_acta) as actas_registradas
            FROM mesa m
            LEFT JOIN recinto r ON m.id_recinto = r.id_recinto
            LEFT JOIN acta a ON m.id_mesa = a.id_mesa
        `;

        const params = [];
        if (id_recinto) {
            query += ` WHERE m.id_recinto = $1`;
            params.push(id_recinto);
        }

        query += ` GROUP BY m.id_mesa, m.codigo, m.descripcion, m.numero_mesa, m.id_recinto, r.nombre ORDER BY m.numero_mesa`;

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Error al obtener mesas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener mesas',
            error: error.message
        });
    }
});

// POST /api/votos/mesas - Crear nueva mesa
router.post('/mesas', verificarToken, async (req, res) => {
    const { codigo, descripcion, numero_mesa, id_recinto } = req.body;

    try {
        if (!codigo || !numero_mesa || !id_recinto) {
            return res.status(400).json({
                success: false,
                message: 'El código, número de mesa y recinto son requeridos'
            });
        }

        // Verificar si el código ya existe
        const existingMesa = await pool.query(
            'SELECT * FROM mesa WHERE codigo = $1',
            [codigo]
        );

        if (existingMesa.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una mesa con ese código'
            });
        }

        const result = await pool.query(`
            INSERT INTO mesa (codigo, descripcion, numero_mesa, id_recinto)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [codigo, descripcion, numero_mesa, id_recinto]);

        res.json({
            success: true,
            message: 'Mesa creada exitosamente',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error al crear mesa:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear mesa',
            error: error.message
        });
    }
});

// PUT /api/votos/mesas/:id - Actualizar mesa
router.put('/mesas/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const { codigo, descripcion, numero_mesa, id_recinto } = req.body;

    try {
        // Validar que id_recinto no sea null
        if (!id_recinto) {
            return res.status(400).json({
                success: false,
                message: 'El recinto es requerido. No se puede dejar una mesa sin recinto asignado'
            });
        }

        const result = await pool.query(`
            UPDATE mesa
            SET codigo = $1, descripcion = $2, numero_mesa = $3, id_recinto = $4
            WHERE id_mesa = $5
            RETURNING *
        `, [codigo, descripcion, numero_mesa, id_recinto, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Mesa actualizada exitosamente',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error al actualizar mesa:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar mesa',
            error: error.message
        });
    }
});

// DELETE /api/votos/mesas/:id - Eliminar mesa
router.delete('/mesas/:id', verificarToken, async (req, res) => {
    const { id } = req.params;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Verificar que la mesa existe
        const mesaCheck = await client.query('SELECT id_mesa FROM mesa WHERE id_mesa = $1', [id]);
        if (mesaCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Mesa no encontrada' });
        }

        // Obtener imágenes de actas para eliminar archivos
        const imagenesRes = await client.query(
            'SELECT imagen_url FROM acta WHERE id_mesa = $1 AND imagen_url IS NOT NULL', [id]
        );
        // Eliminar votos de las actas de esta mesa
        await client.query(
            `DELETE FROM voto WHERE id_acta IN (SELECT id_acta FROM acta WHERE id_mesa = $1)`, [id]
        );
        // Eliminar actas de esta mesa
        const actasRes = await client.query('DELETE FROM acta WHERE id_mesa = $1', [id]);
        // Eliminar la mesa
        await client.query('DELETE FROM mesa WHERE id_mesa = $1', [id]);

        await client.query('COMMIT');

        // Eliminar archivos de imagen
        imagenesRes.rows.forEach(row => {
            try {
                const filePath = path.join(__dirname, '..', row.imagen_url);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            } catch { /* ignorar errores de archivo */ }
        });

        res.json({
            success: true,
            message: `Mesa eliminada junto con ${actasRes.rowCount} acta(s)`
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al eliminar mesa:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar mesa',
            error: error.message
        });
    } finally {
        client.release();
    }
});

// DELETE /api/votos/acta/:id - Eliminar una acta individual
router.delete('/acta/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const actaCheck = await client.query('SELECT id_acta, imagen_url FROM acta WHERE id_acta = $1', [id]);
        if (actaCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Acta no encontrada' });
        }

        const imagenUrl = actaCheck.rows[0].imagen_url;
        await client.query('DELETE FROM voto WHERE id_acta = $1', [id]);
        await client.query('DELETE FROM acta WHERE id_acta = $1', [id]);
        await client.query('COMMIT');

        if (imagenUrl) {
            try {
                const filePath = path.join(__dirname, '..', imagenUrl);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            } catch { /* ignorar */ }
        }

        res.json({ success: true, message: 'Acta eliminada exitosamente' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al eliminar acta:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar acta', error: error.message });
    } finally {
        client.release();
    }
});

// DELETE /api/votos/mesas/:id/actas - Eliminar todas las actas de una mesa
router.delete('/mesas/:id/actas', verificarToken, async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const mesaCheck = await client.query('SELECT id_mesa FROM mesa WHERE id_mesa = $1', [id]);
        if (mesaCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Mesa no encontrada' });
        }

        const imagenesRes = await client.query(
            'SELECT imagen_url FROM acta WHERE id_mesa = $1 AND imagen_url IS NOT NULL', [id]
        );
        await client.query(
            `DELETE FROM voto WHERE id_acta IN (SELECT id_acta FROM acta WHERE id_mesa = $1)`, [id]
        );
        const actasRes = await client.query('DELETE FROM acta WHERE id_mesa = $1', [id]);
        await client.query('COMMIT');

        imagenesRes.rows.forEach(row => {
            try {
                const filePath = path.join(__dirname, '..', row.imagen_url);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            } catch { /* ignorar */ }
        });

        res.json({
            success: true,
            message: `${actasRes.rowCount} acta(s) eliminada(s) de la mesa`
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al eliminar actas de mesa:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar actas', error: error.message });
    } finally {
        client.release();
    }
});

// GET /api/votos/frentes - Obtener todos los frentes políticos
router.get('/frentes', verificarToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id_frente,
                nombre,
                siglas,
                color,
                logo
            FROM frente_politico
            ORDER BY nombre
        `);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Error al obtener frentes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener frentes políticos',
            error: error.message
        });
    }
});

// POST /api/votos/registrar-acta - Registrar un acta completa con votos
router.post('/registrar-acta', verificarToken, uploadActa.single('imagen_acta'), async (req, res) => {
    let {
        id_mesa,
        id_tipo_eleccion,
        votos_nulos,
        votos_blancos,
        observaciones,
        votos_alcalde,
        votos_concejal
    } = req.body;
    
    // Parsear JSON strings si vienen de FormData
    if (typeof votos_alcalde === 'string') {
        try {
            votos_alcalde = JSON.parse(votos_alcalde);
        } catch {
            votos_alcalde = [];
        }
    }
    if (typeof votos_concejal === 'string') {
        try {
            votos_concejal = JSON.parse(votos_concejal);
        } catch {
            votos_concejal = [];
        }
    }

    // Asegurar que sean arrays
    votos_alcalde = Array.isArray(votos_alcalde) ? votos_alcalde : [];
    votos_concejal = Array.isArray(votos_concejal) ? votos_concejal : [];

    // Obtener id_usuario del token JWT decodificado
    const id_usuario = req.usuario?.id_usuario;
    
    if (!id_usuario) {
        return res.status(401).json({
            success: false,
            message: 'Usuario no autenticado'
        });
    }
    
    // Obtener URL de la imagen si fue subida
    const imagen_url = req.file ? `/uploads/actas/${req.file.filename}` : null;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Validaciones
        if (!id_mesa) {
            throw new Error('El ID de mesa es requerido');
        }

        // Verificar que la mesa existe
        const mesaExists = await client.query(
            'SELECT id_mesa FROM mesa WHERE id_mesa = $1',
            [id_mesa]
        );
        
        if (mesaExists.rows.length === 0) {
            throw new Error('La mesa seleccionada no existe');
        }

        // Verificar si ya existe un acta para esta mesa
        const actaExistente = await client.query(
            'SELECT id_acta, estado_aprobacion, fecha_registro FROM acta WHERE id_mesa = $1',
            [id_mesa]
        );

        if (actaExistente.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({
                success: false,
                existe: true,
                message: 'Ya existe un acta registrada para esta mesa',
                data: actaExistente.rows[0]
            });
        }

        // Calcular totales
        const votosValidosAlcalde = votos_alcalde?.reduce((sum, v) => sum + (parseInt(v.cantidad) || 0), 0) || 0;
        const votosValidosConcejal = votos_concejal?.reduce((sum, v) => sum + (parseInt(v.cantidad) || 0), 0) || 0;
        const votosValidos = votosValidosAlcalde + votosValidosConcejal;
        const votosTotales = votosValidos + (parseInt(votos_nulos) || 0) + (parseInt(votos_blancos) || 0);

        // Insertar acta
        const actaResult = await client.query(`
            INSERT INTO acta (
                id_mesa,
                id_tipo_eleccion,
                id_usuario,
                votos_totales,
                votos_validos,
                votos_nulos,
                votos_blancos,
                observaciones,
                estado,
                imagen_url
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id_acta
        `, [
            id_mesa,
            id_tipo_eleccion || 1,
            id_usuario,
            votosTotales,
            votosValidos,
            parseInt(votos_nulos) || 0,
            parseInt(votos_blancos) || 0,
            observaciones || null,
            'registrada',
            imagen_url
        ]);

        const id_acta = actaResult.rows[0].id_acta;

        // Insertar votos de alcalde
        if (votos_alcalde && votos_alcalde.length > 0) {
            for (const voto of votos_alcalde) {
                const cantidad = parseInt(voto.cantidad) || 0;
                if (cantidad > 0) {
                    await client.query(`
                        INSERT INTO voto (id_acta, id_frente, cantidad, tipo_cargo)
                        VALUES ($1, $2, $3, $4)
                    `, [id_acta, voto.id_frente, cantidad, 'alcalde']);
                }
            }
        }

        // Insertar votos de concejal
        if (votos_concejal && votos_concejal.length > 0) {
            for (const voto of votos_concejal) {
                const cantidad = parseInt(voto.cantidad) || 0;
                if (cantidad > 0) {
                    await client.query(`
                        INSERT INTO voto (id_acta, id_frente, cantidad, tipo_cargo)
                        VALUES ($1, $2, $3, $4)
                    `, [id_acta, voto.id_frente, cantidad, 'concejal']);
                }
            }
        }

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Acta registrada exitosamente',
            data: {
                id_acta,
                votos_totales: votosTotales,
                votos_validos: votosValidos
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al registrar acta:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar acta: ' + error.message,
            error: error.message
        });
    } finally {
        client.release();
    }
});

// PUT /api/votos/acta/:id - Editar un acta existente
router.put('/acta/:id', verificarToken, uploadActa.single('imagen_acta'), async (req, res) => {
    const { id } = req.params;
    let {
        votos_nulos,
        votos_blancos,
        observaciones,
        votos_alcalde,
        votos_concejal,
        estado
    } = req.body;

    // Parsear JSON strings si vienen de FormData
    if (typeof votos_alcalde === 'string') {
        try {
            votos_alcalde = JSON.parse(votos_alcalde);
        } catch {
            votos_alcalde = [];
        }
    }
    if (typeof votos_concejal === 'string') {
        try {
            votos_concejal = JSON.parse(votos_concejal);
        } catch {
            votos_concejal = [];
        }
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Verificar que el acta existe
        const actaExistente = await client.query(
            'SELECT * FROM acta WHERE id_acta = $1',
            [id]
        );

        if (actaExistente.rows.length === 0) {
            throw new Error('Acta no encontrada');
        }

        // Obtener URL de la nueva imagen si fue subida
        let imagen_url = actaExistente.rows[0].imagen_url; // Mantener la imagen anterior por defecto

        if (req.file) {
            // Si hay nueva imagen, eliminar la imagen anterior si existe
            if (imagen_url) {
                const oldImagePath = path.join(__dirname, '..', imagen_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            // Guardar la nueva imagen
            imagen_url = `/uploads/actas/${req.file.filename}`;
        }

        // Calcular totales
        const votosValidosAlcalde = (votos_alcalde || []).reduce((sum, v) => sum + (parseInt(v.cantidad) || 0), 0) || 0;
        const votosValidosConcejal = (votos_concejal || []).reduce((sum, v) => sum + (parseInt(v.cantidad) || 0), 0) || 0;
        const votosValidos = votosValidosAlcalde + votosValidosConcejal;
        const votosTotales = votosValidos + (parseInt(votos_nulos) || 0) + (parseInt(votos_blancos) || 0);

        // Actualizar el acta existente
        await client.query(`
            UPDATE acta
            SET votos_totales = $1,
                votos_validos = $2,
                votos_nulos = $3,
                votos_blancos = $4,
                observaciones = $5,
                estado = COALESCE($6, estado),
                imagen_url = $7,
                editada = TRUE,
                fecha_ultima_edicion = CURRENT_TIMESTAMP,
                estado_aprobacion = 'pendiente',
                motivo_rechazo = NULL,
                fecha_aprobacion = NULL,
                id_usuario_aprobador = NULL
            WHERE id_acta = $8
        `, [
            votosTotales,
            votosValidos,
            parseInt(votos_nulos) || 0,
            parseInt(votos_blancos) || 0,
            observaciones || null,
            estado,
            imagen_url,
            id
        ]);

        // Eliminar votos anteriores
        await client.query('DELETE FROM voto WHERE id_acta = $1', [id]);

        // Insertar nuevos votos de alcalde
        if (votos_alcalde && votos_alcalde.length > 0) {
            for (const voto of votos_alcalde) {
                const cantidad = parseInt(voto.cantidad) || 0;
                if (cantidad > 0) {
                    await client.query(`
                        INSERT INTO voto (id_acta, id_frente, cantidad, tipo_cargo)
                        VALUES ($1, $2, $3, $4)
                    `, [id, voto.id_frente, cantidad, 'alcalde']);
                }
            }
        }

        // Insertar nuevos votos de concejal
        if (votos_concejal && votos_concejal.length > 0) {
            for (const voto of votos_concejal) {
                const cantidad = parseInt(voto.cantidad) || 0;
                if (cantidad > 0) {
                    await client.query(`
                        INSERT INTO voto (id_acta, id_frente, cantidad, tipo_cargo)
                        VALUES ($1, $2, $3, $4)
                    `, [id, voto.id_frente, cantidad, 'concejal']);
                }
            }
        }

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Acta editada exitosamente',
            data: {
                id_acta: id,
                votos_totales: votosTotales,
                votos_validos: votosValidos,
                editada: true
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al editar acta:', error);
        res.status(500).json({
            success: false,
            message: 'Error al editar acta: ' + error.message,
            error: error.message
        });
    } finally {
        client.release();
    }
});

// GET /api/votos/acta/:id - Obtener detalle de un acta
router.get('/acta/:id', verificarToken, async (req, res) => {
    const { id } = req.params;

    try {
        let filtroAcceso = '';
        const params = [id];

        if (req.usuario.id_rol === 3) {
            filtroAcceso = ' AND EXISTS (SELECT 1 FROM delegado_mesa dm WHERE dm.id_mesa = a.id_mesa AND dm.id_usuario = $2 AND dm.activo = TRUE)';
            params.push(req.usuario.id_usuario);
        } else if (req.usuario.id_rol === 4) {
            filtroAcceso = ' AND EXISTS (SELECT 1 FROM jefe_recinto jr WHERE jr.id_recinto = m.id_recinto AND jr.id_usuario = $2 AND jr.activo = TRUE)';
            params.push(req.usuario.id_usuario);
        }

        // Obtener información del acta
        const actaResult = await pool.query(`
            SELECT
                a.*,
                m.codigo as codigo_mesa,
                m.numero_mesa,
                r.nombre as nombre_recinto,
                g.nombre as nombre_geografico,
                u.nombre_usuario,
                ua.nombre_usuario as usuario_aprobador,
                te.nombre as tipo_eleccion
            FROM acta a
            INNER JOIN mesa m ON a.id_mesa = m.id_mesa
            LEFT JOIN recinto r ON m.id_recinto = r.id_recinto
            LEFT JOIN geografico g ON m.id_geografico = g.id_geografico
            LEFT JOIN usuario u ON a.id_usuario = u.id_usuario
            LEFT JOIN usuario ua ON a.id_usuario_aprobador = ua.id_usuario
            LEFT JOIN tipo_eleccion te ON a.id_tipo_eleccion = te.id_tipo_eleccion
            WHERE a.id_acta = $1
            ${filtroAcceso}
        `, params);

        if (actaResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Acta no encontrada'
            });
        }

        // Obtener votos del acta
        const votosResult = await pool.query(`
            SELECT 
                v.id_voto,
                v.id_frente,
                v.cantidad,
                v.tipo_cargo,
                f.nombre as nombre_frente,
                f.siglas,
                f.color
            FROM voto v
            INNER JOIN frente_politico f ON v.id_frente = f.id_frente
            WHERE v.id_acta = $1
            ORDER BY v.tipo_cargo, f.nombre
        `, [id]);

        res.json({
            success: true,
            data: {
                acta: actaResult.rows[0],
                votos: votosResult.rows
            }
        });

    } catch (error) {
        console.error('Error al obtener acta:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener acta',
            error: error.message
        });
    }
});

// GET /api/votos/resultados-vivo - Obtener resultados en tiempo real
router.get('/resultados-vivo', async (req, res) => {

    const client = await pool.connect();
    try {
        // Set statement timeout
        await client.query('SET statement_timeout = 30000');

        // Obtener votos agregados por frente político
        const resultadosQuery = await client.query(`
            SELECT
                f.id_frente,
                f.nombre,
                f.siglas,
                f.color,
                COALESCE(SUM(v.cantidad), 0) as total_votos,
                COALESCE(SUM(CASE WHEN v.tipo_cargo = 'alcalde' THEN v.cantidad ELSE 0 END), 0) as votos_alcalde,
                COALESCE(SUM(CASE WHEN v.tipo_cargo = 'concejal' THEN v.cantidad ELSE 0 END), 0) as votos_concejal,
                COUNT(DISTINCT v.id_acta) as actas_con_votos
            FROM frente_politico f
            LEFT JOIN voto v ON f.id_frente = v.id_frente
            GROUP BY f.id_frente, f.nombre, f.siglas, f.color
            ORDER BY total_votos DESC
        `);

        // Obtener resumen de actas
        const resumenQuery = await client.query(`
            SELECT
                COUNT(*) as total_actas,
                COALESCE(SUM(votos_totales), 0) as total_votos,
                COALESCE(SUM(votos_nulos), 0) as votos_nulos,
                COALESCE(SUM(votos_blancos), 0) as votos_blancos,
                COUNT(CASE WHEN estado = 'validada' THEN 1 END) as actas_validadas
            FROM acta
        `);

        const resumen = resumenQuery.rows[0] || {
            total_actas: 0,
            total_votos: 0,
            votos_nulos: 0,
            votos_blancos: 0,
            actas_validadas: 0
        };

        res.json({
            success: true,
            data: {
                resultados: resultadosQuery.rows,
                resumen: {
                    totalActas: parseInt(resumen.total_actas) || 0,
                    totalVotos: parseInt(resumen.total_votos) || 0,
                    votosNulos: parseInt(resumen.votos_nulos) || 0,
                    votosBlancos: parseInt(resumen.votos_blancos) || 0,
                    actasValidadas: parseInt(resumen.actas_validadas) || 0
                }
            }
        });

    } catch (error) {
        console.error('Error al obtener resultados en vivo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener resultados',
            error: error.message
        });
    } finally {
        client.release();
    }
});

// POST /api/votos/acta/:id/aprobar - Aprobar un acta
router.post('/acta/:id/aprobar', verificarToken, verificarRolPorId(1, 2), async (req, res) => {
    const { id } = req.params;
    const id_usuario_aprobador = req.usuario.id_usuario;

    try {
        // Verificar que el acta existe y obtener su estado actual
        const actaResult = await pool.query(
            'SELECT id_acta, estado_aprobacion FROM acta WHERE id_acta = $1',
            [id]
        );

        if (actaResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Acta no encontrada'
            });
        }

        const estado_actual = actaResult.rows[0].estado_aprobacion;

        // Validar que el acta esté en estado pendiente antes de aprobar
        if (estado_actual === 'aprobado') {
            return res.status(409).json({
                success: false,
                message: 'El acta ya fue aprobada previamente'
            });
        }

        if (estado_actual === 'rechazado') {
            return res.status(409).json({
                success: false,
                message: 'El acta fue rechazada. Debe ser editada antes de poder aprobarla'
            });
        }

        // Actualizar estado a aprobado
        await pool.query(`
            UPDATE acta
            SET estado_aprobacion = 'aprobado',
                fecha_aprobacion = CURRENT_TIMESTAMP,
                id_usuario_aprobador = $1,
                motivo_rechazo = NULL
            WHERE id_acta = $2
        `, [id_usuario_aprobador, id]);

        res.json({
            success: true,
            message: 'Acta aprobada exitosamente'
        });

    } catch (error) {
        console.error('Error al aprobar acta:', error);
        res.status(500).json({
            success: false,
            message: 'Error al aprobar acta: ' + error.message
        });
    }
});

// POST /api/votos/acta/:id/rechazar - Rechazar un acta
router.post('/acta/:id/rechazar', verificarToken, verificarRolPorId(1, 2), async (req, res) => {
    const { id } = req.params;
    const { motivo } = req.body;
    const id_usuario_aprobador = req.usuario.id_usuario;

    try {
        // Validar que se proporcione un motivo
        if (!motivo || motivo.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'El motivo de rechazo es obligatorio'
            });
        }

        // Verificar que el acta existe y obtener su estado actual
        const actaResult = await pool.query(
            'SELECT id_acta, estado_aprobacion FROM acta WHERE id_acta = $1',
            [id]
        );

        if (actaResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Acta no encontrada'
            });
        }

        const estado_actual = actaResult.rows[0].estado_aprobacion;

        // Validar que el acta esté en estado pendiente o rechazado antes de rechazar
        if (estado_actual === 'aprobado') {
            return res.status(409).json({
                success: false,
                message: 'El acta ya fue aprobada y no puede ser rechazada. Solo actas pendientes pueden ser rechazadas'
            });
        }

        // Actualizar estado a rechazado
        await pool.query(`
            UPDATE acta
            SET estado_aprobacion = 'rechazado',
                motivo_rechazo = $1,
                fecha_aprobacion = CURRENT_TIMESTAMP,
                id_usuario_aprobador = $2
            WHERE id_acta = $3
        `, [motivo, id_usuario_aprobador, id]);

        res.json({
            success: true,
            message: 'Acta rechazada exitosamente'
        });

    } catch (error) {
        console.error('Error al rechazar acta:', error);
        res.status(500).json({
            success: false,
            message: 'Error al rechazar acta: ' + error.message
        });
    }
});

// GET /api/votos/seguimiento - Seguimiento completo de votaciones
router.get('/seguimiento', verificarToken, verificarRolPorId(1, 2), async (req, res) => {
    try {
        // Query que obtiene todas las mesas con su informacion completa
        const seguimientoQuery = await pool.query(`
            WITH RECURSIVE jerarquia AS (
                -- Caso base: obtener el nodo inicial (raiz sin padre)
                SELECT
                    id_geografico,
                    nombre,
                    tipo,
                    fk_id_geografico,
                    ARRAY[nombre::text] as ruta_nombres,
                    ARRAY[tipo::text] as ruta_tipos
                FROM geografico
                WHERE fk_id_geografico IS NULL

                UNION ALL

                -- Caso recursivo: obtener los hijos
                SELECT
                    g.id_geografico,
                    g.nombre,
                    g.tipo,
                    g.fk_id_geografico,
                    j.ruta_nombres || g.nombre::text,
                    j.ruta_tipos || g.tipo::text
                FROM geografico g
                INNER JOIN jerarquia j ON g.fk_id_geografico = j.id_geografico
            ),
            acta_ultima AS (
                -- Obtener solo la acta más reciente por mesa
                SELECT DISTINCT ON (id_mesa)
                    id_acta, id_mesa, estado_aprobacion, motivo_rechazo, fecha_registro, votos_totales
                FROM acta
                ORDER BY id_mesa, id_acta DESC
            ),
            actas_count AS (
                -- Contar total de actas por mesa
                SELECT id_mesa, COUNT(*) as cantidad_actas
                FROM acta
                GROUP BY id_mesa
            )
            SELECT
                m.id_mesa,
                m.codigo as codigo_mesa,
                m.numero_mesa,
                r.id_recinto,
                r.nombre as nombre_recinto,
                r.direccion as direccion_recinto,
                j.ruta_nombres as jerarquia_nombres,
                j.ruta_tipos as jerarquia_tipos,
                -- Extraer el distrito: buscar por tipo O por nombre que contenga 'distrito'
                COALESCE(
                    (SELECT j.ruta_nombres[idx] FROM generate_subscripts(j.ruta_tipos, 1) AS idx
                     WHERE LOWER(j.ruta_tipos[idx]) LIKE '%distrito%' LIMIT 1),
                    (SELECT j.ruta_nombres[idx] FROM generate_subscripts(j.ruta_nombres, 1) AS idx
                     WHERE LOWER(j.ruta_nombres[idx]) LIKE '%distrito%' LIMIT 1)
                ) as distrito_nombre,
                -- Informacion del delegado
                dm.id_delegado_mesa,
                ud.id_usuario as id_delegado,
                ud.nombre_usuario as nombre_delegado,
                -- Informacion del jefe de recinto
                jr.id_jefe_recinto,
                uj.id_usuario as id_jefe,
                uj.nombre_usuario as nombre_jefe,
                -- Informacion de actas
                COALESCE(ac.cantidad_actas, 0)::integer as cantidad_actas,
                au.id_acta as id_acta_ultima,
                au.estado_aprobacion,
                au.motivo_rechazo,
                au.fecha_registro,
                au.votos_totales::integer as votos_totales,
                -- Estado general de la mesa
                CASE
                    WHEN au.id_acta IS NULL THEN 'sin_acta'
                    WHEN au.estado_aprobacion = 'aprobado' THEN 'aprobado'
                    WHEN au.estado_aprobacion = 'rechazado' THEN 'rechazado'
                    ELSE 'pendiente'
                END as estado_mesa
            FROM mesa m
            INNER JOIN recinto r ON m.id_recinto = r.id_recinto
            INNER JOIN jerarquia j ON r.id_geografico = j.id_geografico
            LEFT JOIN acta_ultima au ON m.id_mesa = au.id_mesa
            LEFT JOIN actas_count ac ON m.id_mesa = ac.id_mesa
            LEFT JOIN delegado_mesa dm ON m.id_mesa = dm.id_mesa AND dm.activo = TRUE
            LEFT JOIN usuario ud ON dm.id_usuario = ud.id_usuario
            LEFT JOIN jefe_recinto jr ON r.id_recinto = jr.id_recinto AND jr.activo = TRUE
            LEFT JOIN usuario uj ON jr.id_usuario = uj.id_usuario
            ORDER BY r.nombre, m.numero_mesa
        `);

        // Calcular estadisticas generales
        const estadisticas = {
            total_mesas: seguimientoQuery.rows.length,
            mesas_con_acta: seguimientoQuery.rows.filter(m => parseInt(m.cantidad_actas) > 0).length,
            mesas_sin_acta: seguimientoQuery.rows.filter(m => parseInt(m.cantidad_actas) === 0).length,
            actas_pendientes: seguimientoQuery.rows.filter(m => m.estado_aprobacion === 'pendiente' || (parseInt(m.cantidad_actas) > 0 && !m.estado_aprobacion)).length,
            actas_aprobadas: seguimientoQuery.rows.filter(m => m.estado_aprobacion === 'aprobado').length,
            actas_rechazadas: seguimientoQuery.rows.filter(m => m.estado_aprobacion === 'rechazado').length
        };

        res.json({
            success: true,
            data: {
                mesas: seguimientoQuery.rows,
                estadisticas
            }
        });

    } catch (error) {
        console.error('Error al obtener seguimiento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener seguimiento: ' + error.message
        });
    }
});

export default router;
