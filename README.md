# ASISTENCIA_FSS

Sistema de Control de Asistencia para la **Finca San Luis Pithaya**

## Descripción

Aplicación web para registrar la asistencia de los trabajadores mediante escaneo de código QR pegado en la pared de la entrada. Los trabajadores escanean el QR con su celular, ingresan su PIN numérico y registran su entrada/salida. El sistema verifica la ubicación GPS para asegurar que están dentro del perímetro de la finca.

## Características

- **Registro de asistencia** por PIN numérico (4-6 dígitos)
- **Geolocalización (GPS)** con geofence para verificar que el trabajador está en la finca
- **Cálculo automático** de atrasos y horas extras según horario configurable
- **Prevención de duplicados** - no se permite registrar entrada/salida dos veces el mismo día
- **Panel de administración** para gestionar trabajadores, asistencias y justificaciones
- **Código QR** para imprimir y pegar en la pared
- **Persistencia de sesión** en el celular del trabajador (localStorage)
- **Roles**: Administrador y Trabajador

## Stack Tecnológico

- **Frontend**: React + TypeScript + Vite + TailwindCSS v4
- **Backend/DB**: Supabase (PostgreSQL + Row Level Security)
- **Despliegue**: Vercel (recomendado)

## Configuración

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Crea un nuevo proyecto
3. Ve a **Project Settings > API** y copia:
   - `Project URL` (ej: `https://abc123.supabase.co`)
   - `anon public` key

### 2. Configurar la base de datos

1. En Supabase, ve a **SQL Editor**
2. Copia y pega el contenido del archivo `supabase/migrations/001_initial.sql`
3. Ejecuta el script
4. Esto creará las tablas, funciones, políticas de seguridad y el usuario administrador por defecto

**Credenciales del administrador por defecto:**
- PIN: `1234` (cámbialo inmediatamente después del primer inicio de sesión)

### 3. Configurar variables de entorno

1. Copia `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edita `.env` y coloca tus credenciales de Supabase:
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```

### 4. Instalar dependencias y ejecutar

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 5. Configurar el geofence

1. Inicia sesión como administrador (PIN: `1234`)
2. Ve a **Config**
3. Configura la hora de entrada y salida de la jornada
4. Para el geofence, puedes hacer clic en "Usar mi ubicación actual" estando en la finca, o ingresar las coordenadas manualmente
5. Ajusta el radio en metros (ej: 200m)
6. Guarda la configuración

### 6. Generar el QR

1. Como administrador, ve a **QR**
2. Imprime el código y pégalo en la pared de la entrada de la finca

### 7. Crear trabajadores

1. Como administrador, ve a **Trabajadores**
2. Crea cada trabajador con nombre, PIN y rol

## Despliegue en Vercel

### Método 1: Conectar repositorio GitHub

1. Sube el código a GitHub
2. Ve a [vercel.com](https://vercel.com) y conecta tu repositorio
3. En la configuración del proyecto, agrega las variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Despliega

### Método 2: Vercel CLI

```bash
npm i -g vercel
vercel --prod
```

## Estructura del Proyecto

```
src/
├── components/         # Componentes reutilizables
│   ├── Clock.tsx       # Reloj en tiempo real
│   ├── Layout.tsx      # Layout principal con navbar
│   ├── PinPad.tsx      # Teclado numérico para PIN
│   └── ProtectedRoute.tsx  # Rutas protegidas
├── contexts/
│   └── AuthContext.tsx # Contexto de autenticación
├── hooks/
│   ├── useClock.ts     # Hook del reloj
│   └── useSettings.ts  # Hook de configuración
├── lib/
│   ├── geolocation.ts  # Funciones de GPS y geofence
│   ├── supabase.ts     # Cliente de Supabase
│   ├── types.ts        # Tipos TypeScript
│   └── utils.ts        # Utilidades
├── pages/
│   ├── HomePage.tsx    # Página inicial (reloj + PIN)
│   ├── DashboardPage.tsx # Dashboard del trabajador
│   ├── QRPage.tsx      # Generador de QR
│   └── admin/
│       ├── AdminDashboard.tsx    # Panel admin
│       ├── WorkersPage.tsx       # Gestión trabajadores
│       ├── AttendancePage.tsx    # Gestión asistencias
│       └── SettingsPage.tsx      # Configuración
├── App.tsx             # Router principal
└── main.tsx            # Entry point
```

## Base de Datos (Supabase)

### Tablas

| Tabla | Descripción |
|-------|-------------|
| `workers` | Trabajadores con PIN hasheado y rol |
| `attendance` | Registro diario de entrada/salida con GPS |
| `justifications` | Justificaciones de atrasos |
| `settings` | Configuración (horarios, geofence) |

### Funciones RPC

| Función | Descripción |
|---------|-------------|
| `verify_pin(pin)` | Verifica PIN y devuelve datos del trabajador |
| `register_entry(...)` | Registra entrada con GPS y calcula atraso |
| `register_exit(...)` | Registra salida con GPS y calcula horas extras |
| `hash_pin(pin)` | Hashea un PIN para almacenamiento |

## Reglas de Negocio

- **Un registro por día**: No se permite registrar entrada/salida dos veces
- **Atraso automático**: Si la entrada es después de la hora configurada
- **Horas extras**: Si la salida es después de la hora configurada
- **Geofence**: Verificación de ubicación GPS (no bloqueante, pero se marca si está fuera)
- **Solo admin crea trabajadores**: Los trabajadores no pueden auto-registrarse
- **PIN hasheado**: Los PINs se almacenan con bcrypt, nunca en texto plano

## Licencia

MIT