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

    res.json({ success: true, data: result.rows });
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
        r.nombre as rol_nombre,
        r.descripcion as rol_descripcion
      FROM usuario u
      LEFT JOIN rol r ON u.id_rol = r.id_rol
      ORDER BY u.id_usuario DESC
    `);

    const usuarios = result.rows.map(u => ({
      id_usuario: u.id_usuario,
      nombre_usuario: u.nombre_usuario,
      id_rol: u.id_rol,
      activo: !u.fecha_fin || new Date(u.fecha_fin) > new Date(),
      rol: u.rol_nombre
        ? { nombre: u.rol_nombre, descripcion: u.rol_descripcion }
        : null
    }));

    res.json({ success: true, data: usuarios });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
});

// POST /api/usuarios - Crear nuevo usuario (solo nombre_usuario, contrasena, id_rol)
router.post('/', async (req, res) => {
  let { nombre_usuario, contrasena, id_rol } = req.body;

  id_rol = parseInt(id_rol, 10);

  try {
    if (!nombre_usuario || !contrasena) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos (nombre_usuario, contrasena)'
      });
    }

    if (isNaN(id_rol) || !id_rol) {
      return res.status(400).json({
        success: false,
        message: 'El ID del rol no es válido'
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

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Crear usuario
    const usuarioResult = await pool.query(
      `
      INSERT INTO usuario (nombre_usuario, contrasena, id_rol)
      VALUES ($1, $2, $3)
      RETURNING id_usuario, nombre_usuario, id_rol, fecha_fin
      `,
      [nombre_usuario, hashedPassword, id_rol]
    );

    // Traer rol para devolverlo bonito
    const rolResult = await pool.query(
      `SELECT nombre, descripcion FROM rol WHERE id_rol = $1`,
      [id_rol]
    );

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        ...usuarioResult.rows[0],
        activo: true,
        rol: rolResult.rows[0] || null
      }
    });
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
    const result = await pool.query(
      `
      SELECT
        u.id_usuario,
        u.nombre_usuario,
        u.fecha_fin,
        u.id_rol,
        r.nombre as rol_nombre,
        r.descripcion as rol_descripcion
      FROM usuario u
      LEFT JOIN rol r ON u.id_rol = r.id_rol
      WHERE u.id_usuario = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const u = result.rows[0];

    res.json({
      success: true,
      data: {
        id_usuario: u.id_usuario,
        nombre_usuario: u.nombre_usuario,
        id_rol: u.id_rol,
        activo: !u.fecha_fin || new Date(u.fecha_fin) > new Date(),
        rol: u.rol_nombre ? { nombre: u.rol_nombre, descripcion: u.rol_descripcion } : null
      }
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

// PUT /api/usuarios/:id - Actualizar usuario (nombre_usuario, id_rol y opcional contrasena)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  let { nombre_usuario, contrasena, id_rol } = req.body;

  id_rol = parseInt(id_rol, 10);

  try {
    if (!nombre_usuario) {
      return res.status(400).json({
        success: false,
        message: 'Falta nombre_usuario'
      });
    }

    if (isNaN(id_rol) || !id_rol) {
      return res.status(400).json({
        success: false,
        message: 'El ID del rol no es válido'
      });
    }

    const usuarioActual = await pool.query(
      'SELECT id_usuario, nombre_usuario FROM usuario WHERE id_usuario = $1',
      [id]
    );

    if (usuarioActual.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Si cambió nombre_usuario, validar duplicado
    if (nombre_usuario !== usuarioActual.rows[0].nombre_usuario) {
      const existe = await pool.query(
        'SELECT id_usuario FROM usuario WHERE nombre_usuario = $1 AND id_usuario != $2',
        [nombre_usuario, id]
      );
      if (existe.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'El nombre de usuario ya existe' });
      }
    }

    // Armar update dinámico
    let updateQuery = `
      UPDATE usuario
      SET nombre_usuario = $1,
          id_rol = $2
    `;
    const params = [nombre_usuario, id_rol];

    if (contrasena && contrasena.trim() !== '') {
      const hashedPassword = await bcrypt.hash(contrasena, 10);
      updateQuery += `, contrasena = $3 WHERE id_usuario = $4 RETURNING id_usuario, nombre_usuario, id_rol, fecha_fin`;
      params.push(hashedPassword, id);
    } else {
      updateQuery += ` WHERE id_usuario = $3 RETURNING id_usuario, nombre_usuario, id_rol, fecha_fin`;
      params.push(id);
    }

    const updated = await pool.query(updateQuery, params);

    const rolResult = await pool.query(
      `SELECT nombre, descripcion FROM rol WHERE id_rol = $1`,
      [id_rol]
    );

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: {
        ...updated.rows[0],
        activo: !updated.rows[0].fecha_fin || new Date(updated.rows[0].fecha_fin) > new Date(),
        rol: rolResult.rows[0] || null
      }
    });
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
// DELETE /api/usuarios/:id - Eliminar usuario (BORRADO REAL)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si existe
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

    // Borrado real
    await pool.query('DELETE FROM usuario WHERE id_usuario = $1', [id]);

    res.json({
      success: true,
      message: `Usuario "${usuarioExiste.rows[0].nombre_usuario}" eliminado definitivamente`
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
