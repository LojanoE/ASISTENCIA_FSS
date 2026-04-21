# AGENTS.md — Asistencia FSS

## Project Overview
Vanilla HTML/CSS/JS SPA for attendance tracking with GPS and fruit shipment logging. No build step, no bundler, no framework. Persistence via **Supabase** (PostgreSQL). Session state only in `localStorage`.

## Dev Commands
- Run locally: `npx serve .` or open `index.html` directly in a browser
- Requires HTTPS or localhost for Geolocation API to work
- Requires internet connection for Supabase — no offline mode

## Architecture
- **4 files**: `index.html` (views), `style.css` (styling), `script.js` (all logic), `supabaseClient.js` (DB layer)
- **View routing**: `showView(viewKey)` toggles `.hidden` CSS class on `<section>` elements
- **Sub-view tabs**: Fruit module uses `.tab-btn` / `.tab-content` with `toggleFruitSubView()` — no separate views
- **Persistence**: Supabase tables (`workers`, `attendance_records`, `settings`, `fruit`). Session only in `localStorage` key `attendance_session_v3`
- **Admin login**: hardcoded in `ADMIN_CREDENTIALS` (`admin`/`123`) — no auth via Supabase
- **DB client**: `supabaseClient.js` exposes `SupabaseDB` object with async functions. `script.js` calls these instead of `localStorage`
- **Error handling**: all async DB calls wrapped in `try/catch`; `handleDbError()` shows connection alert

## Key Conventions
- Always use `SupabaseDB.*` functions for data — never `localStorage` directly (except session)
- Always `await` SupabaseDB calls — all data functions are async
- Always escape dynamic HTML with `escapeHTML()` to prevent XSS
- Use CSS variables from `:root` — don't hardcode colors
- Functions called from inline `onclick` (`openEditModal`, `deleteWorker`, `deleteFruitEntry`, `deleteNationalEntry`) are attached to `window` and are `async`
- Dates use `toLocaleDateString()` format (DD/MM/YYYY); comparison logic converts to YYYY-MM-DD
- Fruit module: admin-only, two types: **Nacional** (supplier + crates) and **Exportación** (supplier + crates + weight). Three tabs: Nacional / Exportación / Resumen. Resumen groups by date then supplier, with separate Gav. Nac. and Gav. Exp. columns. Both types share suppliers via `<datalist>`
- Export buttons generate Excel (.xls) via HTML table with Office XML namespace — no CSV

## Supabase Schema
- Table `workers`: `id` (bigint PK), `name` (text), `created_at` (timestamptz)
- Table `attendance_records`: `id` (bigint PK), `worker`, `type`, `date`, `time`, `lat`, `lon`, `status`, `extra`, `diff_mins`, `observation`, `created_at`
- Table `settings`: `id` (bigint PK), `entry_time` (text), `exit_time` (text)
- Table `fruit`: `id` (bigint PK), `type`, `supplier`, `crates`, `weight`, `date`, `time`, `observation`, `created_at`
- All tables have RLS enabled with ` Allow all` policies (no auth)

## Known Issues
- `eslint.config.js` references React/TS plugins but source is plain vanilla JS — config won't lint `.js` files
- `node_modules/` exists with eslint dependencies but no root `package.json`
- No test framework
- No offline support — app requires internet to function