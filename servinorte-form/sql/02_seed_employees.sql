-- SERVINORTE - Sample Employee Data
-- Replace with actual employee records before production deployment

INSERT INTO employees (dni, legajo, nombre_completo, cuil, is_active) VALUES
('30123456', '1001', 'Juan Carlos Pérez', '20-30123456-7', true),
('32456789', '1002', 'María Elena González', '27-32456789-4', true),
('28654321', '1003', 'Roberto Alejandro Díaz', '20-28654321-9', true),
('35987654', '1004', 'Laura Patricia Rodríguez', '27-35987654-1', true),
('31234567', '1005', 'Carlos Alberto Martínez', '20-31234567-8', true),
('29876543', '1006', 'Ana Inés López', '27-29876543-6', true),
('33456789', '1007', 'Miguel Ángel Torres', '20-33456789-3', true),
('27654321', '1008', 'Sandra Beatriz Flores', '27-27654321-5', true),
('36123456', '1009', 'Diego Fernando Ruiz', '20-36123456-2', true),
('30987654', '1010', 'Patricia Noemí Silva', '27-30987654-0', true)
ON CONFLICT (dni) DO NOTHING;

-- To add more employees, use this template:
-- INSERT INTO employees (dni, legajo, nombre_completo, cuil, is_active) VALUES
-- ('XXXXXXXX', 'XXXX', 'Nombre Apellido', 'XX-XXXXXXXX-X', true);

-- To import from CSV (recommended for bulk load):
-- COPY employees (dni, legajo, nombre_completo, cuil, is_active)
-- FROM '/path/to/employees.csv'
-- WITH (FORMAT csv, HEADER true);
