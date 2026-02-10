# 💻 EJEMPLOS PRÁCTICOS DE CÓDIGO

## 📚 ÍNDICE DE EJEMPLOS

1. [Autenticación y Tokens](#autenticación-y-tokens)
2. [Operaciones CRUD](#operaciones-crud)
3. [Subida de Archivos](#subida-de-archivos)
4. [Transacciones en PostgreSQL](#transacciones-en-postgresql)
5. [Validaciones](#validaciones)
6. [Manejo de Errores](#manejo-de-errores)
7. [Componentes React](#componentes-react)

---

## 🔐 AUTENTICACIÓN Y TOKENS

### **Backend: Generar Token JWT**

```javascript
// backend/routes/auth.js
import jwt from 'jsonwebtoken';

// Generar token después de validar credenciales
const token = jwt.sign(
    {
        id: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        rol: usuario.rol_nombre
    },
    process.env.JWT_SECRET,  // Clave secreta del .env
    { expiresIn: '24h' }     // Token válido por 24 horas
);

// Retornar al frontend
res.json({
    success: true,
    data: {
        token,
        usuario: {...}
    }
});
```

### **Backend: Verificar Token**

```javascript
// Middleware de autenticación
const verificarToken = (req, res, next) => {
    // Extraer token del header Authorization
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ 
            message: 'Token no proporcionado' 
        });
    }
    
    try {
        // Verificar y decodificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Agregar datos del usuario al request
        req.usuario = decoded;
        
        // Continuar con el siguiente middleware
        next();
    } catch (error) {
        return res.status(401).json({ 
            message: 'Token inválido' 
        });
    }
};

// Usar en rutas protegidas
router.get('/protegida', verificarToken, async (req, res) => {
    // req.usuario contiene los datos del token
    console.log(req.usuario.id);
    console.log(req.usuario.rol);
});
```

### **Frontend: Guardar y Usar Token**

```javascript
// src/pages/Login.jsx

// Guardar token después del login
const handleLogin = async (e) => {
    e.preventDefault();
    
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_usuario, contrasena })
    });
    
    const data = await response.json();
    
    if (data.success) {
        // Guardar en localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('usuario', JSON.stringify(data.data.usuario));
        
        // Redirigir al dashboard
        navigate('/dashboard');
    }
};

// Usar token en requests
const fetchUsuarios = async () => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/usuarios`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    const data = await response.json();
    return data;
};
```

---

## 📝 OPERACIONES CRUD

### **Backend: GET - Listar con JOIN**

```javascript
// backend/routes/usuarios.js

router.get('/', async (req, res) => {
    try {
        // Query con JOIN de múltiples tablas
        const result = await pool.query(`
            SELECT 
                u.id_usuario,
                u.nombre_usuario,
                u.fecha_fin,
                p.nombre,
                p.apellido_paterno,
                p.ci,
                r.nombre as rol_nombre
            FROM usuario u
            INNER JOIN persona p ON u.id_persona = p.id_persona
            LEFT JOIN rol r ON u.id_rol = r.id_rol
            ORDER BY u.id_usuario DESC
        `);
        
        // Formatear respuesta
        const usuarios = result.rows.map(u => ({
            id_usuario: u.id_usuario,
            nombre_usuario: u.nombre_usuario,
            activo: !u.fecha_fin || new Date(u.fecha_fin) > new Date(),
            persona: {
                nombre: u.nombre,
                apellido_paterno: u.apellido_paterno,
                ci: u.ci
            },
            rol: u.rol_nombre
        }));
        
        res.json({
            success: true,
            data: usuarios
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios'
        });
    }
});
```

### **Backend: POST - Crear con Validaciones**

```javascript
router.post('/', async (req, res) => {
    const { nombre_usuario, contrasena, id_rol, persona } = req.body;
    
    try {
        // 1. Validar campos requeridos
        if (!nombre_usuario || !contrasena || !id_rol) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos'
            });
        }
        
        // 2. Verificar que no exista
        const existe = await pool.query(
            'SELECT id_usuario FROM usuario WHERE nombre_usuario = $1',
            [nombre_usuario]
        );
        
        if (existe.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'El usuario ya existe'
            });
        }
        
        // 3. Hashear contraseña
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        
        // 4. Insertar en BD
        const result = await pool.query(`
            INSERT INTO usuario (nombre_usuario, contrasena, id_rol)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [nombre_usuario, hashedPassword, id_rol]);
        
        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear usuario'
        });
    }
});
```

### **Backend: PUT - Actualizar**

```javascript
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido_paterno, ci } = req.body;
    
    try {
        // Verificar que existe
        const existe = await pool.query(
            'SELECT id_persona FROM persona WHERE id_persona = $1',
            [id]
        );
        
        if (existe.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Registro no encontrado'
            });
        }
        
        // Actualizar
        const result = await pool.query(`
            UPDATE persona
            SET nombre = $1,
                apellido_paterno = $2,
                ci = $3
            WHERE id_persona = $4
            RETURNING *
        `, [nombre, apellido_paterno, ci, id]);
        
        res.json({
            success: true,
            message: 'Actualizado exitosamente',
            data: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar'
        });
    }
});
```

### **Backend: DELETE - Soft Delete**

```javascript
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        // Soft delete: marcar como inactivo
        const result = await pool.query(`
            UPDATE usuario
            SET fecha_fin = CURRENT_TIMESTAMP
            WHERE id_usuario = $1
            RETURNING nombre_usuario
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: `Usuario "${result.rows[0].nombre_usuario}" desactivado`
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar'
        });
    }
});
```

### **Frontend: Fetch con Estado**

```javascript
// src/pages/GestionUsuarios.jsx

const [usuarios, setUsuarios] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

const cargarUsuarios = async () => {
    try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_URL}/usuarios`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            setUsuarios(data.data);
        } else {
            setError(data.message);
        }
        
    } catch (err) {
        setError('Error al cargar usuarios');
        console.error(err);
    } finally {
        setLoading(false);
    }
};

// Cargar al montar el componente
useEffect(() => {
    cargarUsuarios();
}, []);
```

---

## 📤 SUBIDA DE ARCHIVOS

### **Backend: Configurar Multer**

```javascript
// backend/routes/frentes.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Crear directorio si no existe
const uploadsDir = path.join(__dirname, '../uploads/logos');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generar nombre único
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'logo-' + uniqueSuffix + ext);
    }
});

// Configurar multer con validaciones
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024  // 5MB máximo
    },
    fileFilter: (req, file, cb) => {
        // Solo imágenes
        const allowedTypes = /jpeg|jpg|png|gif|svg/;
        const extname = allowedTypes.test(
            path.extname(file.originalname).toLowerCase()
        );
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes'));
        }
    }
});
```

### **Backend: Endpoint con Multer**

```javascript
// POST con archivo
router.post('/', upload.single('logo'), async (req, res) => {
    try {
        const { nombre, siglas, color } = req.body;
        
        // req.file contiene la información del archivo
        const logo = req.file ? req.file.filename : null;
        
        // Insertar en BD
        const result = await pool.query(`
            INSERT INTO frente_politico (nombre, siglas, color, logo)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [nombre, siglas, color, logo]);
        
        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
        
    } catch (error) {
        // Si hay error, eliminar el archivo subido
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            success: false,
            message: 'Error al crear frente'
        });
    }
});

// DELETE con eliminación de archivo
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        // Obtener nombre del logo
        const result = await pool.query(
            'SELECT logo FROM frente_politico WHERE id_frente = $1',
            [id]
        );
        
        const logo = result.rows[0]?.logo;
        
        // Eliminar de BD
        await pool.query('DELETE FROM frente_politico WHERE id_frente = $1', [id]);
        
        // Eliminar archivo del disco
        if (logo) {
            const logoPath = path.join(uploadsDir, logo);
            if (fs.existsSync(logoPath)) {
                fs.unlinkSync(logoPath);
            }
        }
        
        res.json({
            success: true,
            message: 'Frente eliminado'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar'
        });
    }
});
```

### **Frontend: Subir Archivo**

```javascript
// src/pages/FrentesPoliticos.jsx

const [nuevoFrente, setNuevoFrente] = useState({
    nombre: '',
    siglas: '',
    color: '#E31E24',
    logo: null
});
const [previewImagen, setPreviewImagen] = useState(null);

// Manejar selección de archivo
const handleImagenChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
        // Validar tamaño
        if (file.size > 5 * 1024 * 1024) {
            alert('La imagen no debe superar los 5MB');
            return;
        }
        
        // Validar tipo
        if (!file.type.startsWith('image/')) {
            alert('Solo se permiten imágenes');
            return;
        }
        
        // Guardar archivo
        setNuevoFrente({ ...nuevoFrente, logo: file });
        
        // Crear preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImagen(reader.result);
        };
        reader.readAsDataURL(file);
    }
};

// Enviar formulario con archivo
const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
        const token = localStorage.getItem('token');
        
        // Crear FormData
        const formData = new FormData();
        formData.append('nombre', nuevoFrente.nombre);
        formData.append('siglas', nuevoFrente.siglas);
        formData.append('color', nuevoFrente.color);
        
        if (nuevoFrente.logo) {
            formData.append('logo', nuevoFrente.logo);
        }
        
        // Enviar (NO incluir Content-Type, el navegador lo hace)
        const response = await fetch(`${API_URL}/frentes`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // NO incluir 'Content-Type'
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Frente creado exitosamente');
            cargarFrente();
            cerrarModal();
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al crear frente');
    }
};

// JSX del input
<input
    type="file"
    accept="image/*"
    onChange={handleImagenChange}
    className="hidden"
/>

{/* Preview */}
{previewImagen && (
    <img 
        src={previewImagen} 
        alt="Preview" 
        className="max-h-48 rounded-lg"
    />
)}
```

---

## 🔄 TRANSACCIONES EN POSTGRESQL

### **Transacción Básica**

```javascript
// backend/routes/usuarios.js

router.post('/', async (req, res) => {
    const { nombre_usuario, contrasena, persona } = req.body;
    
    try {
        // Iniciar transacción
        await pool.query('BEGIN');
        
        try {
            // 1. Crear persona
            const personaResult = await pool.query(`
                INSERT INTO persona (nombre, apellido_paterno, ci)
                VALUES ($1, $2, $3)
                RETURNING id_persona
            `, [persona.nombre, persona.apellido_paterno, persona.ci]);
            
            const id_persona = personaResult.rows[0].id_persona;
            
            // 2. Crear usuario
            const hashedPassword = await bcrypt.hash(contrasena, 10);
            
            const usuarioResult = await pool.query(`
                INSERT INTO usuario (nombre_usuario, contrasena, id_persona)
                VALUES ($1, $2, $3)
                RETURNING id_usuario
            `, [nombre_usuario, hashedPassword, id_persona]);
            
            // Confirmar transacción
            await pool.query('COMMIT');
            
            res.status(201).json({
                success: true,
                message: 'Usuario creado exitosamente'
            });
            
        } catch (error) {
            // Revertir cambios si hay error
            await pool.query('ROLLBACK');
            throw error;
        }
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear usuario'
        });
    }
});
```

### **Transacción con Múltiples Operaciones**

```javascript
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre_usuario, contrasena, persona } = req.body;
    
    await pool.query('BEGIN');
    
    try {
        // 1. Actualizar persona
        await pool.query(`
            UPDATE persona
            SET nombre = $1,
                apellido_paterno = $2,
                ci = $3
            WHERE id_persona = (
                SELECT id_persona FROM usuario WHERE id_usuario = $4
            )
        `, [persona.nombre, persona.apellido_paterno, persona.ci, id]);
        
        // 2. Actualizar usuario
        let updateQuery = 'UPDATE usuario SET nombre_usuario = $1';
        let params = [nombre_usuario];
        
        // 3. Si hay nueva contraseña, actualizarla
        if (contrasena && contrasena.trim() !== '') {
            const hashedPassword = await bcrypt.hash(contrasena, 10);
            updateQuery += ', contrasena = $2 WHERE id_usuario = $3';
            params.push(hashedPassword, id);
        } else {
            updateQuery += ' WHERE id_usuario = $2';
            params.push(id);
        }
        
        await pool.query(updateQuery, params);
        
        // 4. Confirmar todas las operaciones
        await pool.query('COMMIT');
        
        res.json({
            success: true,
            message: 'Usuario actualizado exitosamente'
        });
        
    } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
    }
});
```

---

## ✅ VALIDACIONES

### **Backend: Validaciones Completas**

```javascript
router.post('/', async (req, res) => {
    const { nombre, codigo, tipo, fk_id_geografico } = req.body;
    
    try {
        // 1. Validar campos requeridos
        if (!nombre || !tipo) {
            return res.status(400).json({
                success: false,
                message: 'El nombre y tipo son requeridos'
            });
        }
        
        // 2. Validar formato de código
        if (codigo && !/^[A-Z0-9-]+$/.test(codigo)) {
            return res.status(400).json({
                success: false,
                message: 'El código solo puede contener letras mayúsculas, números y guiones'
            });
        }
        
        // 3. Validar que no exista duplicado
        const existe = await pool.query(
            'SELECT id_geografico FROM geografico WHERE nombre = $1 AND tipo = $2',
            [nombre, tipo]
        );
        
        if (existe.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un registro con ese nombre y tipo'
            });
        }
        
        // 4. Validar que el padre exista (si se proporciona)
        if (fk_id_geografico) {
            const padreExiste = await pool.query(
                'SELECT id_geografico FROM geografico WHERE id_geografico = $1',
                [fk_id_geografico]
            );
            
            if (padreExiste.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El registro padre no existe'
                });
            }
        }
        
        // 5. Crear registro
        const result = await pool.query(`
            INSERT INTO geografico (nombre, codigo, tipo, fk_id_geografico)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [nombre, codigo || null, tipo, fk_id_geografico || null]);
        
        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear registro'
        });
    }
});
```

### **Frontend: Validaciones en Formulario**

```javascript
const [errores, setErrores] = useState({});

const validarFormulario = () => {
    const nuevosErrores = {};
    
    // Validar nombre de usuario
    if (!nuevoUsuario.nombre_usuario.trim()) {
        nuevosErrores.nombre_usuario = 'El nombre de usuario es requerido';
    } else if (nuevoUsuario.nombre_usuario.length < 3) {
        nuevosErrores.nombre_usuario = 'Debe tener al menos 3 caracteres';
    } else if (!/^[a-zA-Z0-9_]+$/.test(nuevoUsuario.nombre_usuario)) {
        nuevosErrores.nombre_usuario = 'Solo letras, números y guión bajo';
    }
    
    // Validar contraseña
    if (!modoEdicion && !nuevoUsuario.contrasena) {
        nuevosErrores.contrasena = 'La contraseña es requerida';
    } else if (nuevoUsuario.contrasena && nuevoUsuario.contrasena.length < 6) {
        nuevosErrores.contrasena = 'Debe tener al menos 6 caracteres';
    }
    
    // Validar CI
    if (!nuevoUsuario.persona.ci.trim()) {
        nuevosErrores.ci = 'El CI es requerido';
    } else if (!/^\d{7,10}$/.test(nuevoUsuario.persona.ci)) {
        nuevosErrores.ci = 'CI inválido (7-10 dígitos)';
    }
    
    // Validar email
    if (nuevoUsuario.persona.email && 
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoUsuario.persona.email)) {
        nuevosErrores.email = 'Email inválido';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
};

const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar antes de enviar
    if (!validarFormulario()) {
        return;
    }
    
    // Continuar con el envío...
};

// Mostrar errores en el JSX
<input
    type="text"
    name="nombre_usuario"
    value={nuevoUsuario.nombre_usuario}
    onChange={handleInputChange}
    className={`w-full px-4 py-2 border rounded-lg ${
        errores.nombre_usuario ? 'border-red-500' : 'border-gray-300'
    }`}
/>
{errores.nombre_usuario && (
    <p className="text-red-500 text-sm mt-1">
        {errores.nombre_usuario}
    </p>
)}
```

---

## 🚨 MANEJO DE ERRORES

### **Backend: Try-Catch Completo**

```javascript
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        // Validar ID
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }
        
        const result = await pool.query(
            'SELECT * FROM usuario WHERE id_usuario = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        
        // Diferentes tipos de errores
        if (error.code === '23505') {  // Violación de unique constraint
            return res.status(400).json({
                success: false,
                message: 'Ya existe un registro con esos datos'
            });
        }
        
        if (error.code === '23503') {  // Violación de foreign key
            return res.status(400).json({
                success: false,
                message: 'Referencia inválida'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
```

### **Frontend: Manejo de Errores en Fetch**

```javascript
const cargarDatos = async () => {
    try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/usuarios`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        // Verificar status HTTP
        if (!response.ok) {
            if (response.status === 401) {
                // Token inválido o expirado
                localStorage.removeItem('token');
                navigate('/');
                return;
            }
            
            if (response.status === 403) {
                throw new Error('No tienes permisos para esta acción');
            }
            
            if (response.status === 404) {
                throw new Error('Recurso no encontrado');
            }
            
            throw new Error('Error en el servidor');
        }
        
        const data = await response.json();
        
        if (data.success) {
            setUsuarios(data.data);
        } else {
            throw new Error(data.message || 'Error desconocido');
        }
        
    } catch (error) {
        console.error('Error:', error);
        
        // Diferentes tipos de errores
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            setError('No se puede conectar con el servidor');
        } else {
            setError(error.message);
        }
        
    } finally {
        setLoading(false);
    }
};
```

---

## ⚛️ COMPONENTES REACT

### **Hook Personalizado para Fetch**

```javascript
// src/hooks/useFetch.js
import { useState, useEffect } from 'react';

export const useFetch = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    setData(result.data);
                } else {
                    setError(result.message);
                }
                
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [url]);
    
    return { data, loading, error };
};

// Uso:
const { data: usuarios, loading, error } = useFetch(`${API_URL}/usuarios`);
```

### **Componente de Tabla Reutilizable**

```javascript
// src/components/Tabla.jsx
const Tabla = ({ columnas, datos, onEditar, onEliminar }) => {
    return (
        <table className="w-full">
            <thead>
                <tr>
                    {columnas.map(col => (
                        <th key={col.key}>{col.label}</th>
                    ))}
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {datos.map(fila => (
                    <tr key={fila.id}>
                        {columnas.map(col => (
                            <td key={col.key}>
                                {col.render 
                                    ? col.render(fila[col.key], fila)
                                    : fila[col.key]
                                }
                            </td>
                        ))}
                        <td>
                            <button onClick={() => onEditar(fila)}>
                                Editar
                            </button>
                            <button onClick={() => onEliminar(fila)}>
                                Eliminar
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

// Uso:
const columnas = [
    { key: 'nombre_usuario', label: 'Usuario' },
    { 
        key: 'activo', 
        label: 'Estado',
        render: (valor) => valor ? 'Activo' : 'Inactivo'
    }
];

<Tabla 
    columnas={columnas}
    datos={usuarios}
    onEditar={abrirModalEditar}
    onEliminar={eliminarUsuario}
/>
```

---

Estos ejemplos cubren los patrones más comunes del sistema. ¿Necesitas ver algún ejemplo específico más detallado? 🚀
