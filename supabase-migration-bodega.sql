-- ============================================
-- Asistencia FSS — MIGRACIÓN: Módulo de Bodega
-- (salida y retorno de herramientas y equipos)
-- ============================================
-- Ejecutar UNA VEZ en: Supabase → SQL Editor → New Query
-- sobre una base de datos que YA tiene las tablas existentes.
--
-- Este script SOLO crea las tablas nuevas del módulo de bodega.
-- NO toca, NO borra ni modifica ninguna tabla ni dato existente.
-- Usa "if not exists", así que ejecutarlo dos veces tampoco causa daño.
-- ============================================

-- 1. Inventario de herramientas y equipos
create table if not exists tools (
  id bigint generated always as identity primary key,
  name text not null,
  category text not null default 'herramienta',   -- 'herramienta' | 'equipo'
  total_qty integer not null default 0,
  observation text default '',
  created_at timestamptz default now()
);

-- 2. Salidas a la finca y retornos (registro R019)
create table if not exists tool_loans (
  id bigint generated always as identity primary key,
  tool_id bigint references tools(id) on delete set null,
  tool_name text not null,                         -- copia del nombre para conservar el historial
  category text default 'herramienta',
  worker text not null,
  quantity integer not null,
  date text not null,                              -- YYYY-MM-DD
  time_out text not null,
  time_in text default '',                         -- '' = todavía en campo
  returned_qty integer default 0,
  return_status text default '',                   -- 'Bueno' | 'Dañado' | 'Perdido'
  observation text default '',
  created_by text default '',
  created_at timestamptz default now()
);

-- ============================================
-- RLS: permitir acceso anónimo (igual que el resto de la app)
-- ============================================

alter table tools enable row level security;
alter table tool_loans enable row level security;

drop policy if exists "Allow all on tools" on tools;
drop policy if exists "Allow all on tool_loans" on tool_loans;

create policy "Allow all on tools" on tools for all using (true) with check (true);
create policy "Allow all on tool_loans" on tool_loans for all using (true) with check (true);
