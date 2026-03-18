-- =====================================================
-- FIX: Integridad de datos y relaciones
-- Descripción: Arregla problemas de integridad
--              referencial en mesa, recinto y acta
-- =====================================================

-- 1. Asegurar que recinto tenga la columna id_geografico
ALTER TABLE recinto ADD COLUMN IF NOT EXISTS id_geografico INTEGER REFERENCES geografico(id_geografico) ON DELETE CASCADE;

-- 2. Actualizar mesas huérfanas (sin recinto)
-- NOTA: Esto es un diagnóstico, no eliminará mesas
SELECT id_mesa, numero_mesa, codigo FROM mesa WHERE id_recinto IS NULL;

-- 3. Agregar constraint NOT NULL a mesa.id_recinto para prevenir futuros NULLs
-- Primero asegurarse de que no hay NULLs
-- UPDATE mesa SET id_recinto = 1 WHERE id_recinto IS NULL; -- Línea de comentario por seguridad

-- Si decidimos hacer el constraint NOT NULL, se requiere que todas las mesas tengan recinto:
-- ALTER TABLE mesa ADD CONSTRAINT chk_mesa_recinto_not_null CHECK (id_recinto IS NOT NULL);

-- 4. Crear índice para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_recinto_geografico ON recinto(id_geografico);

-- 5. Verificar integridad de actas
SELECT a.id_acta, a.estado_aprobacion, a.id_usuario_aprobador, a.fecha_aprobacion
FROM acta a
WHERE a.estado_aprobacion IN ('aprobado', 'rechazado') AND a.id_usuario_aprobador IS NULL;

-- 6. Crear índice compuesto para búsquedas de seguimiento
CREATE INDEX IF NOT EXISTS idx_acta_mesa_estado
ON acta(id_mesa, estado_aprobacion, fecha_registro);

-- 7. Documentar el estado
DO $$
DECLARE
    mesas_sin_recinto INTEGER;
    actas_sin_aprobador INTEGER;
BEGIN
    SELECT COUNT(*) INTO mesas_sin_recinto FROM mesa WHERE id_recinto IS NULL;
    SELECT COUNT(*) INTO actas_sin_aprobador FROM acta WHERE estado_aprobacion IN ('aprobado', 'rechazado') AND id_usuario_aprobador IS NULL;

    RAISE NOTICE '==========================================';
    RAISE NOTICE 'DIAGNÓSTICO DE INTEGRIDAD';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Mesas sin recinto: %', mesas_sin_recinto;
    RAISE NOTICE 'Actas aprobadas/rechazadas sin aprobador: %', actas_sin_aprobador;
    RAISE NOTICE '==========================================';
END $$;
