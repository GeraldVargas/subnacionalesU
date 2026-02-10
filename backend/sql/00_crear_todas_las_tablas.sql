-- ============================================
-- SCRIPT COMPLETO DE CREACIÓN DE BASE DE DATOS
-- Sistema Electoral Subnacional - Colcapirhua 2026
-- ============================================

-- IMPORTANTE: Ejecutar este script después de crear la base de datos 'subnacionales'
-- Comando: psql -U postgres -d subnacionales -f 00_crear_todas_las_tablas.sql

-- ============================================
-- 1. TABLA: persona
-- ============================================
-- Almacena información personal de individuos

CREATE TABLE IF NOT EXISTS persona (
    id_persona SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    ci VARCHAR(20) UNIQUE NOT NULL,
    celular VARCHAR(20),
    email VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_persona_ci ON persona(ci);
CREATE INDEX IF NOT EXISTS idx_persona_nombre ON persona(nombre, apellido_paterno);

COMMENT ON TABLE persona IS 'Datos personales de individuos del sistema';
COMMENT ON COLUMN persona.ci IS 'Carnet de Identidad - Único';

-- ============================================
-- 2. TABLA: rol
-- ============================================
-- Define los roles y permisos del sistema

CREATE TABLE IF NOT EXISTS rol (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE rol IS 'Roles del sistema con sus permisos';

-- Insertar roles por defecto
INSERT INTO rol (nombre, descripcion) VALUES
    ('Administrador del Sistema', 'Acceso total al sistema, puede gestionar usuarios, configuraciones y todos los módulos'),
    ('Supervisor', 'Puede supervisar y validar datos, acceso a reportes y control de calidad'),
    ('Operador', 'Puede digitalizar actas y capturar datos electorales')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- 3. TABLA: usuario
-- ============================================
-- Usuarios del sistema con autenticación

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    id_rol INTEGER REFERENCES rol(id_rol) ON DELETE SET NULL,
    id_persona INTEGER REFERENCES persona(id_persona) ON DELETE CASCADE,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP,
    CONSTRAINT chk_fechas CHECK (fecha_fin IS NULL OR fecha_fin > fecha_inicio)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_usuario_nombre ON usuario(nombre_usuario);
CREATE INDEX IF NOT EXISTS idx_usuario_rol ON usuario(id_rol);
CREATE INDEX IF NOT EXISTS idx_usuario_activo ON usuario(fecha_fin) WHERE fecha_fin IS NULL;

COMMENT ON TABLE usuario IS 'Usuarios del sistema con credenciales de acceso';
COMMENT ON COLUMN usuario.contrasena IS 'Contraseña hasheada con bcrypt';
COMMENT ON COLUMN usuario.fecha_fin IS 'NULL = usuario activo, con valor = usuario inactivo (soft delete)';

-- ============================================
-- 4. TABLA: geografico
-- ============================================
-- Divisiones geográficas jerárquicas

CREATE TABLE IF NOT EXISTS geografico (
    id_geografico SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    codigo VARCHAR(50),
    ubicacion TEXT,
    tipo VARCHAR(50) NOT NULL,
    fk_id_geografico INTEGER REFERENCES geografico(id_geografico) ON DELETE CASCADE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_no_auto_referencia CHECK (id_geografico != fk_id_geografico)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_geografico_tipo ON geografico(tipo);
CREATE INDEX IF NOT EXISTS idx_geografico_padre ON geografico(fk_id_geografico);
CREATE INDEX IF NOT EXISTS idx_geografico_nombre ON geografico(nombre);

COMMENT ON TABLE geografico IS 'Divisiones geográficas jerárquicas (Departamento, Provincia, Municipio, etc.)';
COMMENT ON COLUMN geografico.fk_id_geografico IS 'ID del padre en la jerarquía (auto-referencia)';
COMMENT ON COLUMN geografico.tipo IS 'Tipo de división: Departamento, Provincia, Municipio, Distrito, Zona, OTB, etc.';

-- Datos de ejemplo (Cochabamba)
INSERT INTO geografico (nombre, codigo, tipo, fk_id_geografico) VALUES
    ('Cochabamba', 'CB', 'Departamento', NULL),
    ('Cercado', 'CB-CER', 'Provincia', 1),
    ('Colcapirhua', 'CB-CER-COL', 'Municipio', 2)
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. TABLA: frente_politico
-- ============================================
-- Partidos y frentes políticos

CREATE TABLE IF NOT EXISTS frente_politico (
    id_frente SERIAL PRIMARY KEY,
    nombre VARCHAR(200) UNIQUE NOT NULL,
    siglas VARCHAR(50),
    color VARCHAR(7) DEFAULT '#E31E24',
    logo VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_frente_nombre ON frente_politico(nombre);

COMMENT ON TABLE frente_politico IS 'Partidos políticos y frentes electorales';
COMMENT ON COLUMN frente_politico.color IS 'Color en formato hexadecimal (#RRGGBB)';
COMMENT ON COLUMN frente_politico.logo IS 'Nombre del archivo de logo almacenado en el servidor';

-- Trigger para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_frente
    BEFORE UPDATE ON frente_politico
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

-- Datos de ejemplo
INSERT INTO frente_politico (nombre, siglas, color) VALUES
    ('Movimiento al Socialismo', 'MAS-IPSP', '#0066CC'),
    ('Comunidad Ciudadana', 'CC', '#FF6B00'),
    ('Creemos', 'CREEMOS', '#00A651')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- VERIFICACIÓN DE TABLAS CREADAS
-- ============================================

-- Mostrar todas las tablas
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as num_columnas
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================
-- RESUMEN
-- ============================================
-- Tablas creadas:
-- 1. persona (datos personales)
-- 2. rol (roles del sistema)
-- 3. usuario (usuarios con autenticación)
-- 4. geografico (divisiones geográficas)
-- 5. frente_politico (partidos políticos)
--
-- Relaciones:
-- - usuario → persona (1:1)
-- - usuario → rol (N:1)
-- - geografico → geografico (auto-referencia para jerarquía)
--
-- Datos de ejemplo insertados:
-- - 3 roles (Administrador, Supervisor, Operador)
-- - 3 divisiones geográficas (Cochabamba, Cercado, Colcapirhua)
-- - 3 frentes políticos (MAS, CC, CREEMOS)
-- ============================================
