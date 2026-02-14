-- 04_eliminar_persona.sql
-- Elimina la tabla persona y su referencia desde usuario

BEGIN;

-- 1) Eliminar la FK de usuario -> persona (nombre típico: usuario_id_persona_fkey)
ALTER TABLE usuario
DROP CONSTRAINT IF EXISTS usuario_id_persona_fkey;

-- 2) Eliminar la columna id_persona
ALTER TABLE usuario
DROP COLUMN IF EXISTS id_persona;

-- 3) Eliminar tabla persona
DROP TABLE IF EXISTS persona;

COMMIT;
