-- ============================================
-- Asistencia FSS — Crear tablas en Supabase
-- Ejecutar en: Supabase → SQL Editor → New Query
-- ============================================

-- 1. Trabajadores
create table workers (
  id bigint generated always as identity primary key,
  name text not null,
  created_at timestamptz default now()
);

-- 2. Registros de asistencia
create table attendance_records (
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
create table settings (
  id bigint generated always as identity primary key,
  entry_time text not null default '08:00',
  exit_time text not null default '17:00',
  admin_password text not null default '123'
);

-- 4. Envío de fruta
create table fruit (
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

-- Fila inicial de configuración (incluye contraseña de admin)
insert into settings (entry_time, exit_time, admin_password) values ('08:00', '17:00', '123');

-- ============================================
-- RLS: permitir acceso anónimo (sin autenticación)
-- ============================================

alter table workers enable row level security;
alter table attendance_records enable row level security;
alter table settings enable row level security;
alter table fruit enable row level security;

create policy "Allow all on workers" on workers for all using (true) with check (true);
create policy "Allow all on attendance_records" on attendance_records for all using (true) with check (true);
create policy "Allow all on settings" on settings for all using (true) with check (true);
create policy "Allow all on fruit" on fruit for all using (true) with check (true);

-- ============================================
-- Si ya creaste las tablas sin admin_password,
-- ejecuta esta línea para agregar la columna:
-- ALTER TABLE settings ADD COLUMN admin_password text NOT NULL DEFAULT '123';
-- ============================================