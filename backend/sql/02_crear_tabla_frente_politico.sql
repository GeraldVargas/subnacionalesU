-- Tabla para almacenar frentes políticos
CREATE TABLE IF NOT EXISTS frente_politico (
    id_frente SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL UNIQUE,
    siglas VARCHAR(50),
    color VARCHAR(7) DEFAULT '#E31E24',
    logo VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsquedas por nombre
CREATE INDEX IF NOT EXISTS idx_frente_nombre ON frente_politico(nombre);

-- Comentarios
COMMENT ON TABLE frente_politico IS 'Almacena información de frentes y partidos políticos';
COMMENT ON COLUMN frente_politico.nombre IS 'Nombre completo del frente político';
COMMENT ON COLUMN frente_politico.siglas IS 'Siglas o abreviatura del frente';
COMMENT ON COLUMN frente_politico.color IS 'Color representativo en formato hexadecimal';
COMMENT ON COLUMN frente_politico.logo IS 'Nombre del archivo del logo';

-- Datos de ejemplo (opcional)
INSERT INTO frente_politico (nombre, siglas, color) 
VALUES 
    ('Movimiento al Socialismo', 'MAS-IPSP', '#0066CC'),
    ('Comunidad Ciudadana', 'CC', '#00A651'),
    ('Creemos', 'CREEMOS', '#FFD700')
ON CONFLICT (nombre) DO NOTHING;
