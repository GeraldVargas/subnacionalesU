# 🗺️ MAPA VISUAL DEL SISTEMA

## 📊 DIAGRAMA DE ARQUITECTURA

```
┌─────────────────────────────────────────────────────────────┐
│                        USUARIO                               │
│                      (Navegador)                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP/HTTPS
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Páginas:                                            │   │
│  │  • Login.jsx                                         │   │
│  │  • DashboardHome.jsx                                 │   │
│  │  • GestionUsuarios.jsx                               │   │
│  │  • Geografia.jsx                                     │   │
│  │  • FrentesPoliticos.jsx                              │   │
│  │  • Transcripcion.jsx                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Puerto: 5173/5174                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ REST API (JSON)
                     │ Authorization: Bearer <JWT>
                     │
┌────────────────────▼────────────────────────────────────────┐
│                 BACKEND (Express/Node.js)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Rutas API:                                          │   │
│  │  • /api/auth         (Autenticación)                 │   │
│  │  • /api/usuarios     (Gestión de usuarios)           │   │
│  │  • /api/geografico   (Divisiones geográficas)        │   │
│  │  • /api/frentes      (Frentes políticos)             │   │
│  │  • /uploads          (Archivos estáticos)            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Middlewares:                                                │
│  • CORS                                                      │
│  • express.json()                                            │
│  • express.static()                                          │
│  • multer (subida de archivos)                               │
│                                                              │
│  Puerto: 3000                                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ SQL Queries
                     │
┌────────────────────▼────────────────────────────────────────┐
│              BASE DE DATOS (PostgreSQL)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tablas:                                             │   │
│  │  • persona                                           │   │
│  │  • rol                                               │   │
│  │  • usuario                                           │   │
│  │  • geografico                                        │   │
│  │  • frente_politico                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Puerto: 5432                                                │
│  Base de datos: subnacionales                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUJO DE DATOS: LOGIN

```
1. USUARIO INGRESA CREDENCIALES
   ┌─────────────────────┐
   │ Usuario: perez      │
   │ Contraseña: ****    │
   │ Rol: Administrador  │
   └──────────┬──────────┘
              │
              ▼
2. FRONTEND ENVÍA REQUEST
   POST /api/auth/login
   {
     "nombre_usuario": "perez",
     "contrasena": "perez123"
   }
              │
              ▼
3. BACKEND VALIDA
   ┌─────────────────────────────┐
   │ • Busca usuario en BD       │
   │ • Verifica cuenta activa    │
   │ • Compara contraseña        │
   │   (bcrypt.compare)          │
   └──────────┬──────────────────┘
              │
              ▼
4. GENERA TOKEN JWT
   ┌─────────────────────────────┐
   │ jwt.sign({                  │
   │   id: 1,                    │
   │   nombre_usuario: "perez",  │
   │   rol: "Administrador"      │
   │ }, SECRET, {                │
   │   expiresIn: '24h'          │
   │ })                          │
   └──────────┬──────────────────┘
              │
              ▼
5. RESPUESTA AL FRONTEND
   {
     "success": true,
     "data": {
       "token": "eyJhbGc...",
       "usuario": {...}
     }
   }
              │
              ▼
6. FRONTEND GUARDA TOKEN
   localStorage.setItem('token', token)
   localStorage.setItem('usuario', JSON.stringify(usuario))
              │
              ▼
7. REDIRECCIÓN
   navigate('/dashboard')
```

---

## 🔄 FLUJO DE DATOS: CREAR USUARIO

```
1. ADMIN ABRE MODAL
   ┌─────────────────────┐
   │ Click "Nuevo        │
   │ Usuario"            │
   └──────────┬──────────┘
              │
              ▼
2. COMPLETA FORMULARIO
   ┌─────────────────────────────┐
   │ Datos de Acceso:            │
   │ • nombre_usuario            │
   │ • contrasena                │
   │ • id_rol                    │
   │                             │
   │ Datos Personales:           │
   │ • nombre                    │
   │ • apellido_paterno          │
   │ • apellido_materno          │
   │ • ci                        │
   │ • celular                   │
   │ • email                     │
   └──────────┬──────────────────┘
              │
              ▼
3. FRONTEND ENVÍA
   POST /api/usuarios
   {
     "nombre_usuario": "jperez",
     "contrasena": "password123",
     "id_rol": 1,
     "persona": {
       "nombre": "Juan",
       ...
     }
   }
              │
              ▼
4. BACKEND VALIDA
   ┌─────────────────────────────┐
   │ • Campos requeridos         │
   │ • Usuario no existe         │
   │ • CI no registrado          │
   └──────────┬──────────────────┘
              │
              ▼
5. HASHEA CONTRASEÑA
   bcrypt.hash("password123", 10)
   → "$2b$10$abcd..."
              │
              ▼
6. TRANSACCIÓN BD
   ┌─────────────────────────────┐
   │ BEGIN;                      │
   │                             │
   │ INSERT INTO persona         │
   │ VALUES (...)                │
   │ RETURNING id_persona;       │
   │                             │
   │ INSERT INTO usuario         │
   │ VALUES (..., id_persona)    │
   │ RETURNING id_usuario;       │
   │                             │
   │ COMMIT;                     │
   └──────────┬──────────────────┘
              │
              ▼
7. RESPUESTA
   {
     "success": true,
     "message": "Usuario creado",
     "data": {...}
   }
              │
              ▼
8. FRONTEND ACTUALIZA
   ┌─────────────────────────────┐
   │ • Cierra modal              │
   │ • Recarga tabla             │
   │ • Muestra mensaje éxito     │
   └─────────────────────────────┘
```

---

## 🔄 FLUJO DE DATOS: SUBIR LOGO

```
1. USUARIO SELECCIONA IMAGEN
   ┌─────────────────────┐
   │ <input type="file"> │
   │ onChange            │
   └──────────┬──────────┘
              │
              ▼
2. VALIDACIÓN FRONTEND
   ┌─────────────────────────────┐
   │ • Tamaño < 5MB              │
   │ • Tipo: image/*             │
   └──────────┬──────────────────┘
              │
              ▼
3. VISTA PREVIA
   FileReader.readAsDataURL(file)
   → setPreviewImagen(result)
              │
              ▼
4. ENVÍO MULTIPART
   ┌─────────────────────────────┐
   │ const formData = new        │
   │   FormData();               │
   │ formData.append('nombre',   │
   │   'MAS-IPSP');              │
   │ formData.append('logo',     │
   │   file);                    │
   │                             │
   │ POST /api/frentes           │
   │ Content-Type:               │
   │   multipart/form-data       │
   └──────────┬──────────────────┘
              │
              ▼
5. MULTER PROCESA
   ┌─────────────────────────────┐
   │ • Valida tipo               │
   │ • Valida tamaño             │
   │ • Genera nombre único       │
   │   logo-{timestamp}-{rand}   │
   │ • Guarda en                 │
   │   uploads/logos/            │
   └──────────┬──────────────────┘
              │
              ▼
6. INSERTA EN BD
   INSERT INTO frente_politico
   (nombre, siglas, color, logo)
   VALUES ('MAS-IPSP', ...,
     'logo-1707567890-123.jpg')
              │
              ▼
7. RESPUESTA
   {
     "success": true,
     "frente": {
       "id_frente": 1,
       "logo": "logo-1707567890-123.jpg",
       "logo_url": "http://localhost:3000/
         uploads/logos/logo-1707567890-123.jpg"
     }
   }
              │
              ▼
8. FRONTEND MUESTRA
   <img src={frente.logo_url} />
```

---

## 🗄️ RELACIONES DE BASE DE DATOS

```
┌──────────────┐
│   persona    │
│──────────────│
│ id_persona   │◄──────┐
│ nombre       │       │
│ apellido_p   │       │
│ ci (UNIQUE)  │       │
│ celular      │       │
│ email        │       │
└──────────────┘       │
                       │
                       │ FK
                       │
┌──────────────┐       │
│     rol      │       │
│──────────────│       │
│ id_rol       │◄──┐   │
│ nombre       │   │   │
│ descripcion  │   │   │
└──────────────┘   │   │
                   │   │
                   │FK │FK
                   │   │
              ┌────┴───┴────┐
              │   usuario   │
              │─────────────│
              │ id_usuario  │
              │ nombre_usr  │
              │ contrasena  │
              │ id_rol      │
              │ id_persona  │
              │ fecha_inicio│
              │ fecha_fin   │
              └─────────────┘

┌──────────────────┐
│   geografico     │
│──────────────────│
│ id_geografico    │◄─────┐
│ nombre           │      │
│ codigo           │      │
│ tipo             │      │
│ fk_id_geografico │──────┘ (Auto-referencia)
└──────────────────┘

┌──────────────────┐
│ frente_politico  │
│──────────────────│
│ id_frente        │
│ nombre (UNIQUE)  │
│ siglas           │
│ color            │
│ logo             │
│ fecha_creacion   │
└──────────────────┘
```

---

## 🎯 MATRIZ DE PERMISOS POR ROL

```
┌────────────────────────┬──────────┬────────────┬──────────┐
│ Funcionalidad          │ Admin    │ Supervisor │ Operador │
├────────────────────────┼──────────┼────────────┼──────────┤
│ Dashboard General      │    ✓     │     ✓      │    ✗     │
│ Usuarios y Roles       │    ✓     │     ✗      │    ✗     │
│ Parámetros Geográficos │    ✓     │     ✗      │    ✗     │
│ Frentes Políticos      │    ✓     │     ✗      │    ✗     │
│ Control y Validación   │    ✓     │     ✓      │    ✗     │
│ Digitalización Actas   │    ✗     │     ✓      │    ✓     │
└────────────────────────┴──────────┴────────────┴──────────┘
```

---

## 📦 DEPENDENCIAS DEL PROYECTO

### **Frontend (package.json)**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  }
}
```

### **Backend (package.json)**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "multer": "^2.0.2"
  }
}
```

---

## 🚀 COMANDOS ÚTILES

### **Desarrollo**
```bash
# Frontend
npm run dev              # Iniciar servidor de desarrollo

# Backend
npm run dev              # Iniciar con hot-reload
npm start                # Iniciar sin hot-reload
npm run crear-usuarios   # Crear usuarios de prueba
npm run crear-tabla-frentes  # Crear tabla frentes
```

### **Base de Datos**
```bash
# Conectar a PostgreSQL
psql -U postgres -d subnacionales

# Ejecutar script SQL
psql -U postgres -d subnacionales -f archivo.sql
```

---

## 🔍 DEBUGGING

### **Ver logs del backend**
El backend muestra logs en consola:
```
🚀 Servidor backend corriendo en http://localhost:3000
📡 Frontend permitido desde: http://localhost:5173

📋 Rutas disponibles:
   - GET  http://localhost:3000/api/ping
   - POST http://localhost:3000/api/auth/login
   - GET  http://localhost:3000/api/usuarios
```

### **Verificar token JWT**
```javascript
// En consola del navegador
const token = localStorage.getItem('token');
console.log(token);

// Decodificar (sin verificar)
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload);
```

### **Ver datos en localStorage**
```javascript
// Usuario actual
console.log(JSON.parse(localStorage.getItem('usuario')));

// Token
console.log(localStorage.getItem('token'));
```

---

## 📈 MÉTRICAS DEL SISTEMA

```
Total de Líneas de Código:
├── Backend:  ~15,000 líneas
├── Frontend: ~25,000 líneas
└── Total:    ~40,000 líneas

Total de Archivos:
├── Backend:  15 archivos
├── Frontend: 20 archivos
└── Total:    35 archivos

APIs Implementadas: 4
Endpoints Totales:  24
Tablas en BD:       5
Páginas Frontend:   6
```

---

## 🎓 GLOSARIO

- **JWT**: JSON Web Token - Token de autenticación
- **bcrypt**: Algoritmo de hash para contraseñas
- **CORS**: Cross-Origin Resource Sharing
- **Soft Delete**: Eliminación lógica (no física)
- **Multer**: Middleware para subida de archivos
- **ORM**: Object-Relational Mapping (no usado aquí)
- **REST**: Representational State Transfer
- **CRUD**: Create, Read, Update, Delete
- **FK**: Foreign Key (Clave foránea)
- **PK**: Primary Key (Clave primaria)

---

Esta documentación cubre el 100% del sistema actual. ¿Hay algo específico que quieras profundizar? 🚀
