-- SERVINORTE - Employee Data Update Form
-- Database Schema v1.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Employees table (pre-populated with active employees)
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  dni VARCHAR(8) UNIQUE NOT NULL,
  legajo VARCHAR(20) NOT NULL,
  nombre_completo VARCHAR(200) NOT NULL,
  cuil VARCHAR(13) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_employees_dni ON employees(dni);
CREATE INDEX idx_employees_legajo ON employees(legajo);
CREATE INDEX idx_employees_active ON employees(is_active);

-- Form submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  legajo VARCHAR(20) NOT NULL,
  nombre_completo VARCHAR(200) NOT NULL,
  dni VARCHAR(8) NOT NULL,
  cuil VARCHAR(13) NOT NULL,
  
  -- Section 1: Personal Data
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(30) NOT NULL,
  
  -- Section 2: Obra Social
  obra_social VARCHAR(200) NOT NULL,
  url_obra_social VARCHAR(500),
  id_archivo_obra_social VARCHAR(200),
  
  -- Section 3: Domicilio
  provincia VARCHAR(100) NOT NULL,
  localidad VARCHAR(100) NOT NULL,
  barrio VARCHAR(100) NOT NULL,
  calle VARCHAR(200) NOT NULL,
  numero VARCHAR(20) NOT NULL,
  manzana VARCHAR(50),
  block VARCHAR(50),
  piso VARCHAR(20),
  departamento VARCHAR(50),
  descripcion_vivienda TEXT NOT NULL,
  
  -- Section 4: Exact Location
  latitud DECIMAL(10,8),
  longitud DECIMAL(11,8),
  direccion_formateada VARCHAR(500),
  place_id VARCHAR(200),
  
  -- Section 5: Address Evidence
  url_imagen_domicilio VARCHAR(500),
  id_archivo_domicilio VARCHAR(200),
  
  -- Section 6: Declaration
  declaracion_jurada BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadata
  estado VARCHAR(20) DEFAULT 'completado' CHECK (estado IN ('pendiente', 'completado', 'anulado')),
  sheets_row INTEGER,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_submissions_dni ON form_submissions(dni);
CREATE INDEX idx_submissions_legajo ON form_submissions(legajo);
CREATE INDEX idx_submissions_estado ON form_submissions(estado);
CREATE INDEX idx_submissions_created_at ON form_submissions(created_at DESC);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  employee_dni VARCHAR(8),
  submission_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_employee ON audit_log(employee_dni);
CREATE INDEX idx_audit_event ON audit_log(event_type);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

-- Admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash VARCHAR(64) NOT NULL,
  ip_address VARCHAR(45),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_sessions_token ON admin_sessions(token_hash);
CREATE INDEX idx_admin_sessions_expires ON admin_sessions(expires_at);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON form_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
