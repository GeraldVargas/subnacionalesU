# 📚 DOCUMENTACIÓN COMPLETA DEL SISTEMA ELECTORAL

## 🎯 RESUMEN DEL SISTEMA

Este es un **Sistema de Cómputo Electoral** diseñado para gestionar elecciones subnacionales en Colcapirhua 2026. El sistema permite:

- **Autenticación y autorización** de usuarios con diferentes roles
- **Gestión de usuarios** y sus datos personales
- **Configuración geográfica** jerárquica (departamentos, provincias, municipios, etc.)
- **Gestión de frentes políticos** con sus logos y colores
- **Digitalización de actas** electorales (en desarrollo)
- **Control y validación** de datos (en desarrollo)
- **Visualización de resultados** en tiempo real (en desarrollo)

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### **Stack Tecnológico**

#### **Frontend**
- **React** 18 con Vite
- **React Router** para navegación
- **Lucide React** para iconos
- **Tailwind CSS** para estilos (opcional)
- Variables de entorno con `.env`

#### **Backend**
- **Node.js** con Express
- **PostgreSQL** como base de datos
- **bcrypt** para hash de contraseñas
- **jsonwebtoken (JWT)** para autenticación
- **multer** para subida de archivos
- **CORS** para comunicación frontend-backend

#### **Base de Datos**
- **PostgreSQL** con relaciones normalizadas
- Tablas principales: `usuario`, `persona`, `rol`, `geografico`, `frente_politico`

---

## 📡 APIS DEL BACKEND

El sistema cuenta con **4 módulos de API** principales:

### **1. API de Autenticación** (`/api/auth`)

**Archivo**: `backend/routes/auth.js`

#### Endpoints:

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Obtener usuario actual |

#### **POST /api/auth/login**
**Propósito**: Autenticar usuarios y generar token JWT

**Request Body**:
```json
{
  "nombre_usuario": "perez",
  "contrasena": "perez123"
}
```

**Response Success**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id_usuario": 1,
      "nombre_usuario": "perez",
      "rol": "Administrador del Sistema",
      "rol_descripcion": "Acceso total",
      "persona": {
        "nombre": "Juan",
        "apellido_paterno": "Pérez",
        "ci": "12345678",
        "celular": "70000000",
        "email": "juan@email.com"
      }
    }
  }
}
```

**Lógica**:
1. Busca el usuario en la BD con JOIN a `persona` y `rol`
2. Verifica que la cuenta esté activa (campo `fecha_fin`)
3. Compara la contraseña con bcrypt
4. Genera un token JWT válido por 24 horas
5. Retorna el token y datos del usuario

#### **GET /api/auth/me**
**Propósito**: Obtener información del usuario autenticado

**Headers**:
```
Authorization: Bearer <token>
```

**Response**: Datos completos del usuario

**Lógica**:
1. Extrae el token del header `Authorization`
2. Verifica y decodifica el token JWT
3. Busca el usuario en la BD
4. Retorna los datos actualizados

---

### **2. API de Usuarios** (`/api/usuarios`)

**Archivo**: `backend/routes/usuarios.js`

#### Endpoints:

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/usuarios` | Listar todos los usuarios |
| GET | `/api/usuarios/:id` | Obtener un usuario específico |
| POST | `/api/usuarios` | Crear nuevo usuario |
| PUT | `/api/usuarios/:id` | Actualizar usuario |
| DELETE | `/api/usuarios/:id` | Desactivar usuario (soft delete) |
| GET | `/api/usuarios/roles` | Obtener lista de roles |

#### **GET /api/usuarios**
**Propósito**: Listar todos los usuarios con sus datos personales y roles

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id_usuario": 1,
      "nombre_usuario": "perez",
      "activo": true,
      "persona": {
        "nombre": "Juan",
        "apellido_paterno": "Pérez",
        "apellido_materno": "López",
        "ci": "12345678",
        "celular": "70000000",
        "email": "juan@email.com"
      },
      "roles": [
        {
          "name": "Administrador del Sistema",
          "descripcion": "Acceso total"
        }
      ]
    }
  ]
}
```

**Lógica**:
- JOIN entre `usuario`, `persona` y `rol`
- Calcula si está activo según `fecha_fin`
- Formatea la respuesta en estructura jerárquica

#### **POST /api/usuarios**
**Propósito**: Crear un nuevo usuario con sus datos personales

**Request Body**:
```json
{
  "nombre_usuario": "jperez",
  "contrasena": "password123",
  "id_rol": 1,
  "persona": {
    "nombre": "Juan",
    "apellido_paterno": "Pérez",
    "apellido_materno": "López",
    "ci": "12345678",
    "celular": "70000000",
    "email": "juan@email.com"
  }
}
```

**Lógica**:
1. Valida campos requeridos
2. Verifica que el usuario no exista
3. Verifica que el CI no esté registrado
4. Hashea la contraseña con bcrypt (10 rounds)
5. **Transacción**:
   - Crea el registro en `persona`
   - Crea el registro en `usuario` con el `id_persona`
6. Retorna el usuario completo creado

#### **PUT /api/usuarios/:id**
**Propósito**: Actualizar datos de un usuario existente

**Request Body**: Igual que POST, pero la contraseña es opcional

**Lógica**:
1. Verifica que el usuario exista
2. Valida que no haya duplicados de usuario o CI
3. **Transacción**:
   - Actualiza datos en `persona`
   - Actualiza datos en `usuario`
   - Si se proporciona contraseña, la hashea y actualiza
4. Retorna el usuario actualizado

#### **DELETE /api/usuarios/:id**
**Propósito**: Desactivar un usuario (no lo elimina físicamente)

**Lógica**:
1. Verifica que el usuario exista
2. Establece `fecha_fin = CURRENT_TIMESTAMP`
3. El usuario queda marcado como inactivo
4. **Soft delete**: Los datos se preservan para auditoría

#### **GET /api/usuarios/roles**
**Propósito**: Obtener lista de roles disponibles

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id_rol": 1,
      "nombre": "Administrador del Sistema",
      "descripcion": "Acceso total al sistema"
    }
  ]
}
```

---

### **3. API Geográfica** (`/api/geografico`)

**Archivo**: `backend/routes/geografico.js`

#### Endpoints:

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/geografico` | Listar todos los registros geográficos |
| GET | `/api/geografico/:id` | Obtener un registro específico |
| GET | `/api/geografico/tipos` | Obtener tipos únicos |
| GET | `/api/geografico/padres` | Obtener posibles padres para jerarquía |
| POST | `/api/geografico` | Crear nuevo registro |
| PUT | `/api/geografico/:id` | Actualizar registro |
| DELETE | `/api/geografico/:id` | Eliminar registro |

#### **Estructura Jerárquica**

El sistema maneja una jerarquía geográfica:
```
Departamento
  └── Provincia
      └── Municipio
          └── Distrito
              └── Zona
                  └── OTB/Comunidad
```

**Tabla `geografico`**:
- `id_geografico`: ID único
- `nombre`: Nombre del lugar
- `codigo`: Código opcional
- `ubicacion`: Coordenadas o descripción
- `tipo`: Tipo de división (Departamento, Provincia, etc.)
- `fk_id_geografico`: ID del padre (auto-referencia)

#### **GET /api/geografico**
**Propósito**: Listar todos los registros con sus padres

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id_geografico": 1,
      "nombre": "Cochabamba",
      "codigo": "CB",
      "tipo": "Departamento",
      "fk_id_geografico": null,
      "nombre_padre": null
    },
    {
      "id_geografico": 2,
      "nombre": "Cercado",
      "tipo": "Provincia",
      "fk_id_geografico": 1,
      "nombre_padre": "Cochabamba"
    }
  ]
}
```

**Lógica**:
- LEFT JOIN consigo misma para obtener el nombre del padre
- Ordenado por tipo y nombre

#### **POST /api/geografico**
**Propósito**: Crear nueva división geográfica

**Request Body**:
```json
{
  "nombre": "Colcapirhua",
  "codigo": "COLCA",
  "ubicacion": "-17.3925, -66.2075",
  "tipo": "Municipio",
  "fk_id_geografico": 2
}
```

**Lógica**:
1. Valida nombre y tipo requeridos
2. Verifica que no exista duplicado (nombre + tipo)
3. Crea el registro
4. Permite `fk_id_geografico` null para nivel raíz

#### **DELETE /api/geografico/:id**
**Propósito**: Eliminar registro geográfico

**Lógica**:
1. Verifica si tiene registros hijos
2. Si tiene hijos, rechaza la eliminación
3. Si no tiene hijos, elimina el registro
4. **Protección de integridad referencial**

---

### **4. API de Frentes Políticos** (`/api/frentes`)

**Archivo**: `backend/routes/frentes.js`

#### Endpoints:

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/frentes` | Listar todos los frentes |
| GET | `/api/frentes/:id` | Obtener un frente específico |
| GET | `/api/frentes/logo/:id` | Servir imagen del logo |
| POST | `/api/frentes` | Crear nuevo frente |
| PUT | `/api/frentes/:id` | Actualizar frente |
| DELETE | `/api/frentes/:id` | Eliminar frente |

#### **Gestión de Archivos**

Usa **multer** para manejar subida de imágenes:
- Directorio: `backend/uploads/logos/`
- Tamaño máximo: 5MB
- Formatos: JPEG, JPG, PNG, GIF, SVG
- Nombres únicos: `logo-{timestamp}-{random}.ext`

#### **GET /api/frentes**
**Propósito**: Listar frentes con URLs de logos

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id_frente": 1,
      "nombre": "Movimiento al Socialismo",
      "siglas": "MAS-IPSP",
      "color": "#0066CC",
      "logo": "logo-1707567890-123456.jpg",
      "logo_url": "http://localhost:3000/uploads/logos/logo-1707567890-123456.jpg",
      "fecha_creacion": "2026-02-10T10:00:00Z"
    }
  ]
}
```

**Lógica**:
- Construye `logo_url` concatenando la ruta base con el nombre del archivo
- Los logos se sirven como archivos estáticos

#### **POST /api/frentes**
**Propósito**: Crear frente político con logo

**Request**: `multipart/form-data`
```
nombre: "Movimiento al Socialismo"
siglas: "MAS-IPSP"
color: "#0066CC"
logo: [archivo de imagen]
```

**Lógica**:
1. Multer procesa el archivo y lo guarda
2. Valida el nombre requerido
3. Crea el registro con el nombre del archivo
4. Si hay error, elimina el archivo subido

#### **PUT /api/frentes/:id**
**Propósito**: Actualizar frente, opcionalmente cambiar logo

**Lógica**:
1. Obtiene el frente actual
2. Si hay nuevo logo:
   - Elimina el logo anterior del disco
   - Guarda el nuevo logo
3. Actualiza el registro
4. Si hay error, elimina el archivo nuevo

#### **DELETE /api/frentes/:id**
**Propósito**: Eliminar frente y su logo

**Lógica**:
1. Obtiene el nombre del logo
2. Elimina el registro de la BD
3. Elimina el archivo del logo del disco
4. **Limpieza completa** de datos y archivos

---

## 🗄️ ESTRUCTURA DE LA BASE DE DATOS

### **Tablas Principales**

#### **1. `persona`**
Almacena datos personales de individuos.

```sql
CREATE TABLE persona (
    id_persona SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    ci VARCHAR(20) UNIQUE NOT NULL,
    celular VARCHAR(20),
    email VARCHAR(100)
);
```

#### **2. `rol`**
Define los roles del sistema.

```sql
CREATE TABLE rol (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT
);
```

**Roles actuales**:
- Administrador del Sistema
- Supervisor
- Operador

#### **3. `usuario`**
Usuarios del sistema con autenticación.

```sql
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    id_rol INTEGER REFERENCES rol(id_rol),
    id_persona INTEGER REFERENCES persona(id_persona),
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP
);
```

**Campos clave**:
- `contrasena`: Hash bcrypt
- `fecha_fin`: NULL = activo, con valor = inactivo

#### **4. `geografico`**
Divisiones geográficas jerárquicas.

```sql
CREATE TABLE geografico (
    id_geografico SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    codigo VARCHAR(50),
    ubicacion TEXT,
    tipo VARCHAR(50) NOT NULL,
    fk_id_geografico INTEGER REFERENCES geografico(id_geografico)
);
```

**Auto-referencia**: `fk_id_geografico` apunta al padre

#### **5. `frente_politico`**
Partidos y frentes políticos.

```sql
CREATE TABLE frente_politico (
    id_frente SERIAL PRIMARY KEY,
    nombre VARCHAR(200) UNIQUE NOT NULL,
    siglas VARCHAR(50),
    color VARCHAR(7) DEFAULT '#E31E24',
    logo VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎨 ESTRUCTURA DEL FRONTEND

### **Páginas Principales**

#### **1. Login** (`src/pages/Login.jsx`)
- Formulario de autenticación
- Selección de rol
- Guarda token en `localStorage`
- Redirección al dashboard

#### **2. Dashboard Home** (`src/pages/DashboardHome.jsx`)
- Página principal después del login
- Resumen del sistema
- Accesos rápidos

#### **3. Gestión de Usuarios** (`src/pages/GestionUsuarios.jsx`)
- Tabla de usuarios
- Modal para crear/editar
- Funciones de eliminar (soft delete)
- Gestión de datos personales y roles

#### **4. Parámetros Geográficos** (`src/pages/Geografia.jsx`)
- Tabla jerárquica de divisiones
- Crear/editar/eliminar registros
- Selección de padre para jerarquía
- Validación de dependencias

#### **5. Frentes Políticos** (`src/pages/FrentesPoliticos.jsx`)
- Grid de tarjetas con logos
- Subida de imágenes
- Selector de color
- CRUD completo

#### **6. Digitalización de Actas** (`src/pages/Transcripcion.jsx`)
- En desarrollo
- Para captura de resultados electorales

---

## 🔐 FLUJO DE AUTENTICACIÓN

### **1. Login**
```
Usuario ingresa credenciales
    ↓
Frontend → POST /api/auth/login
    ↓
Backend verifica usuario y contraseña
    ↓
Backend genera JWT (válido 24h)
    ↓
Frontend guarda token en localStorage
    ↓
Redirección a /dashboard
```

### **2. Requests Autenticados**
```
Frontend hace request
    ↓
Incluye header: Authorization: Bearer <token>
    ↓
Backend verifica token (middleware)
    ↓
Si válido: procesa request
Si inválido: retorna 401 Unauthorized
```

### **3. Persistencia de Sesión**
```
Usuario recarga página
    ↓
Frontend lee token de localStorage
    ↓
GET /api/auth/me para obtener datos actuales
    ↓
Si token válido: mantiene sesión
Si token inválido: redirige a login
```

---

## 🔄 FLUJOS PRINCIPALES

### **Crear Usuario**
```
1. Admin abre modal "Nuevo Usuario"
2. Completa formulario (usuario, contraseña, rol, datos personales)
3. Frontend → POST /api/usuarios
4. Backend:
   - Valida datos
   - Hashea contraseña
   - Transacción:
     * INSERT persona
     * INSERT usuario con id_persona
   - Commit
5. Frontend recarga tabla
6. Muestra mensaje de éxito
```

### **Editar Usuario**
```
1. Admin hace clic en botón "Editar"
2. Modal se abre con datos pre-cargados
3. Admin modifica campos
4. Contraseña opcional (vacía = mantener actual)
5. Frontend → PUT /api/usuarios/:id
6. Backend:
   - Valida datos
   - Transacción:
     * UPDATE persona
     * UPDATE usuario
     * Si hay contraseña nueva, hashea y actualiza
   - Commit
7. Frontend recarga tabla
```

### **Eliminar Usuario (Soft Delete)**
```
1. Admin hace clic en "Eliminar"
2. Confirmación: "¿Estás seguro?"
3. Frontend → DELETE /api/usuarios/:id
4. Backend:
   - UPDATE usuario SET fecha_fin = NOW()
5. Usuario queda inactivo
6. Frontend recarga tabla
7. Badge cambia a "INACTIVO"
```

### **Subir Logo de Frente**
```
1. Admin selecciona imagen
2. Vista previa en el modal
3. Frontend → POST /api/frentes (multipart/form-data)
4. Backend:
   - Multer procesa archivo
   - Valida tipo y tamaño
   - Guarda en backend/uploads/logos/
   - INSERT frente_politico con nombre de archivo
5. Frontend recarga grid
6. Logo se muestra desde URL estática
```

---

## 🛡️ SEGURIDAD

### **Contraseñas**
- Hash con **bcrypt** (10 rounds)
- Nunca se almacenan en texto plano
- Nunca se retornan en las respuestas

### **Tokens JWT**
- Firmados con `JWT_SECRET` del `.env`
- Expiración: 24 horas
- Contienen: `id`, `nombre_usuario`, `rol`

### **Validaciones**
- Campos requeridos en frontend y backend
- Validación de duplicados (usuario, CI)
- Validación de tipos de archivo
- Validación de integridad referencial

### **CORS**
- Configurado para permitir solo orígenes específicos
- Credenciales habilitadas
- Puertos: 5173, 5174

### **Soft Delete**
- Los usuarios no se eliminan físicamente
- Se preserva el historial
- Auditoría completa

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
elecciones-frontend/
├── backend/
│   ├── routes/
│   │   ├── auth.js          # API de autenticación
│   │   ├── usuarios.js      # API de usuarios
│   │   ├── geografico.js    # API geográfica
│   │   └── frentes.js       # API de frentes políticos
│   ├── sql/
│   │   ├── 01_crear_tabla_rol.sql
│   │   └── 02_crear_tabla_frente_politico.sql
│   ├── scripts/
│   │   ├── crear-usuarios-prueba.js
│   │   └── crear-tabla-frentes.js
│   ├── uploads/
│   │   └── logos/           # Logos de frentes
│   ├── database.js          # Conexión PostgreSQL
│   ├── server.js            # Servidor Express
│   ├── .env                 # Variables de entorno
│   └── package.json
│
├── src/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── DashboardHome.jsx
│   │   ├── GestionUsuarios.jsx
│   │   ├── Geografia.jsx
│   │   ├── FrentesPoliticos.jsx
│   │   └── Transcripcion.jsx
│   ├── components/
│   │   └── Sidebar.jsx
│   ├── layouts/
│   │   └── DashboardLayout.jsx
│   ├── config/
│   │   └── navigation.js    # Configuración del menú
│   ├── App.jsx              # Rutas principales
│   └── main.jsx             # Punto de entrada
│
├── .env                     # Variables frontend
└── package.json
```

---

## 🚀 VARIABLES DE ENTORNO

### **Frontend** (`.env`)
```env
VITE_API_URL=http://localhost:3000/api
```

### **Backend** (`backend/.env`)
```env
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=subnacionales
DB_USER=postgres
DB_PASSWORD=postgres

# Servidor
PORT=3000
JWT_SECRET=tu_secreto_super_seguro_cambialo_por_favor

# CORS
FRONTEND_URL=http://localhost:5173
```

---

## 📊 RESUMEN DE ENDPOINTS

### **Total: 24 endpoints**

| API | Endpoints | Descripción |
|-----|-----------|-------------|
| **Auth** | 2 | Autenticación y sesión |
| **Usuarios** | 6 | CRUD usuarios y roles |
| **Geográfico** | 7 | CRUD divisiones geográficas |
| **Frentes** | 6 | CRUD frentes políticos |
| **Ping** | 1 | Health check |

---

## 🎯 CONCEPTOS CLAVE

### **1. Transacciones**
Se usan en operaciones que afectan múltiples tablas:
```javascript
await pool.query('BEGIN');
try {
    // Operaciones
    await pool.query('COMMIT');
} catch (error) {
    await pool.query('ROLLBACK');
    throw error;
}
```

### **2. Soft Delete**
No se eliminan registros, se marcan como inactivos:
```sql
UPDATE usuario SET fecha_fin = CURRENT_TIMESTAMP WHERE id = ?
```

### **3. Jerarquía Auto-referencial**
Una tabla se relaciona consigo misma:
```sql
SELECT g.*, padre.nombre as nombre_padre
FROM geografico g
LEFT JOIN geografico padre ON g.fk_id_geografico = padre.id_geografico
```

### **4. Multipart Form Data**
Para subir archivos con datos:
```javascript
const formData = new FormData();
formData.append('nombre', 'MAS');
formData.append('logo', file);
```

### **5. JWT (JSON Web Tokens)**
Token firmado que contiene información del usuario:
```
Header.Payload.Signature
```

---

## 🔍 PRÓXIMAS FUNCIONALIDADES

1. **Digitalización de Actas**: Captura de resultados electorales
2. **Control y Validación**: Supervisión de datos ingresados
3. **Resultados en Vivo**: Dashboard público con resultados
4. **Reportes**: Generación de informes y estadísticas
5. **Auditoría**: Registro de todas las acciones del sistema

---

¿Necesitas profundizar en algún módulo específico? 🚀
