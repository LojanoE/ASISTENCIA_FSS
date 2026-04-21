# GEMINI.md - Asistencia FSS (Contexto Técnico)

## Visión General del Proyecto
**Asistencia FSS** es una SPA (Single Page Application) enfocada en el registro de asistencia mediante geolocalización. Está diseñada para funcionar sin backend, delegando la persistencia al `localStorage`.

### Tecnologías Clave
- **HTML5/CSS3**: Interfaz centrada y responsiva sin frameworks externos.
- **Vanilla JS**: Manipulación del DOM, API de Geolocalización y gestión de estado local.

### Arquitectura y Estado
La aplicación utiliza un patrón de gestión de vistas mediante la clase CSS `.hidden`.
- **Navegación**: Función `showView(viewKey)`.
- **Persistencia**: Centralizada en `STORAGE_KEYS`. Actualmente en versión `v3`.

## Lógica de Negocio Crítica

### Gestión de Turnos y Cálculos
- Los horarios de referencia (`entryTime`, `exitTime`) se guardan en `attendance_settings_v3`.
- **Atrasos**: Calculados si la hora de entrada es mayor al horario configurado.
- **Extras**: Calculadas si la hora de salida es mayor al horario configurado.
- **Restricciones**: Máximo un registro de tipo "Entrada" y uno de "Salida" por trabajador al día.

### Geolocalización
- Utiliza `navigator.geolocation.watchPosition` para mantener una ubicación actualizada antes del registro.
- Requiere contexto seguro (`HTTPS` o `localhost`).
- Almacena latitud, longitud y muestra precisión aproximada.

### Administración y Edición
- El panel de admin permite editar registros existentes.
- **Recalculación**: Al editar la hora de un registro, el sistema recalcula automáticamente el estado (Puntual/Atraso/Extra) basándose en los parámetros vigentes.
- **Trazabilidad**: Las ediciones requieren un campo de "Observación" (justificativo) obligatorio.

## Convenciones de Desarrollo
- **Persistencia**: Siempre usar las constantes definidas en `STORAGE_KEYS`.
- **Seguridad**: Escapar HTML en los renders dinámicos mediante `escapeHTML`.
- **Estilo**: Mantener el uso de variables CSS definidas en `:root` de `style.css`.

## Estructura de Archivos
- `index.html`: Estructura de vistas y contenedores principales.
- `style.css`: Estilos, animaciones de carga y clases de utilidad.
- `script.js`: Lógica de aplicación completa (dividida en bloques funcionales).
