-- ============================================
-- TABLAS ADICIONALES PARA SISTEMA DE VOTOS
-- Sistema Electoral - Colcapirhua 2026
-- ============================================

-- ============================================
-- 1. TABLA: recinto
-- ============================================
-- Recintos electorales (colegios, centros, etc.)

CREATE TABLE IF NOT EXISTS recinto (
    id_recinto SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    direccion VARCHAR(300),
    id_geografico INTEGER REFERENCES geografico(id_geografico) ON DELETE CASCADE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recinto_geografico ON recinto(id_geografico);
CREATE INDEX IF NOT EXISTS idx_recinto_nombre ON recinto(nombre);

COMMENT ON TABLE recinto IS 'Recintos electorales (colegios, centros de votación)';

-- ============================================
-- 2. MODIFICAR TABLA: mesa
-- ============================================
-- Agregar relación con recinto y geografico

ALTER TABLE mesa ADD COLUMN IF NOT EXISTS id_recinto INTEGER REFERENCES recinto(id_recinto) ON DELETE SET NULL;
ALTER TABLE mesa ADD COLUMN IF NOT EXISTS id_geografico INTEGER REFERENCES geografico(id_geografico) ON DELETE SET NULL;
ALTER TABLE mesa ADD COLUMN IF NOT EXISTS numero_mesa INTEGER;

CREATE INDEX IF NOT EXISTS idx_mesa_recinto ON mesa(id_recinto);
CREATE INDEX IF NOT EXISTS idx_mesa_geografico ON mesa(id_geografico);

-- ============================================
-- 3. TABLA: acta
-- ============================================
-- Actas electorales

CREATE TABLE IF NOT EXISTS acta (
    id_acta SERIAL PRIMARY KEY,
    id_mesa INTEGER REFERENCES mesa(id_mesa) ON DELETE CASCADE NOT NULL,
    id_tipo_eleccion INTEGER REFERENCES tipo_eleccion(id_tipo_eleccion) ON DELETE SET NULL,
    id_usuario INTEGER REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    votos_totales INTEGER DEFAULT 0,
    votos_validos INTEGER DEFAULT 0,
    votos_nulos INTEGER DEFAULT 0,
    votos_blancos INTEGER DEFAULT 0,
    observaciones TEXT,
    estado VARCHAR(50) DEFAULT 'registrada',
    CONSTRAINT chk_votos_positivos CHECK (
        votos_nulos >= 0 AND 
        votos_blancos >= 0 AND 
        votos_validos >= 0 AND
        votos_totales >= 0
    )
);

CREATE INDEX IF NOT EXISTS idx_acta_mesa ON acta(id_mesa);
CREATE INDEX IF NOT EXISTS idx_acta_usuario ON acta(id_usuario);
CREATE INDEX IF NOT EXISTS idx_acta_estado ON acta(estado);
CREATE INDEX IF NOT EXISTS idx_acta_fecha ON acta(fecha_registro);

COMMENT ON TABLE acta IS 'Actas electorales registradas';
COMMENT ON COLUMN acta.estado IS 'Estados posibles: registrada, validada, rechazada, pendiente';

-- ============================================
-- 4. TABLA: voto
-- ============================================
-- Votos por frente político en cada acta

CREATE TABLE IF NOT EXISTS voto (
    id_voto SERIAL PRIMARY KEY,
    id_acta INTEGER REFERENCES acta(id_acta) ON DELETE CASCADE NOT NULL,
    id_frente INTEGER REFERENCES frente_politico(id_frente) ON DELETE SET NULL NOT NULL,
    cantidad INTEGER DEFAULT 0 NOT NULL,
    tipo_cargo VARCHAR(50),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_cantidad_positiva CHECK (cantidad >= 0)
);

CREATE INDEX IF NOT EXISTS idx_voto_acta ON voto(id_acta);
CREATE INDEX IF NOT EXISTS idx_voto_frente ON voto(id_frente);
CREATE INDEX IF NOT EXISTS idx_voto_cargo ON voto(tipo_cargo);

COMMENT ON TABLE voto IS 'Votos registrados por frente político';
COMMENT ON COLUMN voto.tipo_cargo IS 'Tipos posibles: alcalde, concejal, etc.';

-- ============================================
-- DATOS GEOGRÁFICOS BASE
-- ============================================

-- Solo asegurar que exista Colcapirhua
INSERT INTO geografico (nombre, codigo, tipo, fk_id_geografico) VALUES
    ('Cochabamba', 'CB', 'Departamento', NULL),
    ('Cercado', 'CB-CER', 'Provincia', (SELECT id_geografico FROM geografico WHERE nombre = 'Cochabamba' AND tipo = 'Departamento' LIMIT 1)),
    ('Colcapirhua', 'CB-CER-COL', 'Municipio', (SELECT id_geografico FROM geografico WHERE nombre = 'Cercado' AND tipo = 'Provincia' LIMIT 1))
ON CONFLICT (nombre) DO NOTHING;

-- Los recintos y mesas se agregarán desde la interfaz web

-- ============================================
-- RESUMEN
-- ============================================
-- Tablas creadas/modificadas:
-- 1. recinto (nuevo)
-- 2. mesa (modificado - agregado id_recinto, id_geografico, numero_mesa)
-- 3. acta (nuevo)
-- 4. voto (nuevo)
--
-- Relaciones:
-- - recinto → geografico (N:1)
-- - mesa → recinto (N:1)
-- - mesa → geografico (N:1)
-- - acta → mesa (N:1)
-- - acta → tipo_eleccion (N:1)
-- - acta → usuario (N:1)
-- - voto → acta (N:1)
-- - voto → frente_politico (N:1)
-- ============================================
