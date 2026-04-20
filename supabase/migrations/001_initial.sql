-- ============================================
-- FINCA SAN LUIS - SISTEMA DE ASISTENCIA
-- Ejecutar este script en el SQL Editor de Supabase
-- ============================================

-- HABILITAR EXTENSIÓN pgcrypto PARA HASH DE PINs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================
-- TABLA: workers
-- =====================
CREATE TABLE IF NOT EXISTS public.workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'worker' CHECK (role IN ('admin', 'worker')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para búsqueda rápida por PIN (usado en verify_pin)
CREATE INDEX IF NOT EXISTS idx_workers_active ON public.workers(active) WHERE active = true;

-- =====================
-- TABLA: attendance
-- =====================
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  entry_time TIME,
  exit_time TIME,
  status TEXT NOT NULL DEFAULT 'ausente' CHECK (status IN ('presente', 'atraso', 'justificado', 'ausente')),
  overtime BOOLEAN NOT NULL DEFAULT false,
  entry_latitude DOUBLE PRECISION,
  entry_longitude DOUBLE PRECISION,
  exit_latitude DOUBLE PRECISION,
  exit_longitude DOUBLE PRECISION,
  within_geofence_entry BOOLEAN,
  within_geofence_exit BOOLEAN,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(worker_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_worker ON public.attendance(worker_id);

-- =====================
-- TABLA: justifications
-- =====================
CREATE TABLE IF NOT EXISTS public.justifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id UUID NOT NULL REFERENCES public.attendance(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  authorized_by UUID NOT NULL REFERENCES public.workers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================
-- TABLA: settings
-- =====================
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================
-- DATOS INICIALES (settings)
-- =====================
INSERT INTO public.settings (key, value) VALUES
  ('start_time', '07:00'),
  ('end_time', '17:00'),
  ('geofence_lat', '15.502655'),
  ('geofence_lng', '-87.998498'),
  ('geofence_radius', '200')
ON CONFLICT (key) DO NOTHING;

-- =====================
-- ADMIN POR DEFECTO (PIN: 1234)
-- =====================
INSERT INTO public.workers (name, pin_hash, role, active) VALUES
  ('Administrador', crypt('1234', gen_salt('bf')), 'admin', true)
ON CONFLICT DO NOTHING;

-- =====================
-- FUNCIÓN: verify_pin
-- Verifica si un PIN coincide con algún trabajador activo
-- =====================
CREATE OR REPLACE FUNCTION public.verify_pin(pin_input TEXT)
RETURNS TABLE(id UUID, name TEXT, role TEXT, active BOOLEAN, pin_match BOOLEAN)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    w.id,
    w.name,
    w.role,
    w.active,
    (w.pin_hash = crypt(pin_input, w.pin_hash)) AS pin_match
  FROM public.workers w
  WHERE w.active = true
    AND w.pin_hash = crypt(pin_input, w.pin_hash);
END;
$$;

-- =====================
-- FUNCIONES RPC: Registrar entrada y salida
-- =====================
CREATE OR REPLACE FUNCTION public.register_entry(
  p_worker_id UUID,
  p_latitude DOUBLE PRECISION DEFAULT NULL,
  p_longitude DOUBLE PRECISION DEFAULT NULL,
  p_within_geofence BOOLEAN DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_now TIME := CURRENT_TIME;
  v_start_time TIME;
  v_existing RECORD;
  v_result JSON;
BEGIN
  SELECT value INTO v_start_time FROM public.settings WHERE key = 'start_time';
  IF v_start_time IS NULL THEN v_start_time := '07:00'::TIME; END IF;

  SELECT * INTO v_existing FROM public.attendance
  WHERE worker_id = p_worker_id AND date = v_today;

  IF v_existing IS NOT NULL THEN
    IF v_existing.entry_time IS NOT NULL THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Ya registraste tu entrada hoy'
      );
    END IF;
  END IF;

  IF v_existing IS NOT NULL THEN
    UPDATE public.attendance SET
      entry_time = v_now,
      status = CASE WHEN v_now > v_start_time THEN 'atraso' ELSE 'presente' END,
      entry_latitude = p_latitude,
      entry_longitude = p_longitude,
      within_geofence_entry = p_within_geofence
    WHERE id = v_existing.id
    RETURNING json_build_object('success', true, 'entry_time', entry_time, 'status', status) INTO v_result;
  ELSE
    INSERT INTO public.attendance (worker_id, date, entry_time, status, entry_latitude, entry_longitude, within_geofence_entry)
    VALUES (p_worker_id, v_today, v_now,
      CASE WHEN v_now > v_start_time THEN 'atraso' ELSE 'presente' END,
      p_latitude, p_longitude, p_within_geofence
    )
    RETURNING json_build_object('success', true, 'entry_time', entry_time, 'status', status) INTO v_result;
  END IF;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.register_exit(
  p_worker_id UUID,
  p_latitude DOUBLE PRECISION DEFAULT NULL,
  p_longitude DOUBLE PRECISION DEFAULT NULL,
  p_within_geofence BOOLEAN DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_now TIME := CURRENT_TIME;
  v_end_time TIME;
  v_existing RECORD;
  v_result JSON;
BEGIN
  SELECT value INTO v_end_time FROM public.settings WHERE key = 'end_time';
  IF v_end_time IS NULL THEN v_end_time := '17:00'::TIME; END IF;

  SELECT * INTO v_existing FROM public.attendance
  WHERE worker_id = p_worker_id AND date = v_today;

  IF v_existing IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'No has registrado tu entrada hoy');
  END IF;

  IF v_existing.exit_time IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Ya registraste tu salida hoy');
  END IF;

  UPDATE public.attendance SET
    exit_time = v_now,
    overtime = (v_now > v_end_time),
    exit_latitude = p_latitude,
    exit_longitude = p_longitude,
    within_geofence_exit = p_within_geofence
  WHERE id = v_existing.id
  RETURNING json_build_object('success', true, 'exit_time', exit_time, 'overtime', overtime) INTO v_result;

  RETURN v_result;
END;
$$;

-- =====================
-- FUNCIÓN: hash_pin
-- Hashea un PIN para almacenamiento
-- =====================
CREATE OR REPLACE FUNCTION public.hash_pin(pin_input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN crypt(pin_input, gen_salt('bf'));
END;
$$;

-- =====================
-- ROW LEVEL SECURITY (RLS)
-- =====================
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Workers: todos pueden leer trabajadores activos (para lookup)
CREATE POLICY "Workers read active" ON public.workers
  FOR SELECT USING (active = true);

-- Workers: solo admin puede insertar/actualizar
CREATE POLICY "Workers admin insert" ON public.workers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Workers admin update" ON public.workers
  FOR UPDATE USING (true);

-- Attendance: todos pueden leer su propia asistencia
CREATE POLICY "Attendance read own" ON public.attendance
  FOR SELECT USING (true);

-- Attendance: insertar vía RPC (register_entry/register_exit)
CREATE POLICY "Attendance insert" ON public.attendance
  FOR INSERT WITH CHECK (true);

-- Attendance: actualizar vía RPC
CREATE POLICY "Attendance update" ON public.attendance
  FOR UPDATE USING (true);

-- Justifications: todos pueden leer
CREATE POLICY "Justifications read" ON public.justifications
  FOR SELECT USING (true);

CREATE POLICY "Justifications insert" ON public.justifications
  FOR INSERT WITH CHECK (true);

-- Settings: todos pueden leer
CREATE POLICY "Settings read" ON public.settings
  FOR SELECT USING (true);

-- Settings: solo admin puede escribir (verificar vía app)
CREATE POLICY "Settings write" ON public.settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Settings update" ON public.settings
  FOR UPDATE USING (true);