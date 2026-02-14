import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../database.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { nombre_usuario, contrasena } = req.body;

  try {
    const result = await pool.query(
      `
      SELECT
        u.id_usuario,
        u.nombre_usuario,
        u.contrasena,
        u.id_rol,
        u.fecha_fin,
        r.nombre as rol_nombre,
        r.descripcion as rol_descripcion
      FROM usuario u
      LEFT JOIN rol r ON u.id_rol = r.id_rol
      WHERE u.nombre_usuario = $1
      `,
      [nombre_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }

    const usuario = result.rows[0];

    // Verificar si la cuenta está activa
    if (usuario.fecha_fin && new Date(usuario.fecha_fin) < new Date()) {
      return res.status(401).json({ success: false, message: 'Cuenta expirada' });
    }

    const validPassword = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      {
        id: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        rol: usuario.rol_nombre || null
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token,
        usuario: {
          id_usuario: usuario.id_usuario,
          nombre_usuario: usuario.nombre_usuario,
          id_rol: usuario.id_rol,
          rol: usuario.rol_nombre || null,
          rol_descripcion: usuario.rol_descripcion || null
        }
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
});

// GET /api/auth/me - Obtener usuario actual
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      `
      SELECT
        u.id_usuario,
        u.nombre_usuario,
        u.id_rol,
        u.fecha_fin,
        r.nombre as rol_nombre,
        r.descripcion as rol_descripcion
      FROM usuario u
      LEFT JOIN rol r ON u.id_rol = r.id_rol
      WHERE u.id_usuario = $1
      `,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const usuario = result.rows[0];

    res.json({
      success: true,
      data: {
        id_usuario: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        id_rol: usuario.id_rol,
        rol: usuario.rol_nombre || null,
        rol_descripcion: usuario.rol_descripcion || null,
        activo: !usuario.fecha_fin || new Date(usuario.fecha_fin) > new Date()
      }
    });
  } catch (error) {
    console.error('Error en /me:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido',
      error: error.message
    });
  }
});

export default router;
