# AGENTS.md — Asistencia FSS

## Project Overview
Vanilla HTML/CSS/JS SPA for attendance tracking (GPS optional) and fruit shipment logging. No build step, no bundler, no framework. Persistence via **Supabase** (PostgreSQL). Session state only in `localStorage`.

## Dev Commands
- Run locally: `npx serve .` or open `index.html` directly in a browser
- GPS is optional — works without HTTPS (registers as 'Sin GPS')
- Requires internet connection for Supabase — no offline mode

## Architecture
- **5 files**: `index.html` (views), `style.css` (styling), `script.js` (all logic), `supabaseClient.js` (DB layer), `supabase-setup.sql` (schema)
- **View routing**: `showView(viewKey)` toggles `.hidden` CSS class on `<section>` elements
- **Sub-view tabs**: Fruit and Accounting modules use `.tab-btn` / `.tab-content` with `toggleFruitSubView()` / `toggleAccountingSubView()` — no separate views
- **Persistence**: Supabase tables (`workers`, `attendance_records`, `settings`, `fruit`, `worker_transactions`, `payroll_periods`, `payroll_entries`). Session only in `localStorage` key `attendance_session_v3`
- **Admin login**: hardcoded in `ADMIN_CREDENTIALS` (`admin`/`123`) — no auth via Supabase
- **DB client**: `supabaseClient.js` exposes `SupabaseDB` object with async functions. `script.js` calls these instead of `localStorage`
- **Error handling**: all async DB calls wrapped in `try/catch`; `handleDbError()` shows connection alert

## Key Conventions
- Always use `SupabaseDB.*` functions for data — never `localStorage` directly (except session)
- Always `await` SupabaseDB calls — all data functions are async
- Always escape dynamic HTML with `escapeHTML()` to prevent XSS
- Use CSS variables from `:root` — don't hardcode colors
- Functions called from inline `onclick` (`openEditModal`, `deleteWorker`, `deleteFruitEntry`, `deleteNationalEntry`, `openEditTransactionModal`, `shareTransactionWhatsApp`, `openPayrollForm`, `deletePayrollPeriod`, `deleteTransaction`) are attached to `window` and are `async`
- Dates use `toLocaleDateString()` format (DD/MM/YYYY); comparison logic converts to YYYY-MM-DD
- Fruit module: admin-only, two types: **Nacional** (supplier + crates) and **Exportación** (supplier + crates + weight). Three tabs: Nacional / Exportación / Resumen. Resumen groups by date then supplier, with separate Gav. Nac. and Gav. Exp. columns. Both types share suppliers via `<datalist>`
- Export buttons generate Excel (.xls) via HTML table with Office XML namespace — no CSV

### Accounting Module
- Separate **accountant login** (external person, not admin): select "Contador" in the login dropdown, password is hardcoded in `CONTADOR_PASSWORD` (`FINCASS`). Session stored with `isAccountant: true`; accountant lands directly on `#view-accounting` and cannot access the admin panel
- Admin can also open the module via the "💰 Contabilidad" button in the admin header
- Admin-only view (`#view-accounting`) with three tabs: **Movimientos**, **Cierre de Pago**, **Reporte**
- Transaction types: `adelanto`, `viveres`, `prestamo`, `otro_descuento` — amounts always positive
- Transactions can be **edited** (modal `#editTransactionModal`) or **deleted**
- Each transaction row has a **WhatsApp share button** (`shareTransactionWhatsApp`) — opens `wa.me` with a preformatted message (date, worker, type, amount, detail, period balance). Also offered right after registering a transaction
- Payroll periods are monthly (`payroll_periods`) with `start_date`, `end_date`, `status` (`abierto` / `cerrado`)
- `payroll_entries` stores `base_salary` and `adjustments` per worker per period, entered by the accountant
- Net calculation: `base_salary + adjustments - (adelantos + viveres + prestamos + otros_descuentos)`
  - If net >= 0 → worker is owed money ("A favor del trabajador")
  - If net < 0 → worker owes the company ("Debe a la empresa")
- Closed periods block new transactions in their date range
- Workers see only their own balance summary on the worker view
- Accounting UI is mobile-first (accountant works from Android/iOS): tables scroll horizontally, inputs `min-height: 2.75rem` and `font-size: 1rem` to avoid iOS auto-zoom

### Attendance Status System
- **Entrada** (compared against `settings.entry_time`):
  - `Puntual`: llegó a hora o antes
  - `Atraso`: llegó tarde (diferencia en minutos)
- **Salida** (calculated based on worked hours from entry→exit):
  - `Normal`: trabajó exactamente la jornada configurada (ej: 7:30-16:30 = 9h)
  - `Jornada incompleta`: trabajó menos horas (faltan X horas/minutos)
  - `Extra`: trabajó más horas (excede en X horas/minutos)
- **Fallback**: Si no hay entrada registrada para ese día, compara contra `settings.exit_time` (comportamiento anterior)

### GPS Handling
- GPS is optional — registration works without it
- When no GPS: `lat: 0`, `lon: 0`, `observation: 'Sin GPS'`
- UI shows "⚠️ Sin GPS — Se registrará sin ubicación"
- Table displays "⚠️ Sin GPS" instead of Google Maps link when `lat === 0 && lon === 0`

### Calendar Color Coding
Legend (in order of priority for display):
- 🔴 **Atraso** (red) — late arrival
- 🟠 **Jornada incompleta** (orange) — worked less than full day
- 🟢 **Puntual** (green) — on time
- 🟡 **Extra** (yellow) — worked overtime
- ⚪ **Sin registro** (gray)

### Key Functions
- `calculateStatus(type, timeObj, settings, context)` — determines attendance status
  - For `Salida`: uses `context` `{worker, date, records}` to find entry record and calculate total worked hours
  - Returns `[statusBadge, extraInfo, diffMinsTotal]`
- `calcJornadaMins(settings)` — calculates expected workday duration in minutes from `entry_time` to `exit_time`
- `addTransaction()`, `renderAccountingTransactions()`, `deleteTransaction(id)`, `openEditTransactionModal(id)`, `saveTransactionEdit()` — manage worker advances/charges
- `shareTransactionWhatsApp(id)` — builds a WhatsApp (`wa.me`) message with the movement details and period balance
- `addPayrollPeriod()`, `renderPayrollPeriods()`, `closePayrollPeriod()` — manage monthly payroll periods
- `savePayrollEntries()` — saves `base_salary`/`adjustments` per worker for the selected period
- `renderPayrollReport()`, `exportPayrollExcel()` — calculate and export net balances
- `renderWorkerBalance()` — shows the current worker's balance summary on the worker view

## Supabase Schema
- Fresh install: run `supabase-setup.sql` (idempotent: `create table if not exists`, conditional settings insert, policies dropped and recreated)
- Existing database: run only `supabase-migration-contabilidad.sql` to add the accounting tables — it never touches existing tables or data
- Table `workers`: `id` (bigint PK), `name` (text), `created_at` (timestamptz)
- Table `attendance_records`: `id` (bigint PK), `worker`, `type`, `date`, `time`, `lat`, `lon`, `status`, `extra`, `diff_mins`, `observation`, `created_at`
- Table `settings`: `id` (bigint PK), `entry_time` (text), `exit_time` (text)
- Table `fruit`: `id` (bigint PK), `type`, `supplier`, `crates`, `weight`, `date`, `time`, `observation`, `created_at`
- Table `worker_transactions`: `id` (bigint PK), `worker`, `type`, `amount` (numeric), `date`, `description`, `created_by`, `created_at`
- Table `payroll_periods`: `id` (bigint PK), `name`, `start_date`, `end_date`, `status`, `created_at`
- Table `payroll_entries`: `id` (bigint PK), `period_id` (FK), `worker`, `base_salary` (numeric), `adjustments` (numeric), `notes`, `created_at`
- All tables have RLS enabled with ` Allow all` policies (no auth)

## Known Issues
- `eslint.config.js` references React/TS plugins but source is plain vanilla JS — config won't lint `.js` files
- `node_modules/` exists with eslint dependencies but no root `package.json`
- No test framework
- No offline support — app requires internet to function