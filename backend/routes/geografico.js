// backend/routes/geografico.js
import express from 'express';
import pool from '../database.js';

const router = express.Router();

/**
 * Middleware de autenticación
 * (mismo patrón que estás usando en frentes.js)
 */
const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token no proporcionado' });
  }

  // Aquí deberías verificar el JWT realmente.
  // Por ahora, seguimos como en tu proyecto.
  next();
};

/**
 * ==========================
 * ✅ RUTAS DE TIPOS (IMPORTANTE: VAN ANTES DE "/:id")
 * ==========================
 */

// GET - Listar tipos únicos existentes
router.get('/tipos', verificarToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT tipo
      FROM geografico
      WHERE tipo IS NOT NULL AND tipo <> ''
      ORDER BY tipo
    `);

    res.json({ success: true, data: result.rows.map(r => r.tipo) });
  } catch (error) {
    console.error('Error al obtener tipos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener tipos' });
  }
});

// POST - Crear tipo (no inserta registro, solo valida/normaliza para UI)
// Nota: Como "tipo" vive en registros, esta ruta solo sirve para que el frontend
// mantenga una lista (si tú decides guardarlo en otra tabla en el futuro).
router.post('/tipos', verificarToken, async (req, res) => {
  try {
    const { tipo } = req.body;

    if (!tipo || !String(tipo).trim()) {
      return res.status(400).json({ success: false, message: 'El tipo es obligatorio' });
    }

    // No hay tabla de tipos en tu esquema actual.
    // Respondemos OK para que el frontend lo agregue a su lista.
    res.json({ success: true, message: 'Tipo agregado (virtual)' });
  } catch (error) {
    console.error('Error al crear tipo:', error);
    res.status(500).json({ success: false, message: 'Error al crear tipo' });
  }
});

// POST - Reasignar tipo (cambiar todos los registros de un tipo a otro)
router.post('/tipos/reasignar', verificarToken, async (req, res) => {
  try {
    const { tipo_origen, tipo_destino } = req.body;

    if (!tipo_origen || !String(tipo_origen).trim()) {
      return res.status(400).json({ success: false, message: 'tipo_origen es obligatorio' });
    }
    if (!tipo_destino || !String(tipo_destino).trim()) {
      return res.status(400).json({ success: false, message: 'tipo_destino es obligatorio' });
    }
    if (String(tipo_origen).trim() === String(tipo_destino).trim()) {
      return res.status(400).json({ success: false, message: 'Los tipos no pueden ser iguales' });
    }

    const result = await pool.query(
      `UPDATE geografico SET tipo = $1 WHERE tipo = $2`,
      [String(tipo_destino).trim(), String(tipo_origen).trim()]
    );

    res.json({
      success: true,
      message: `Tipo reasignado correctamente (${result.rowCount} registros actualizados)`,
      data: { actualizados: result.rowCount }
    });
  } catch (error) {
    console.error('Error al reasignar tipo:', error);
    res.status(500).json({ success: false, message: 'Error al reasignar tipo' });
  }
});

// DELETE - Eliminar tipo (requiere que NO existan registros con ese tipo)
// Si quieres eliminarlo "a la fuerza", primero reasigna o borra los registros.
router.delete('/tipos/:tipo', verificarToken, async (req, res) => {
  try {
    const tipo = decodeURIComponent(req.params.tipo || '').trim();

    if (!tipo) {
      return res.status(400).json({ success: false, message: 'Tipo inválido' });
    }

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS total FROM geografico WHERE tipo = $1`,
      [tipo]
    );

    const total = countRes.rows[0]?.total ?? 0;

    if (total > 0) {
      return res.status(409).json({
        success: false,
        message: `No se puede eliminar el tipo "${tipo}" porque tiene ${total} registro(s). Reasigna o elimina esos registros primero.`,
        data: { total }
      });
    }

    // No hay una tabla "tipos", así que si no hay registros, "ya no existe".
    return res.json({
      success: true,
      message: `Tipo "${tipo}" eliminado (no había registros asociados).`
    });
  } catch (error) {
    console.error('Error al eliminar tipo:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar tipo' });
  }
});

/**
 * ==========================
 * ✅ RUTAS DE REGISTROS (CRUD)
 * ==========================
 */

// GET - Obtener todos los registros con nombre del padre
router.get('/', verificarToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        g.id_geografico,
        g.nombre,
        g.codigo,
        g.ubicacion,
        g.tipo,
        g.fk_id_geografico,
        p.nombre AS nombre_padre
      FROM geografico g
      LEFT JOIN geografico p ON p.id_geografico = g.fk_id_geografico
      ORDER BY g.id_geografico DESC
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener geografico:', error);
    res.status(500).json({ success: false, message: 'Error al obtener registros geográficos' });
  }
});

// GET - Obtener posibles padres (lista general)
router.get('/padres', verificarToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_geografico, nombre, tipo
      FROM geografico
      ORDER BY nombre
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener padres:', error);
    res.status(500).json({ success: false, message: 'Error al obtener padres' });
  }
});

// GET - Obtener un registro por ID
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        g.id_geografico,
        g.nombre,
        g.codigo,
        g.ubicacion,
        g.tipo,
        g.fk_id_geografico,
        p.nombre AS nombre_padre
      FROM geografico g
      LEFT JOIN geografico p ON p.id_geografico = g.fk_id_geografico
      WHERE g.id_geografico = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Registro no encontrado' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error al obtener registro:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el registro' });
  }
});

// POST - Crear registro
router.post('/', verificarToken, async (req, res) => {
  try {
    const { nombre, codigo, ubicacion, tipo, fk_id_geografico } = req.body;

    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
    }
    if (!tipo || !String(tipo).trim()) {
      return res.status(400).json({ success: false, message: 'El tipo es obligatorio' });
    }

    const result = await pool.query(
      `
      INSERT INTO geografico (nombre, codigo, ubicacion, tipo, fk_id_geografico)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        String(nombre).trim(),
        codigo ? String(codigo).trim() : null,
        ubicacion ? String(ubicacion).trim() : null,
        String(tipo).trim(),
        fk_id_geografico ? fk_id_geografico : null
      ]
    );

    res.status(201).json({ success: true, message: 'Registro creado', data: result.rows[0] });
  } catch (error) {
    console.error('Error al crear registro:', error);
    res.status(500).json({ success: false, message: 'Error al crear el registro' });
  }
});

// PUT - Actualizar registro
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, codigo, ubicacion, tipo, fk_id_geografico } = req.body;

    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
    }
    if (!tipo || !String(tipo).trim()) {
      return res.status(400).json({ success: false, message: 'El tipo es obligatorio' });
    }

    const result = await pool.query(
      `
      UPDATE geografico
      SET nombre = $1,
          codigo = $2,
          ubicacion = $3,
          tipo = $4,
          fk_id_geografico = $5
      WHERE id_geografico = $6
      RETURNING *
      `,
      [
        String(nombre).trim(),
        codigo ? String(codigo).trim() : null,
        ubicacion ? String(ubicacion).trim() : null,
        String(tipo).trim(),
        fk_id_geografico ? fk_id_geografico : null,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Registro no encontrado' });
    }

    res.json({ success: true, message: 'Registro actualizado', data: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar registro:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el registro' });
  }
});

// DELETE - Eliminar registro
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Evitar borrar si tiene hijos
    const hijos = await pool.query(
      `SELECT COUNT(*)::int AS total FROM geografico WHERE fk_id_geografico = $1`,
      [id]
    );

    const totalHijos = hijos.rows[0]?.total ?? 0;

    if (totalHijos > 0) {
      return res.status(409).json({
        success: false,
        message: `No se puede eliminar: este registro tiene ${totalHijos} hijo(s). Elimina o reasigna sus hijos primero.`,
        data: { totalHijos }
      });
    }

    const result = await pool.query(
      `DELETE FROM geografico WHERE id_geografico = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Registro no encontrado' });
    }

    res.json({ success: true, message: 'Registro eliminado', data: result.rows[0] });
  } catch (error) {
    console.error('Error al eliminar registro:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar el registro' });
  }
});

export default router;
