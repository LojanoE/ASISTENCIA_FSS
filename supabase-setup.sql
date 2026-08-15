-- ============================================
-- Asistencia FSS — Crear tablas en Supabase
-- Ejecutar en: Supabase → SQL Editor → New Query
--
-- Este archivo es para INSTALACIÓN NUEVA (idempotente).
-- Si tu base YA existe y solo quieres agregar el módulo
-- de contabilidad, ejecuta en su lugar:
--   supabase-migration-contabilidad.sql
-- ============================================

-- 1. Trabajadores
create table if not exists workers (
  id bigint generated always as identity primary key,
  name text not null,
  created_at timestamptz default now()
);

-- 2. Registros de asistencia
create table if not exists attendance_records (
  id bigint generated always as identity primary key,
  worker text not null,
  type text not null,
  date text not null,
  time text not null,
  lat double precision,
  lon double precision,
  status text not null,
  extra text default '',
  diff_mins integer default 0,
  observation text default '',
  created_at timestamptz default now()
);

-- 3. Configuración de horarios
create table if not exists settings (
  id bigint generated always as identity primary key,
  entry_time text not null default '08:00',
  exit_time text not null default '17:00',
  admin_password text not null default '123'
);

-- 4. Envío de fruta
create table if not exists fruit (
  id bigint generated always as identity primary key,
  type text not null,
  supplier text not null default '',
  crates integer not null default 0,
  weight double precision not null default 0,
  date text not null,
  time text not null,
  observation text default '',
  created_at timestamptz default now()
);

-- 5. Transacciones contables de trabajadores (adelantos y cargos)
create table if not exists worker_transactions (
  id bigint generated always as identity primary key,
  worker text not null,
  type text not null,              -- 'adelanto' | 'viveres' | 'prestamo' | 'otro_descuento'
  amount numeric(10,2) not null,
  date text not null,
  description text default '',
  created_by text default '',
  created_at timestamptz default now()
);

-- 6. Períodos de pago (cierres mensuales)
create table if not exists payroll_periods (
  id bigint generated always as identity primary key,
  name text not null,
  start_date text not null,
  end_date text not null,
  status text not null default 'abierto',
  created_at timestamptz default now()
);

-- 7. Sueldos brutos y ajustes por trabajador dentro de un período
create table if not exists payroll_entries (
  id bigint generated always as identity primary key,
  period_id bigint not null references payroll_periods(id) on delete cascade,
  worker text not null,
  base_salary numeric(10,2) not null default 0,
  adjustments numeric(10,2) not null default 0,
  notes text default '',
  created_at timestamptz default now()
);

-- Fila inicial de configuración (solo si settings está vacía — no duplica datos)
insert into settings (entry_time, exit_time, admin_password)
select '08:00', '17:00', '123'
where not exists (select 1 from settings);

-- ============================================
-- RLS: permitir acceso anónimo (sin autenticación)
-- ============================================

alter table workers enable row level security;
alter table attendance_records enable row level security;
alter table settings enable row level security;
alter table fruit enable row level security;
alter table worker_transactions enable row level security;
alter table payroll_periods enable row level security;
alter table payroll_entries enable row level security;

-- Las policies se borran y recrean para que el script sea re-ejecutable
drop policy if exists "Allow all on workers" on workers;
drop policy if exists "Allow all on attendance_records" on attendance_records;
drop policy if exists "Allow all on settings" on settings;
drop policy if exists "Allow all on fruit" on fruit;
drop policy if exists "Allow all on worker_transactions" on worker_transactions;
drop policy if exists "Allow all on payroll_periods" on payroll_periods;
drop policy if exists "Allow all on payroll_entries" on payroll_entries;

create policy "Allow all on workers" on workers for all using (true) with check (true);
create policy "Allow all on attendance_records" on attendance_records for all using (true) with check (true);
create policy "Allow all on settings" on settings for all using (true) with check (true);
create policy "Allow all on fruit" on fruit for all using (true) with check (true);
create policy "Allow all on worker_transactions" on worker_transactions for all using (true) with check (true);
create policy "Allow all on payroll_periods" on payroll_periods for all using (true) with check (true);
create policy "Allow all on payroll_entries" on payroll_entries for all using (true) with check (true);

-- ============================================
-- Si ya creaste las tablas sin admin_password,
-- ejecuta esta línea para agregar la columna:
-- ALTER TABLE settings ADD COLUMN admin_password text NOT NULL DEFAULT '123';
-- ============================================