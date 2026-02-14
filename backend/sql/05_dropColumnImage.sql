-- Agregar columna imagen_url a la tabla acta
ALTER TABLE acta 
ADD COLUMN IF NOT EXISTS imagen_url VARCHAR(500);

-- También agregar columna para indicar si el acta fue editada (si no existe)
ALTER TABLE acta 
ADD COLUMN IF NOT EXISTS editada BOOLEAN DEFAULT FALSE;

-- Agregar columna para fecha de última edición (si no existe)
ALTER TABLE acta 
ADD COLUMN IF NOT EXISTS fecha_ultima_edicion TIMESTAMP;