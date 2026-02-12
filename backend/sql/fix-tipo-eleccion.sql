-- Insertar tipos de elección si no existen
INSERT INTO tipo_eleccion (nombre, codigo) VALUES
    ('Elecciones Subnacionales', 'SUBNAC'),
    ('Elecciones Generales', 'GENERAL'),
    ('Referéndum', 'REFER')
ON CONFLICT DO NOTHING;

-- Verificar datos
SELECT * FROM tipo_eleccion;
