-- =========================================================
-- MIGRACIÓN: Actualizar valores de criticidad en hallazgo
-- De: 'bajo', 'medio', 'alto', 'elevado'
-- A: 'TRIVIAL', 'TOLERABLE', 'MODERADO', 'IMPORTANTE', 'INTOLERABLE'
-- =========================================================

BEGIN;

-- 1. Actualizar valores existentes si los hay
UPDATE hallazgo SET criticidad = 'TRIVIAL' WHERE criticidad = 'bajo';
UPDATE hallazgo SET criticidad = 'MODERADO' WHERE criticidad = 'medio';
UPDATE hallazgo SET criticidad = 'IMPORTANTE' WHERE criticidad = 'alto';
UPDATE hallazgo SET criticidad = 'INTOLERABLE' WHERE criticidad = 'elevado';

-- 2. Eliminar el constraint viejo
ALTER TABLE hallazgo DROP CONSTRAINT IF EXISTS hallazgo_criticidad_check;

-- 3. Agregar el nuevo constraint con los valores correctos
ALTER TABLE hallazgo ADD CONSTRAINT hallazgo_criticidad_check
    CHECK (criticidad IN ('TRIVIAL', 'TOLERABLE', 'MODERADO', 'IMPORTANTE', 'INTOLERABLE'));

COMMIT;

-- Verificar los cambios
SELECT criticidad, COUNT(*) as total
FROM hallazgo
GROUP BY criticidad;
