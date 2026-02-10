import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import usuariosRoutes from './routes/usuarios.js';
import geograficoRoutes from './routes/geografico.js';
import frentesRoutes from './routes/frentes.js';

dotenv.config();

// Configuración de __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/geografico', geograficoRoutes);
app.use('/api/frentes', frentesRoutes);

// Ruta de prueba
app.get('/api/ping', (req, res) => {
    res.json({ message: '🏓 Pong! Backend funcionando correctamente' });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: err.message
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    console.log(`📡 Frontend permitido desde: ${process.env.FRONTEND_URL}`);
    console.log(`\n📋 Rutas disponibles:`);
    console.log(`   - GET  http://localhost:${PORT}/api/ping`);
    console.log(`   - POST http://localhost:${PORT}/api/auth/login`);
    console.log(`   - GET  http://localhost:${PORT}/api/usuarios`);
});
