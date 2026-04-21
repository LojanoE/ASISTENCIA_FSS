# Asistencia FSS - Control de Asistencia Local

**Asistencia FSS** es una aplicación web ligera y local diseñada para el registro de asistencia de personal. Prioriza la simplicidad, la usabilidad móvil y la privacidad de los datos al almacenar todos los registros localmente en el navegador.

## 🚀 Características Principales

- **Registro con GPS**: Captura automáticamente la ubicación (latitud, longitud y precisión) en cada registro.
- **Cálculo Automático**: Determina atrasos y horas extras basados en horarios configurables.
- **Panel de Administración**: 
  - Gestión de trabajadores (Alta/Baja).
  - Configuración de horarios de entrada y salida esperados.
  - Visualización y filtrado de registros por fecha.
  - Edición de registros con justificativo obligatorio.
  - Exportación de datos a formato CSV.
- **100% Local**: No requiere base de datos ni servidor; utiliza `localStorage` del navegador.
- **Diseño Mobile-First**: Optimizado para ser utilizado cómodamente desde teléfonos móviles.

## 🛠️ Tecnologías

- **HTML5**: Estructura semántica.
- **CSS3**: Diseño responsivo y moderno mediante variables CSS.
- **Vanilla JavaScript**: Lógica central, API de Geolocalización y gestión de persistencia.

## 📋 Requisitos y Uso

1. **Entorno Seguro**: Debido al uso de la API de Geolocalización, la aplicación debe ejecutarse bajo `HTTPS` o en `localhost`.
2. **Sin Construcción**: No requiere comandos de instalación ni procesos de compilación. Simplemente abre `index.html` en un navegador moderno.
3. **Servidor Estático (Opcional)**:
   ```bash
   npx serve .
   ```

## 🔐 Acceso

- **Trabajadores**: Seleccionan su nombre del listado desplegable.
- **Administrador**: Seleccionar "Administrador" e ingresar la contraseña por defecto (`123`).

## 💾 Estructura de Datos

Los datos se almacenan en el `localStorage` bajo las siguientes claves:
- `attendance_records_v3`: Historial de entradas y salidas.
- `attendance_workers_v3`: Lista de trabajadores registrados.
- `attendance_settings_v3`: Configuración de horarios globales.
- `attendance_session_v3`: Estado de la sesión actual.

---
Desarrollado para ser una solución rápida, eficiente y sin dependencias externas.
