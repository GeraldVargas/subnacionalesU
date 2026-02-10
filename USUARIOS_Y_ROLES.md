# ⚠️ IMPORTANTE: USUARIOS Y ROLES

## 🎯 RESUMEN EJECUTIVO

### ✅ Lo que SÍ se crea automáticamente:
- **Tablas** (persona, rol, usuario, geografico, frente_politico)
- **3 Roles** (Administrador, Supervisor, Operador)
- **3 Divisiones geográficas** (Cochabamba, Cercado, Colcapirhua)
- **3 Frentes políticos** (MAS, CC, CREEMOS)

### ❌ Lo que NO se crea automáticamente:
- **USUARIOS** - Las tablas están vacías, NO hay usuarios

---

## 📋 DETALLE COMPLETO

### **1. ROLES** ✅ Automáticos

Cuando ejecutas el script SQL, se crean automáticamente:

```sql
INSERT INTO rol (nombre, descripcion) VALUES
    ('Administrador del Sistema', 'Acceso total...'),
    ('Supervisor', 'Puede supervisar...'),
    ('Operador', 'Puede digitalizar actas...')
```

**Resultado**: 3 roles listos para usar

---

### **2. USUARIOS** ❌ NO Automáticos

El script SQL **NO crea usuarios**. La tabla `usuario` queda **VACÍA**.

**Problema**: No puedes hacer login si no hay usuarios.

**Solución**: Debes crear usuarios manualmente.

---

## 🚀 CÓMO CREAR USUARIOS

### **OPCIÓN 1: Script de Node.js (Recomendado para desarrollo)**

```bash
cd backend
npm run crear-usuarios
```

Esto crea **3 usuarios de prueba**:

| Usuario | Contraseña | Rol | CI | Nombre Completo |
|---------|------------|-----|----|----|
| `perez` | `perez123` | Administrador | 12345678 | Juan Pérez López |
| `supervisor1` | `super123` | Supervisor | 87654321 | María García Mamani |
| `operador1` | `oper123` | Operador | 11223344 | Carlos Mamani Quispe |

**Ventajas**:
- ✅ Rápido y fácil
- ✅ Contraseñas ya hasheadas
- ✅ Datos completos de persona
- ✅ Listo para usar

**Desventajas**:
- ❌ Solo para desarrollo/pruebas
- ❌ Contraseñas conocidas públicamente

---

### **OPCIÓN 2: Crear manualmente en la base de datos**

Si quieres crear un usuario específico:

```sql
-- 1. Crear persona
INSERT INTO persona (nombre, apellido_paterno, apellido_materno, ci, celular, email)
VALUES ('Admin', 'Sistema', NULL, '00000000', '70000000', 'admin@sistema.bo')
RETURNING id_persona;
-- Supongamos que retorna id_persona = 1

-- 2. Crear usuario
-- Contraseña "admin123" hasheada con bcrypt
INSERT INTO usuario (nombre_usuario, contrasena, id_rol, id_persona)
VALUES (
    'admin',
    '$2b$10$rZ8qH8YvK9xJ5fN2mE3wZOqN5xK7vL2pM4nR6sT8uV0wX1yZ2aB3c',
    1,  -- ID del rol Administrador
    1   -- ID de la persona creada arriba
);
```

**⚠️ IMPORTANTE**: La contraseña hasheada de ejemplo es para "admin123"

**Ventajas**:
- ✅ Control total
- ✅ Puedes crear el usuario que quieras

**Desventajas**:
- ❌ Más complejo
- ❌ Necesitas generar el hash de la contraseña

---

### **OPCIÓN 3: Desde la interfaz (Después del primer login)**

Una vez que tengas al menos UN usuario:

1. Hacer login con ese usuario
2. Ir a "Usuarios y Roles"
3. Click en "Nuevo Usuario"
4. Llenar el formulario
5. Crear más usuarios

**Ventajas**:
- ✅ Interfaz gráfica
- ✅ Fácil de usar
- ✅ Validaciones automáticas

**Desventajas**:
- ❌ Necesitas tener al menos un usuario para empezar

---

## 📊 TABLA COMPARATIVA

| Elemento | Script SQL | npm run crear-usuarios | Interfaz Web |
|----------|-----------|------------------------|--------------|
| **Tablas** | ✅ Crea | - | - |
| **Roles** | ✅ Crea (3) | - | - |
| **Usuarios** | ❌ NO crea | ✅ Crea (3) | ✅ Crea |
| **Geografía** | ✅ Crea (3) | - | ✅ Puede crear más |
| **Frentes** | ✅ Crea (3) | - | ✅ Puede crear más |

---

## 🎯 FLUJO RECOMENDADO PARA INSTALACIÓN

### **Para Desarrollo/Pruebas:**

```bash
# 1. Crear base de datos
createdb subnacionales

# 2. Ejecutar script SQL (crea tablas + roles + datos ejemplo)
psql -U postgres -d subnacionales -f backend/sql/00_crear_todas_las_tablas.sql

# 3. Instalar dependencias
npm install
cd backend && npm install && cd ..

# 4. ⚠️ IMPORTANTE: Crear usuarios de prueba
cd backend
npm run crear-usuarios
cd ..

# 5. Configurar .env (frontend y backend)

# 6. Ejecutar
# Terminal 1: cd backend && npm run dev
# Terminal 2: npm run dev

# 7. Login con: perez / perez123
```

---

### **Para Producción:**

```bash
# 1. Crear base de datos
createdb subnacionales

# 2. Ejecutar script SQL
psql -U postgres -d subnacionales -f backend/sql/00_crear_todas_las_tablas.sql

# 3. Crear SOLO el usuario administrador inicial
psql -U postgres -d subnacionales

# En psql:
INSERT INTO persona (nombre, apellido_paterno, ci)
VALUES ('Administrador', 'Sistema', '00000000')
RETURNING id_persona;

-- Usar el id_persona retornado (ejemplo: 1)
INSERT INTO usuario (nombre_usuario, contrasena, id_rol, id_persona)
VALUES (
    'admin',
    '$2b$10$TU_HASH_AQUI',  -- Generar con bcrypt
    1,
    1
);

# 4. Desde la interfaz, crear más usuarios según necesidad
```

---

## 🔐 GENERAR HASH DE CONTRASEÑA

Si necesitas generar un hash para una contraseña específica:

```javascript
// En Node.js
const bcrypt = require('bcrypt');

async function hashPassword(password) {
    const hash = await bcrypt.hash(password, 10);
    console.log(hash);
}

hashPassword('tu_contraseña_aqui');
```

O usar el script incluido:

```bash
cd backend
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('tu_contraseña', 10).then(console.log)"
```

---

## ❓ PREGUNTAS FRECUENTES

### **P: ¿Puedo ejecutar el script SQL múltiples veces?**
R: Sí, usa `ON CONFLICT DO NOTHING` para evitar duplicados.

### **P: ¿Los roles se crean automáticamente?**
R: **SÍ**, el script SQL crea los 3 roles automáticamente.

### **P: ¿Los usuarios se crean automáticamente?**
R: **NO**, debes ejecutar `npm run crear-usuarios` o crearlos manualmente.

### **P: ¿Qué pasa si olvido crear usuarios?**
R: No podrás hacer login. Debes crear al menos un usuario.

### **P: ¿Puedo cambiar las contraseñas de los usuarios de prueba?**
R: Sí, desde la interfaz después de hacer login, o directamente en la BD.

### **P: ¿Es seguro usar los usuarios de prueba en producción?**
R: **NO**, las contraseñas son públicas. Solo para desarrollo.

---

## ✅ CHECKLIST DE VERIFICACIÓN

Después de la instalación, verifica:

```bash
# Conectar a la base de datos
psql -U postgres -d subnacionales

# Verificar roles (debe mostrar 3)
SELECT * FROM rol;

# Verificar usuarios (debe mostrar 0 o 3 según si ejecutaste crear-usuarios)
SELECT u.nombre_usuario, r.nombre as rol, p.nombre, p.apellido_paterno
FROM usuario u
JOIN persona p ON u.id_persona = p.id_persona
JOIN rol r ON u.id_rol = r.id_rol;

# Salir
\q
```

**Resultado esperado**:

Si ejecutaste `npm run crear-usuarios`:
```
 nombre_usuario |          rol           | nombre | apellido_paterno
----------------+------------------------+--------+------------------
 perez          | Administrador del Sistema | Juan   | Pérez
 supervisor1    | Supervisor             | María  | García
 operador1      | Operador               | Carlos | Mamani
```

Si NO ejecutaste `npm run crear-usuarios`:
```
(0 rows)
```

---

## 🚨 IMPORTANTE PARA COMPARTIR EL PROYECTO

Cuando otra persona clone el repositorio:

### **Lo que SÍ tiene automáticamente:**
- ✅ Código fuente
- ✅ Scripts SQL
- ✅ Scripts de Node.js

### **Lo que debe hacer manualmente:**
1. ✅ Instalar PostgreSQL
2. ✅ Crear base de datos `subnacionales`
3. ✅ Ejecutar script SQL
4. ✅ **Ejecutar `npm run crear-usuarios`** (para tener usuarios)
5. ✅ Configurar archivos `.env`
6. ✅ Instalar dependencias (`npm install`)
7. ✅ Ejecutar el sistema

---

## 📝 RESUMEN FINAL

```
Script SQL crea:
├── ✅ Tablas (5)
├── ✅ Roles (3)
├── ✅ Geografía (3 ejemplos)
├── ✅ Frentes (3 ejemplos)
└── ❌ Usuarios (0) ← DEBES CREARLOS

Para crear usuarios:
└── npm run crear-usuarios (crea 3 usuarios de prueba)
```

---

**Última actualización**: Febrero 2026
