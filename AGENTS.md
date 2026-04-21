# AGENTS.md — Asistencia FSS

## Project Overview
Vanilla HTML/CSS/JS SPA for attendance tracking with GPS and fruit shipment logging. No build step, no bundler, no framework. All persistence via `localStorage`.

## Dev Commands
- Run locally: `npx serve .` or open `index.html` directly in a browser
- Requires HTTPS or localhost for Geolocation API to work
- No npm scripts defined (no root `package.json`)

## Architecture
- **3 files**: `index.html` (views), `style.css` (styling), `script.js` (all logic)
- **View routing**: `showView(viewKey)` toggles `.hidden` CSS class on `<section>` elements
- **Sub-view tabs**: Fruit module uses `.tab-btn` / `.tab-content` with `toggleFruitSubView()` — no separate views
- **Persistence**: `STORAGE_KEYS` constants map to `localStorage` keys with `_v3` suffix
- **Admin login**: hardcoded in `ADMIN_CREDENTIALS` (`admin`/`123`)

## Key Conventions
- Always use `STORAGE_KEYS` constants for localStorage access — never hardcode key strings
- Always escape dynamic HTML with `escapeHTML()` to prevent XSS
- Use CSS variables from `:root` — don't hardcode colors
- Functions called from inline `onclick` (`openEditModal`, `deleteWorker`, `deleteFruitEntry`) are attached to `window` — new inline handlers need `window.` assignment too
- Dates use `toLocaleDateString()` format (DD/MM/YYYY); comparison logic converts to YYYY-MM-DD
- Fruit module: admin-only, accessed via "Envío de Fruta" button in admin header. Two types: **Nacional** (supplier + crates) and **Exportación** (supplier + crates + weight). Three tabs: Nacional / Exportación / Resumen. Resumen groups by date then supplier, with separate Gav. Nac. and Gav. Exp. columns. Both types share suppliers via `datalist`.

## Known Issues
- `eslint.config.js` references React/TS plugins but source is plain vanilla JS — config won't lint `.js` files
- `node_modules/` exists with eslint dependencies but no root `package.json`
- No test framework