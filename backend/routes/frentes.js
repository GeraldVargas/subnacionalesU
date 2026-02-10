import express from 'express';
import pool from '../database.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();

// Configuración de __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, '../uploads/logos');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|svg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, svg)'));
        }
    }
});

// Middleware de autenticación
const verificarToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    // Aquí deberías verificar el token JWT
    // Por ahora, simplemente continuamos
    next();
};

// GET - Obtener todos los frentes políticos
router.get('/', verificarToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id_frente,
                nombre,
                siglas,
                color,
                logo,
                CASE 
                    WHEN logo IS NOT NULL THEN 'http://localhost:3000/uploads/logos/' || logo
                    ELSE NULL 
                END as logo_url,
                fecha_creacion
            FROM frente_politico
            ORDER BY nombre
        `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener frentes:', error);
        res.status(500).json({ message: 'Error al obtener los frentes políticos' });
    }
});

// GET - Obtener un frente por ID
router.get('/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM frente_politico WHERE id_frente = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Frente no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener frente:', error);
        res.status(500).json({ message: 'Error al obtener el frente político' });
    }
});

// GET - Servir imagen del logo
router.get('/logo/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT logo FROM frente_politico WHERE id_frente = $1',
            [id]
        );

        if (result.rows.length === 0 || !result.rows[0].logo) {
            return res.status(404).json({ message: 'Logo no encontrado' });
        }

        const logoPath = path.join(uploadsDir, result.rows[0].logo);

        if (!fs.existsSync(logoPath)) {
            return res.status(404).json({ message: 'Archivo de logo no encontrado' });
        }

        res.sendFile(logoPath);
    } catch (error) {
        console.error('Error al obtener logo:', error);
        res.status(500).json({ message: 'Error al obtener el logo' });
    }
});

// POST - Crear nuevo frente político
router.post('/', verificarToken, upload.single('logo'), async (req, res) => {
    try {
        const { nombre, siglas, color } = req.body;
        const logo = req.file ? req.file.filename : null;

        if (!nombre) {
            return res.status(400).json({ message: 'El nombre es obligatorio' });
        }

        const result = await pool.query(
            `INSERT INTO frente_politico (nombre, siglas, color, logo)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [nombre, siglas || null, color || '#E31E24', logo]
        );

        res.status(201).json({
            message: 'Frente político creado correctamente',
            frente: result.rows[0]
        });
    } catch (error) {
        console.error('Error al crear frente:', error);

        // Si hay error, eliminar el archivo subido
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ message: 'Error al crear el frente político' });
    }
});

// PUT - Actualizar frente político
router.put('/:id', verificarToken, upload.single('logo'), async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, siglas, color } = req.body;

        // Obtener el frente actual
        const frenteActual = await pool.query(
            'SELECT logo FROM frente_politico WHERE id_frente = $1',
            [id]
        );

        if (frenteActual.rows.length === 0) {
            return res.status(404).json({ message: 'Frente no encontrado' });
        }

        let logo = frenteActual.rows[0].logo;

        // Si hay un nuevo logo, eliminar el anterior
        if (req.file) {
            if (logo) {
                const oldLogoPath = path.join(uploadsDir, logo);
                if (fs.existsSync(oldLogoPath)) {
                    fs.unlinkSync(oldLogoPath);
                }
            }
            logo = req.file.filename;
        }

        const result = await pool.query(
            `UPDATE frente_politico 
             SET nombre = $1, siglas = $2, color = $3, logo = $4
             WHERE id_frente = $5
             RETURNING *`,
            [nombre, siglas || null, color || '#E31E24', logo, id]
        );

        res.json({
            message: 'Frente político actualizado correctamente',
            frente: result.rows[0]
        });
    } catch (error) {
        console.error('Error al actualizar frente:', error);

        // Si hay error, eliminar el archivo subido
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ message: 'Error al actualizar el frente político' });
    }
});

// DELETE - Eliminar frente político
router.delete('/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener el logo antes de eliminar
        const result = await pool.query(
            'SELECT logo FROM frente_politico WHERE id_frente = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Frente no encontrado' });
        }

        const logo = result.rows[0].logo;

        // Eliminar de la base de datos
        await pool.query('DELETE FROM frente_politico WHERE id_frente = $1', [id]);

        // Eliminar el archivo del logo si existe
        if (logo) {
            const logoPath = path.join(uploadsDir, logo);
            if (fs.existsSync(logoPath)) {
                fs.unlinkSync(logoPath);
            }
        }

        res.json({ message: 'Frente político eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar frente:', error);
        res.status(500).json({ message: 'Error al eliminar el frente político' });
    }
});

export default router;
