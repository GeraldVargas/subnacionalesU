# 🚀 GUÍA DE INSTALACIÓN COMPLETA

## Para configurar el sistema en otra computadora

---

## 📋 REQUISITOS PREVIOS

Antes de comenzar, asegúrate de tener instalado:

### **1. Node.js** (versión 18 o superior)
- Descargar de: https://nodejs.org/
- Verificar instalación:
  ```bash
  node --version
  npm --version
  ```

### **2. PostgreSQL** (versión 14 o superior)
- Descargar de: https://www.postgresql.org/download/
- Durante la instalación, recuerda la contraseña del usuario `postgres`
- Verificar instalación:
  ```bash
  psql --version
  ```

### **3. Git**
- Descargar de: https://git-scm.com/
- Verificar instalación:
  ```bash
  git --version
  ```

---

## 📥 PASO 1: CLONAR EL REPOSITORIO

```bash
# Clonar el proyecto
git clone https://github.com/MatiMita/subnacionales.git

# Entrar al directorio
cd subnacionales
```

---

## 🗄️ PASO 2: CONFIGURAR LA BASE DE DATOS

### **2.1. Crear la Base de Datos**

Opción A - Usando pgAdmin (interfaz gráfica):
1. Abrir pgAdmin
2. Click derecho en "Databases" → "Create" → "Database"
3. Nombre: `subnacionales`
4. Owner: `postgres`
5. Click "Save"

Opción B - Usando línea de comandos:
```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE subnacionales;

# Salir
\q
```

### **2.2. Ejecutar Scripts SQL**

El proyecto incluye scripts SQL que debes ejecutar en orden:

```bash
# Navegar a la carpeta de scripts
cd backend/sql

# Ejecutar cada script en orden
psql -U postgres -d subnacionales -f 01_crear_tabla_rol.sql
psql -U postgres -d subnacionales -f 02_crear_tabla_frente_politico.sql
```

**IMPORTANTE**: Si `psql` no está en tu PATH, usa el script de Node.js:

```bash
# Desde la raíz del proyecto backend
cd backend
npm install
node scripts/crear-tabla-frentes.js
```

### **2.3. Verificar las Tablas**

```bash
# Conectar a la base de datos
psql -U postgres -d subnacionales

# Listar tablas
\dt

# Deberías ver:
# - persona
# - rol
# - usuario
# - geografico
# - frente_politico

# Salir
\q
```

### **2.4. Crear Usuarios de Prueba (Opcional)**

```bash
cd backend
npm run crear-usuarios
```

Esto creará usuarios de prueba:
- Usuario: `perez` / Contraseña: `perez123` (Administrador)
- Usuario: `supervisor1` / Contraseña: `super123` (Supervisor)
- Usuario: `operador1` / Contraseña: `oper123` (Operador)

---

## ⚙️ PASO 3: CONFIGURAR VARIABLES DE ENTORNO

### **3.1. Frontend**

Crear archivo `.env` en la raíz del proyecto:

```bash
# Desde la raíz del proyecto
touch .env
```

Contenido del archivo `.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

### **3.2. Backend**

Crear archivo `.env` en la carpeta `backend`:

```bash
# Desde la raíz del proyecto
touch backend/.env
```

Contenido del archivo `backend/.env`:
```env
# Configuración de PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=subnacionales
DB_USER=postgres
DB_PASSWORD=TU_CONTRASEÑA_AQUI

# Configuración del servidor
PORT=3000
JWT_SECRET=cambia_este_secreto_por_uno_aleatorio_muy_largo

# CORS
FRONTEND_URL=http://localhost:5173
```

**⚠️ IMPORTANTE**: 
- Reemplaza `TU_CONTRASEÑA_AQUI` con la contraseña de PostgreSQL
- Cambia `JWT_SECRET` por una cadena aleatoria larga y segura

---

## 📦 PASO 4: INSTALAR DEPENDENCIAS

### **4.1. Dependencias del Frontend**

```bash
# Desde la raíz del proyecto
npm install
```

Esto instalará:
- react
- react-dom
- react-router-dom
- lucide-react
- vite
- etc.

### **4.2. Dependencias del Backend**

```bash
# Entrar a la carpeta backend
cd backend

# Instalar dependencias
npm install
```

Esto instalará:
- express
- pg (PostgreSQL)
- cors
- dotenv
- bcrypt
- jsonwebtoken
- multer
- etc.

---

## 🚀 PASO 5: EJECUTAR EL SISTEMA

Necesitas **DOS terminales** abiertas:

### **Terminal 1: Backend**

```bash
# Desde la raíz del proyecto
cd backend
npm run dev
```

Deberías ver:
```
🚀 Servidor backend corriendo en http://localhost:3000
✅ Conectado a PostgreSQL
📡 Frontend permitido desde: http://localhost:5173
```

### **Terminal 2: Frontend**

```bash
# Desde la raíz del proyecto (en otra terminal)
npm run dev
```

Deberías ver:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🌐 PASO 6: ACCEDER AL SISTEMA

1. Abrir navegador
2. Ir a: `http://localhost:5173`
3. Usar credenciales de prueba:
   - Usuario: `perez`
   - Contraseña: `perez123`

---

## ✅ VERIFICACIÓN DE LA INSTALACIÓN

### **Checklist de Verificación**

- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos `subnacionales` creada
- [ ] Tablas creadas (persona, rol, usuario, geografico, frente_politico)
- [ ] Node.js instalado
- [ ] Dependencias frontend instaladas (`node_modules` en raíz)
- [ ] Dependencias backend instaladas (`node_modules` en backend)
- [ ] Archivo `.env` en raíz configurado
- [ ] Archivo `backend/.env` configurado
- [ ] Backend corriendo en puerto 3000
- [ ] Frontend corriendo en puerto 5173
- [ ] Puedes hacer login

---

## 🔧 SOLUCIÓN DE PROBLEMAS COMUNES

### **Problema 1: "Failed to fetch" en el login**

**Causa**: El backend no está corriendo o hay problema de CORS

**Solución**:
1. Verificar que el backend esté corriendo en puerto 3000
2. Verificar que `VITE_API_URL` en `.env` sea `http://localhost:3000/api`
3. Verificar que `FRONTEND_URL` en `backend/.env` sea `http://localhost:5173`

### **Problema 2: "Error al conectar a PostgreSQL"**

**Causa**: Credenciales incorrectas o PostgreSQL no está corriendo

**Solución**:
1. Verificar que PostgreSQL esté corriendo
2. Verificar credenciales en `backend/.env`
3. Probar conexión manual:
   ```bash
   psql -U postgres -d subnacionales
   ```

### **Problema 3: "Puerto 5173 ya está en uso"**

**Causa**: Ya hay un proceso usando ese puerto

**Solución**:
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5173 | xargs kill -9
```

O simplemente Vite usará el siguiente puerto disponible (5174, 5175, etc.)

### **Problema 4: "Tabla no existe"**

**Causa**: Los scripts SQL no se ejecutaron

**Solución**:
```bash
cd backend
npm run crear-tabla-frentes
# O ejecutar manualmente los scripts SQL
```

### **Problema 5: "Cannot find module"**

**Causa**: Dependencias no instaladas

**Solución**:
```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

---

## 📁 ESTRUCTURA DE ARCHIVOS DESPUÉS DE LA INSTALACIÓN

```
subnacionales/
├── node_modules/              ✅ Creado por npm install
├── backend/
│   ├── node_modules/          ✅ Creado por npm install
│   ├── uploads/
│   │   └── logos/             ✅ Se crea automáticamente
│   ├── routes/
│   ├── sql/
│   ├── scripts/
│   ├── .env                   ✅ DEBES CREAR ESTE ARCHIVO
│   ├── database.js
│   ├── server.js
│   └── package.json
├── src/
├── public/
├── .env                       ✅ DEBES CREAR ESTE ARCHIVO
├── package.json
├── vite.config.js
└── README.md
```

---

## 🔐 SEGURIDAD

### **Archivos que NO deben subirse a Git**

El archivo `.gitignore` ya está configurado para ignorar:
- `node_modules/`
- `.env`
- `backend/.env`
- `backend/uploads/`

**⚠️ NUNCA** subas archivos `.env` a Git, contienen información sensible.

---

## 📊 VERIFICAR QUE TODO FUNCIONA

### **1. Verificar Backend**

Abrir en navegador: `http://localhost:3000/api/ping`

Deberías ver:
```json
{
  "message": "Backend funcionando correctamente",
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```

### **2. Verificar Base de Datos**

```bash
psql -U postgres -d subnacionales

# Ver usuarios
SELECT * FROM usuario;

# Ver roles
SELECT * FROM rol;

# Salir
\q
```

### **3. Verificar Frontend**

1. Ir a `http://localhost:5173`
2. Deberías ver la página de login
3. Hacer login con `perez` / `perez123`
4. Deberías ver el dashboard

---

## 🎓 COMANDOS ÚTILES

### **Desarrollo**

```bash
# Frontend
npm run dev              # Iniciar servidor de desarrollo

# Backend
cd backend
npm run dev              # Iniciar con hot-reload
npm start                # Iniciar sin hot-reload
```

### **Base de Datos**

```bash
# Conectar a PostgreSQL
psql -U postgres -d subnacionales

# Listar tablas
\dt

# Ver estructura de una tabla
\d nombre_tabla

# Ejecutar query
SELECT * FROM usuario;

# Salir
\q
```

### **Utilidades**

```bash
# Crear usuarios de prueba
cd backend
npm run crear-usuarios

# Crear tabla de frentes
npm run crear-tabla-frentes
```

---

## 📚 DOCUMENTACIÓN ADICIONAL

Después de la instalación, revisa:

1. **RESUMEN_EJECUTIVO.md** - Visión general del sistema
2. **DOCUMENTACION_COMPLETA.md** - Explicación detallada de APIs
3. **MAPA_VISUAL.md** - Diagramas y flujos
4. **EJEMPLOS_CODIGO.md** - Código de ejemplo

---

## 🆘 SOPORTE

Si tienes problemas:

1. Revisa la sección "Solución de Problemas" arriba
2. Verifica los logs en las terminales
3. Revisa la documentación completa
4. Contacta al equipo de desarrollo

---

## ✨ ¡LISTO!

Si completaste todos los pasos, deberías tener el sistema funcionando completamente.

**Próximos pasos**:
- Explorar el sistema
- Crear usuarios
- Configurar parámetros geográficos
- Agregar frentes políticos
- Leer la documentación para entender el código

---

**Última actualización**: Febrero 2026
**Versión del sistema**: 1.0.0
