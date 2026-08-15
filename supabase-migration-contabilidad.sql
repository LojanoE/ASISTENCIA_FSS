-- ============================================
-- Asistencia FSS — MIGRACIÓN: Módulo de Contabilidad
-- ============================================
-- Ejecutar UNA VEZ en: Supabase → SQL Editor → New Query
-- sobre una base de datos que YA tiene las tablas antiguas
-- (workers, attendance_records, settings, fruit).
--
-- Este script SOLO crea las tablas nuevas del módulo contable.
-- NO toca, NO borra ni modifica ninguna tabla ni dato existente.
-- Usa "if not exists", así que ejecutarlo dos veces tampoco causa daño.
-- ============================================

-- 1. Transacciones contables de trabajadores (adelantos y cargos)
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

-- 2. Períodos de pago (cierres mensuales)
create table if not exists payroll_periods (
  id bigint generated always as identity primary key,
  name text not null,
  start_date text not null,
  end_date text not null,
  status text not null default 'abierto',
  created_at timestamptz default now()
);

-- 3. Sueldos brutos y ajustes por trabajador dentro de un período
create table if not exists payroll_entries (
  id bigint generated always as identity primary key,
  period_id bigint not null references payroll_periods(id) on delete cascade,
  worker text not null,
  base_salary numeric(10,2) not null default 0,
  adjustments numeric(10,2) not null default 0,
  notes text default '',
  created_at timestamptz default now()
);

-- ============================================
-- RLS: permitir acceso anónimo (igual que el resto de la app)
-- ============================================

alter table worker_transactions enable row level security;
alter table payroll_periods enable row level security;
alter table payroll_entries enable row level security;

drop policy if exists "Allow all on worker_transactions" on worker_transactions;
drop policy if exists "Allow all on payroll_periods" on payroll_periods;
drop policy if exists "Allow all on payroll_entries" on payroll_entries;

create policy "Allow all on worker_transactions" on worker_transactions for all using (true) with check (true);
create policy "Allow all on payroll_periods" on payroll_periods for all using (true) with check (true);
create policy "Allow all on payroll_entries" on payroll_entries for all using (true) with check (true);
