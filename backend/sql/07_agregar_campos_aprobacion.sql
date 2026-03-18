-- =====================================================
-- Migración: Sistema de Aprobación/Rechazo de Actas
-- Fecha: 2026-03-17
-- Descripción: Agrega campos para el flujo de validación
--              de actas con aprobación/rechazo y motivos
-- =====================================================

-- 1. Agregar campos de aprobación a la tabla acta
ALTER TABLE acta
ADD COLUMN IF NOT EXISTS estado_aprobacion VARCHAR(20) DEFAULT 'pendiente',
ADD COLUMN IF NOT EXISTS motivo_rechazo TEXT,
ADD COLUMN IF NOT EXISTS fecha_aprobacion TIMESTAMP,
ADD COLUMN IF NOT EXISTS id_usuario_aprobador INTEGER;

-- 2. Agregar foreign key para usuario aprobador
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_acta_usuario_aprobador'
    ) THEN
        ALTER TABLE acta
        ADD CONSTRAINT fk_acta_usuario_aprobador
        FOREIGN KEY (id_usuario_aprobador)
        REFERENCES usuario(id_usuario)
        ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Agregar constraint para validar estados permitidos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_estado_aprobacion'
    ) THEN
        ALTER TABLE acta
        ADD CONSTRAINT chk_estado_aprobacion
        CHECK (estado_aprobacion IN ('pendiente', 'aprobado', 'rechazado'));
    END IF;
END $$;

-- 4. Actualizar actas existentes a estado 'pendiente' (por defecto ya está)
UPDATE acta
SET estado_aprobacion = 'pendiente'
WHERE estado_aprobacion IS NULL;

-- 5. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_acta_estado_aprobacion
ON acta(estado_aprobacion);

CREATE INDEX IF NOT EXISTS idx_acta_usuario_aprobador
ON acta(id_usuario_aprobador);

CREATE INDEX IF NOT EXISTS idx_acta_fecha_aprobacion
ON acta(fecha_aprobacion);

-- 6. Agregar comentarios descriptivos
COMMENT ON COLUMN acta.estado_aprobacion IS
'Estado de validación del acta: pendiente (recién registrada), aprobado (validada), rechazado (con errores)';

COMMENT ON COLUMN acta.motivo_rechazo IS
'Razón detallada del rechazo cuando estado_aprobacion = rechazado. NULL si está aprobada o pendiente';

COMMENT ON COLUMN acta.fecha_aprobacion IS
'Fecha y hora en que el acta fue aprobada o rechazada';

COMMENT ON COLUMN acta.id_usuario_aprobador IS
'Usuario (Admin u Operador) que validó el acta, ya sea aprobándola o rechazándola';

-- 7. Mostrar estadísticas después de la migración
DO $$
DECLARE
    total_actas INTEGER;
    actas_pendientes INTEGER;
    actas_aprobadas INTEGER;
    actas_rechazadas INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_actas FROM acta;
    SELECT COUNT(*) INTO actas_pendientes FROM acta WHERE estado_aprobacion = 'pendiente';
    SELECT COUNT(*) INTO actas_aprobadas FROM acta WHERE estado_aprobacion = 'aprobado';
    SELECT COUNT(*) INTO actas_rechazadas FROM acta WHERE estado_aprobacion = 'rechazado';

    RAISE NOTICE '==========================================';
    RAISE NOTICE 'MIGRACIÓN COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Total de actas en sistema: %', total_actas;
    RAISE NOTICE 'Actas pendientes: %', actas_pendientes;
    RAISE NOTICE 'Actas aprobadas: %', actas_aprobadas;
    RAISE NOTICE 'Actas rechazadas: %', actas_rechazadas;
    RAISE NOTICE '==========================================';
END $$;
