# GEMINI.md - Asistencia FSS

## Project Overview
**Asistencia FSS** is a lightweight, local web application designed for attendance registration. It focuses on simplicity, mobile usability, and data privacy by storing all records locally in the browser.

### Main Technologies
- **HTML5**: Semantic structure for views (Login, Worker, Admin).
- **CSS3**: Mobile-first, centered, and responsive design with CSS variables.
- **Vanilla JavaScript**: Core logic, Geolocation API integration, and `localStorage` management.

### Architecture
The application is a Single Page Application (SPA) that manages views by toggling the `hidden` class on main sections. It does not require a backend; all data persistence is handled via `localStorage`.

## Running the Project
Since this is a vanilla web application, it does not require a build step.

- **To Run**: Open `index.html` in any modern web browser.
- **GPS Requirements**: To use the GPS tracking feature, the browser must be in a secure context. Use `localhost` or serve the project over `HTTPS`.
- **Static Server (Optional)**: If you have Node.js installed, you can use a static server:
  ```bash
  npx serve .
  ```

## Key Components and Logic
- **Authentication**: 
  - **Workers**: Select their name from a pre-registered dropdown list.
  - **Admin**: Select "Administrador" and enter the password (`123`).
- **Shift Management**:
  - Global "Expected Entry" and "Expected Exit" times are configurable in the Admin panel.
  - **Lateness (Atraso)**: Automatically calculated if check-in is after the expected entry time.
  - **Overtime (Extras)**: Automatically calculated if check-out is after the expected exit time.
- **Attendance Rules**:
  - Workers can only register one Entry and one Exit per day.
- **GPS Tracking**: Captures latitude, longitude, and accuracy during registration. Provides direct links to Google Maps for verification.
- **Data Export**: Admin can export the entire history to a CSV file.

## Development Conventions
- **Naming**: Use camelCase for JavaScript variables and functions; kebab-case for CSS classes.
- **Styling**: Prioritize mobile-first design. Use the defined CSS variables in `:root` for consistency.
- **Persistence**: All data keys are centralized in the `STORAGE_KEYS` constant in `script.js`.
- **Modularity**: Logic is organized by functional blocks (Session, GPS, Attendance, Admin, Renders) within `script.js`.

## Key Files
- `index.html`: The main UI structure and view definitions.
- `style.css`: Centered, modern styling optimized for touch screens.
- `script.js`: The heart of the application, managing all state and browser API interactions.
