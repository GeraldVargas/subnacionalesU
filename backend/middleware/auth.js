import jwt from 'jsonwebtoken';

// Middleware para verificar JWT
export const verificarToken = (req, res, next) => {
    try {
        // Extraer token del header Authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verificar y decodificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Agregar información del usuario al request
        req.usuario = {
            id_usuario: decoded.id,
            nombre_usuario: decoded.nombre_usuario,
            rol: decoded.rol
        };

        next();
    } catch (error) {
        console.error('Error al verificar token:', error);
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado',
            error: error.message
        });
    }
};

// Middleware para verificar roles específicos
export const verificarRol = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para realizar esta acción'
            });
        }

        next();
    };
};
