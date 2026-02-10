# 🗳️ Sistema Electoral Subnacional - Colcapirhua 2026

Sistema web completo para la gestión y digitalización de procesos electorales subnacionales.

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### Instalación Rápida

```bash
# 1. Clonar el repositorio
git clone https://github.com/MatiMita/subnacionales.git
cd subnacionales

# 2. Crear base de datos PostgreSQL
createdb subnacionales

# 3. Ejecutar script SQL completo
psql -U postgres -d subnacionales -f backend/sql/00_crear_todas_las_tablas.sql

# 4. Configurar variables de entorno
# Crear .env en la raíz
echo "VITE_API_URL=http://localhost:3000/api" > .env

# Crear backend/.env
cat > backend/.env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=subnacionales
DB_USER=postgres
DB_PASSWORD=TU_CONTRASEÑA_AQUI
PORT=3000
JWT_SECRET=cambia_este_secreto_por_uno_muy_largo_y_aleatorio
FRONTEND_URL=http://localhost:5173
EOF

# 5. Instalar dependencias
npm install
cd backend && npm install && cd ..

# 6. Crear usuarios de prueba (opcional)
cd backend && npm run crear-usuarios && cd ..

# 7. Ejecutar el sistema (dos terminales)
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
npm run dev
```

### Acceder al Sistema
- URL: http://localhost:5173
- Usuario: `perez`
- Contraseña: `perez123`

---

## 📚 Documentación Completa

Para instalación detallada paso a paso, ver: **[GUIA_INSTALACION.md](GUIA_INSTALACION.md)**

### Documentos Disponibles

| Documento | Descripción |
|-----------|-------------|
| **[GUIA_INSTALACION.md](GUIA_INSTALACION.md)** | Guía paso a paso para instalar en otra computadora |
| **[RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md)** | Visión general del sistema y estadísticas |
| **[DOCUMENTACION_COMPLETA.md](DOCUMENTACION_COMPLETA.md)** | Explicación detallada de todas las APIs |
| **[MAPA_VISUAL.md](MAPA_VISUAL.md)** | Diagramas de arquitectura y flujos |
| **[EJEMPLOS_CODIGO.md](EJEMPLOS_CODIGO.md)** | Ejemplos prácticos de código |

---

## 🏗️ Arquitectura

```
Frontend (React + Vite)  →  Backend (Express)  →  PostgreSQL
     Puerto 5173              Puerto 3000           Puerto 5432
```

### Stack Tecnológico

**Frontend:**
- React 18
- React Router
- Vite
- Lucide Icons

**Backend:**
- Node.js + Express
- PostgreSQL
- JWT + bcrypt
- Multer (archivos)

---

## 📊 Módulos Implementados

### ✅ Completados

1. **Autenticación y Seguridad**
   - Login con JWT
   - Roles y permisos
   - Sesiones persistentes

2. **Gestión de Usuarios**
   - CRUD completo
   - Soft delete
   - Gestión de roles

3. **Parámetros Geográficos**
   - Jerarquía de divisiones
   - CRUD con validaciones
   - Estructura padre-hijo

4. **Frentes Políticos**
   - CRUD con logos
   - Subida de imágenes
   - Colores personalizados

### 🚧 En Desarrollo

5. **Digitalización de Actas**
6. **Control y Validación**
7. **Resultados en Tiempo Real**

---

## 🗄️ Base de Datos

### Tablas Principales

- **persona** - Datos personales
- **rol** - Roles del sistema
- **usuario** - Cuentas de acceso
- **geografico** - Divisiones geográficas
- **frente_politico** - Partidos políticos

### Script SQL Completo

Ejecutar una sola vez:
```bash
psql -U postgres -d subnacionales -f backend/sql/00_crear_todas_las_tablas.sql
```

Este script crea:
- ✅ Todas las tablas
- ✅ Índices y constraints
- ✅ Datos de ejemplo
- ✅ Triggers

---

## 📡 APIs Disponibles

### Total: 24 endpoints

#### Autenticación (`/api/auth`)
- `POST /login` - Iniciar sesión
- `GET /me` - Usuario actual

#### Usuarios (`/api/usuarios`)
- `GET /` - Listar usuarios
- `GET /:id` - Obtener usuario
- `POST /` - Crear usuario
- `PUT /:id` - Actualizar usuario
- `DELETE /:id` - Desactivar usuario
- `GET /roles` - Listar roles

#### Geográfico (`/api/geografico`)
- `GET /` - Listar divisiones
- `GET /:id` - Obtener división
- `GET /tipos` - Tipos únicos
- `GET /padres` - Posibles padres
- `POST /` - Crear división
- `PUT /:id` - Actualizar división
- `DELETE /:id` - Eliminar división

#### Frentes (`/api/frentes`)
- `GET /` - Listar frentes
- `GET /:id` - Obtener frente
- `POST /` - Crear frente
- `PUT /:id` - Actualizar frente
- `DELETE /:id` - Eliminar frente

---

## 🔧 Comandos Útiles

### Desarrollo
```bash
# Frontend
npm run dev

# Backend
cd backend && npm run dev
```

### Base de Datos
```bash
# Conectar
psql -U postgres -d subnacionales

# Listar tablas
\dt

# Ver usuarios
SELECT * FROM usuario;

# Salir
\q
```

### Utilidades
```bash
# Crear usuarios de prueba
cd backend && npm run crear-usuarios

# Crear tabla de frentes
cd backend && npm run crear-tabla-frentes
```

---

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Autenticación JWT (24h)
- ✅ CORS configurado
- ✅ Validaciones en frontend y backend
- ✅ Soft delete para auditoría
- ✅ Transacciones ACID

---

## 🐛 Solución de Problemas

### "Failed to fetch" en login
- Verificar que el backend esté corriendo
- Verificar `VITE_API_URL` en `.env`
- Verificar CORS en `backend/.env`

### "Error al conectar a PostgreSQL"
- Verificar que PostgreSQL esté corriendo
- Verificar credenciales en `backend/.env`
- Probar: `psql -U postgres -d subnacionales`

### "Puerto en uso"
- Vite usará automáticamente el siguiente puerto disponible
- Backend: cambiar `PORT` en `backend/.env`

Ver más en: **[GUIA_INSTALACION.md](GUIA_INSTALACION.md)**

---

## 📁 Estructura del Proyecto

```
subnacionales/
├── backend/
│   ├── routes/          # APIs REST
│   ├── sql/             # Scripts SQL
│   ├── scripts/         # Utilidades
│   ├── uploads/         # Archivos subidos
│   ├── database.js      # Conexión PostgreSQL
│   ├── server.js        # Servidor Express
│   └── .env             # Variables de entorno
├── src/
│   ├── pages/           # Páginas React
│   ├── components/      # Componentes
│   ├── layouts/         # Layouts
│   └── config/          # Configuración
├── .env                 # Variables frontend
└── package.json
```

---

## 👥 Usuarios de Prueba

Después de ejecutar `npm run crear-usuarios`:

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| perez | perez123 | Administrador |
| supervisor1 | super123 | Supervisor |
| operador1 | oper123 | Operador |

---

## 📈 Estadísticas

- **Líneas de código**: ~40,000
- **APIs**: 4 módulos
- **Endpoints**: 24
- **Tablas**: 5
- **Páginas**: 6

---

## 🎯 Próximos Pasos

1. Explorar el sistema
2. Leer la documentación completa
3. Crear usuarios personalizados
4. Configurar parámetros geográficos
5. Agregar frentes políticos

---

## 📞 Soporte

Para problemas o preguntas:
1. Revisar **[GUIA_INSTALACION.md](GUIA_INSTALACION.md)**
2. Revisar **[DOCUMENTACION_COMPLETA.md](DOCUMENTACION_COMPLETA.md)**
3. Contactar al equipo de desarrollo

---

## 📄 Licencia

Sistema Electoral Subnacional - Colcapirhua 2026

---

**Versión**: 1.0.0  
**Última actualización**: Febrero 2026