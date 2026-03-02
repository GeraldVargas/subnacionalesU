-- ============================================
-- AGREGAR NUEVOS ROLES Y TABLAS DE PERMISOS
-- Sistema Electoral - Colcapirhua 2026
-- ============================================

-- ============================================
-- 1. AGREGAR 2 NUEVOS ROLES
-- ============================================
-- Se agregan dos roles adicionales: Delegado de Mesa y Jefe de Recinto
-- Sin modificar los roles existentes (Administrador y Operador)

INSERT INTO rol (nombre, descripcion) 
VALUES ('Delegado de Mesa', 'Acceso a una mesa específica para ver votos y registrar actas')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO rol (nombre, descripcion) 
VALUES ('Jefe de Recinto', 'Acceso a un recinto completo para ver, editar y registrar actas de sus mesas')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- 1.5. CREAR TABLA: recinto (si no existe)
-- ============================================
-- Para almacenar los recintos electorales

CREATE TABLE IF NOT EXISTS recinto (
    id_recinto SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    direccion VARCHAR(255),
    municipio VARCHAR(100),
    provincia VARCHAR(100),
    departamento VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_recinto_nombre ON recinto(nombre);

COMMENT ON TABLE recinto IS 'Recintos electorales del sistema';

-- ============================================
-- 2. CREAR TABLA: delegado_mesa
-- ============================================
-- Almacena la asignación de delegados a mesas específicas
-- Un delegado puede tener acceso a una o más mesas

CREATE TABLE IF NOT EXISTS delegado_mesa (
    id_delegado_mesa SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuario(id_usuario) ON DELETE CASCADE NOT NULL,
    id_mesa INTEGER REFERENCES mesa(id_mesa) ON DELETE CASCADE NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    UNIQUE(id_usuario, id_mesa)
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_delegado_usuario ON delegado_mesa(id_usuario);
CREATE INDEX IF NOT EXISTS idx_delegado_mesa ON delegado_mesa(id_mesa);
CREATE INDEX IF NOT EXISTS idx_delegado_activo ON delegado_mesa(activo);

-- Documentación
COMMENT ON TABLE delegado_mesa IS 'Asignación de delegados a mesas específicas';
COMMENT ON COLUMN delegado_mesa.id_usuario IS 'Usuario con rol Delegado de Mesa';
COMMENT ON COLUMN delegado_mesa.id_mesa IS 'Mesa electoral a la que está asignado';
COMMENT ON COLUMN delegado_mesa.fecha_asignacion IS 'Fecha y hora de la asignación';
COMMENT ON COLUMN delegado_mesa.activo IS 'TRUE = asignación activa, FALSE = asignación inactiva (soft delete)';

-- ============================================
-- 3. CREAR TABLA: jefe_recinto
-- ============================================
-- Almacena la asignación de jefes de recinto a recintos específicos
-- Un jefe de recinto puede tener control sobre un o más recintos

CREATE TABLE IF NOT EXISTS jefe_recinto (
    id_jefe_recinto SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuario(id_usuario) ON DELETE CASCADE NOT NULL,
    id_recinto INTEGER REFERENCES recinto(id_recinto) ON DELETE CASCADE NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    UNIQUE(id_usuario, id_recinto)
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_jefe_usuario ON jefe_recinto(id_usuario);
CREATE INDEX IF NOT EXISTS idx_jefe_recinto ON jefe_recinto(id_recinto);
CREATE INDEX IF NOT EXISTS idx_jefe_activo ON jefe_recinto(activo);

-- Documentación
COMMENT ON TABLE jefe_recinto IS 'Asignación de jefes de recinto a recintos específicos';
COMMENT ON COLUMN jefe_recinto.id_usuario IS 'Usuario con rol Jefe de Recinto';
COMMENT ON COLUMN jefe_recinto.id_recinto IS 'Recinto electoral al que está asignado';
COMMENT ON COLUMN jefe_recinto.fecha_asignacion IS 'Fecha y hora de la asignación';
COMMENT ON COLUMN jefe_recinto.activo IS 'TRUE = asignación activa, FALSE = asignación inactiva (soft delete)';

-- ============================================
-- RESUMEN DE CAMBIOS
-- ============================================
-- Roles agregados:
-- - Delegado de Mesa (id_rol = 3): Acceso a mesa específica, puede ver votos y registrar actas
-- - Jefe de Recinto (id_rol = 4): Acceso a recinto completo, puede ver, editar y registrar actas
--
-- Tablas creadas:
-- 1. recinto: Recintos electorales
-- 2. delegado_mesa: Relación N:N entre usuario y mesa
-- 3. jefe_recinto: Relación N:N entre usuario y recinto
--
-- Roles existentes (SIN CAMBIOS):
-- - Administrador del Sistema
-- - Operador
--
-- Relaciones creadas:
-- - delegado_mesa → usuario (N:1)
-- - delegado_mesa → mesa (N:1)
-- - jefe_recinto → usuario (N:1)
-- - jefe_recinto → recinto (N:1)
-- ============================================
