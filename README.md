# ITSM · Panel de control

Dashboard operativo para gestión de equipos, freelancers, asignaciones, incidentes,
onboarding y stock. React 18 + TypeScript + Vite con animación de interfaz
(Framer Motion), gráficos (Recharts), caché de datos (TanStack Query) y CSS puro
(sin CSS-in-JS ni estilos inline).

## Requisitos

- Node.js 18+
- npm 9+

## Scripts

| Script              | Descripción                                            |
| ------------------- | ------------------------------------------------------ |
| `npm run dev`       | Servidor de desarrollo (Vite)                          |
| `npm run build`     | `tsc --noEmit` + build de producción en `dist/`        |
| `npm run preview`   | Sirve el build de producción                           |
| `npm run typecheck` | Comprobación de tipos sin emitir                       |

## Estructura

La raíz de Vite es `src/html`, de modo que HTML, CSS y TS quedan separados:

```
itsm/
├─ src/
│  ├─ html/
│  │  ├─ index.html              # shell HTML (root de Vite)
│  │  └─ entry.tsx               # entry dentro del root; importa ../ts/main
│  ├─ css/
│  │  ├─ tokens.css              # variables de diseño (color, espacio, tipografía)
│  │  ├─ base.css                # reset y tipografía base
│  │  ├─ layout.css              # app-shell, sidebar, header, contenido
│  │  ├─ animations.css          # keyframes y prefers-reduced-motion
│  │  ├─ components/
│  │  │  ├─ surface.css          # cards, tooltip, chips, botones, error boundary
│  │  │  ├─ skeleton.css         # geometría de skeletons (tokens sk-*)
│  │  │  ├─ kpi-card.css
│  │  │  ├─ charts.css
│  │  │  ├─ chart-colors.css     # clases de color reutilizables (.c-* .s-* .b-*)
│  │  │  └─ header.css
│  │  └─ views/
│  │     └─ dashboard.css
│  └─ ts/
│     ├─ main.tsx               # bootstrap, providers, imports @css/*
│     ├─ vite-env.d.ts          # tipos de Vite (ImportMetaEnv)
│     ├─ models/                # tipos del dominio
│     ├─ services/
│     │  ├─ api.ts              # ÚNICO punto de intercambio mock → API
│     │  ├─ mock.ts             # datos derivados + generador en vivo
│     │  └─ mockData.ts         # datasets estáticos + metadatos de página
│     ├─ hooks/
│     │  ├─ queries.ts          # hooks de datos (TanStack Query)
│     │  ├─ useLiveActivity.ts  # feed en vivo acotado
│     │  ├─ useCountUp.ts
│     │  ├─ useMediaQuery.ts
│     │  ├─ useQueryParam.ts
│     │  ├─ useReducedMotion.ts
│     │  └─ useTheme.ts
│     ├─ motion/presets.ts      # springs, tweens, stagger y variantes
│     ├─ components/            # Header, Sidebar, KpiCard, gráficos, DataTable…
│     ├─ router/                # AppShell + definición de rutas
│     └─ views/                 # páginas de sección y detalle
└─ vite.config.ts
```

Alias de importación: `@` → `src/ts`, `@css` → `src/css`.

## Arquitectura de datos

```
Vista  ──►  hooks/queries.ts  ──►  services/api.ts  ──►  mock | API real
              (TanStack Query)        (Promise<T>)
```

Ninguna vista importa datos directamente. Todas consumen hooks de `hooks/queries.ts`,
que a su vez llaman a funciones asíncronas y tipadas de `services/api.ts`. Por eso
cambiar el origen de datos **no requiere tocar la UI**.

El estado local de UI (tema, sidebar, feed en vivo) vive en `hooks/`.

## Migración de mock a API real

Todo se concentra en `src/ts/services/api.ts`. La firma pública ya es la definitiva:
funciones `async` que devuelven `Promise<T>` con los tipos de `@/models`.

1. Define la base URL en un `.env`:

   ```env
   VITE_API_BASE_URL=https://api.miempresa.com
   ```

   Ya está leída en `api.ts` (`import.meta.env.VITE_API_BASE_URL`) y tipada en
   `vite-env.d.ts`.

2. Sustituye el cuerpo de cada función por la llamada HTTP, **manteniendo firma y tipo**.
   Ejemplo:

   ```ts
   export async function fetchEquipos(): Promise<Equipo[]> {
     const res = await fetch(`${BASE_URL}/equipos`);
     if (!res.ok) throw new Error(`Equipos: ${res.status}`);
     return (await res.json()) as Equipo[];
   }
   ```

   Repite por función: `fetchDashboardData`, `fetchFreelancers`, `fetchAsignaciones`,
   `fetchIncidentes`, `fetchOnboarding`, `fetchIncidentesSerie`, `fetchActividad`,
   `fetchEquipoById`, `fetchIncidenteById`.

3. Elimina los datos estáticos de `services/mockData.ts` y `services/mock.ts`
   cuando todas las funciones apunten a la API. `getPageMeta` puede quedarse como
   metadato local de navegación.

4. Feed en vivo (`fetchActividadEnVivo` / `generateLiveActivity`): elígela una de estas
   dos estrategias y ajusta `ActivityFeed`:

   - **Polling**: usa `refetchInterval` en un `useQuery` de TanStack Query.
   - **Push**: abre un `EventSource` (SSE) o `WebSocket` y llama a `push()` de
     `useLiveActivity` con cada evento.

   La lista ya está acotada (`limit`) y el elemento recién llegado se resalta con
   `latestId`.

5. Errores y estados: los hooks ya exponen `isLoading` / `isError` de TanStack Query.
   Revisa `ErrorBoundary` y las vistas de carga para mensajes de error de red.

Los `QUERY_KEYS` de `api.ts` son el mapa de invalidación para mutaciones futuras
(`queryClient.invalidateQueries`).

## Animaciones

Fuente única de verdad: `src/ts/motion/presets.ts`. Ajustar ahí cambia la "física"
global del panel.

### Springs (interacción y layout)

| Preset     | stiffness | damping | mass | Uso                                  |
| ---------- | --------- | ------- | ---- | ------------------------------------ |
| `snappy`   | 200       | 26      | 0.7  | hover, tap, iconos                   |
| `smooth`   | 160       | 22      | 0.9  | tarjetas que se reacomodan, sidebar  |
| `gentle`   | 120       | 18      | 1.0  | entradas y textos largos             |
| `progress` | 130       | 24      | 1.0  | barras de progreso (sin rebote)      |

### Tweens (duración + easing)

Easing común `EASE_OUT_EXPO = [0.22, 1, 0.36, 1]`.

| Preset           | Duración | Uso                                       |
| ---------------- | -------- | ----------------------------------------- |
| `TWEEN.fast`     | 0.20 s   | micro-interacciones                       |
| `TWEEN.base`     | 0.28 s   | entradas por defecto                      |
| `TWEEN.slow`     | 0.42 s   | bloques de contenido grandes              |
| `hoverLift`      | spring   | elevación de tarjetas (`y: -4`, `scale: 1.02`) |
| `dataTween`      | 0.55 s   | transición de datos en gráficos           |
| `drawTween`      | 0.85 s   | dibujo de líneas/áreas                    |
| `strokeTransition` | 1.10 s | `pathLength` de sparklines                |

### Stagger y variantes

| Elemento           | Valor                                                     |
| ------------------ | --------------------------------------------------------- |
| `STAGGER.tight`    | 0.06 s entre hijos                                        |
| `STAGGER.base`     | 0.07 s (por defecto)                                      |
| `STAGGER.loose`    | 0.09 s                                                    |
| `pageVariants`     | page enter/exit: `opacity` + `y`                          |
| `sectionVariants`  | bloque: `opacity` + `y` + `scale` desde 0.98              |
| `itemVariants`     | filas que aparecen con `scale` desde 0.985                |
| `listItemVariants` | ítems de feed: entrada desde arriba, salida lateral       |

### Reglas

- Toda animación respeta `useReducedMotion`; con reduced motion se usan solo
  opacidad (`reducedVariants`) y se desactivan springs/transformaciones.
- Solo se permiten valores **dinámicos** de Framer Motion en el atributo `style`
  (p. ej. `motionValue`, `animate`). El resto del estilado vive en CSS.
- `wrapperStyle` de Recharts es la única excepción por API de librería.

## Accesibilidad

- HTML semántico, navegación por teclado, foco visible, enlaces "saltar al contenido".
- Etiquetas `aria-*` en controles y estados (`aria-pressed`, `aria-busy`).
- Contraste AA en ambos temas (claro/oscuro) con `prefers-color-scheme`.
- `prefers-reduced-motion` atendido en todos los componentes animados.

## Autenticación (login)

Pantalla de acceso en `/login` con panel de marca y formulario validado. La sesión se
gestiona en `context/AuthContext.tsx` y se expone con `hooks/useAuth.ts`.

### Rutas

- `/login` es pública (`PublicOnlyRoute`); si ya hay sesión redirige al destino.
- El resto de rutas se envuelven en `ProtectedRoute`: sin sesión redirige a
  `/login?redirect=<ruta>` y, tras entrar, vuelve a esa ruta.
- La sesión caduca a las 8 h (`SESSION_DURATION_MS`); al expirar se limpia y se avisa
  en el login.

### Roles y permisos

`ROLE_PERMISSIONS` en `AuthContext.tsx` define qué puede hacer cada rol.
`useAuth().can(permiso)` devuelve si el rol actual puede
`create | edit | delete | refresh | manage`:

| Rol       | create | edit | delete | refresh | manage |
| --------- | ------ | ---- | ------ | ------- | ------ |
| `admin`   | ✔      | ✔    | ✔      | ✔       | ✔      |
| `tecnico` | ✔      | ✔    | —      | ✔       | —      |
| `lector`  | —      | —    | —      | ✔       | —      |

### Cuentas de demostración

Se muestran con `VITE_SHOW_DEMO=true` (en desarrollo, por defecto). Contraseñas solo
para esta demo:

| Correo             | Contraseña     | Rol       | Nombre / cargo                 |
| ------------------ | -------------- | --------- | ------------------------------ |
| `admin@itsm.demo`  | `Admin123!`    | admin     | Marta Ruiz · IT Operations Lead |
| `tecnico@itsm.demo`| `Tecnico123!`  | tecnico   | Luis Pérez · Soporte N2         |
| `lector@itsm.demo` | `Lector123!`   | lector    | Ana Gómez · Auditoría           |
| `inactivo@itsm.demo`| `Inactivo123!`| —         | Cuenta desactivada              |

Otros casos simulables: credenciales inválidas, cuenta desactivada y fallo de red
(`VITE_AUTH_NETWORK_FAILURE_RATE`, 0 por defecto).

### Variables de entorno (`.env`)

| Variable                        | Uso                                                   |
| ------------------------------- | ----------------------------------------------------- |
| `VITE_SHOW_DEMO`                | `true` / `false` / sin definir (visible en dev)       |
| `VITE_AUTH_NETWORK_FAILURE_RATE`| Probabilidad 0..1 de simular fallo de red en el login |

Hay un `.env.example` con los valores de referencia.

### Migración del login mock → API

Todo el mock vive en `src/ts/services/authService.ts` y su firma ya es la definitiva:

1. Sustituye el cuerpo de `login(credentials)` por `POST /auth/login` y devuelve la
   `Session` del backend (mismo tipo de `@/models`).
2. Sustituye `requestPasswordReset(email)` por `POST /auth/password-reset`.
3. Elimina `DEMO_ACCOUNTS` y las contraseñas en claro: nunca deben viajar al cliente
   ni compararse en el frontend (se validan en el servidor).
4. Ajusta `AUTH_STORAGE_KEY` / `persistSession` si el backend usa cookies en lugar de
   token en `localStorage`/`sessionStorage`.

El resto (`AuthContext`, `LoginForm`, la vista) no cambia.

### Archivos del login

```
context/AuthContext.tsx        # sesión, persistencia, expiración y permisos por rol
hooks/useAuth.ts               # acceso tipado al contexto
hooks/useCapsLock.ts           # aviso de Bloq Mayús
utils/validators.ts            # validación de correo y contraseña
services/authService.ts        # mock de login y recuperación
components/AuthLayout.tsx      # lienzo del login (marca + formulario)
components/AnimatedBackground.tsx  # escena abstracta: luz, líneas y grano
components/FloatingInput.tsx   # campo con label flotante y error animado
components/PasswordInput.tsx   # mostrar/ocultar + Bloq Mayús
components/SubmitButton.tsx    # estados idle → loading → success
components/DemoAccounts.tsx    # listado de cuentas de prueba
components/Toast.tsx           # aviso flotante
components/LoginForm.tsx       # formulario, bloqueo y recuperación
view/LoginView.tsx             # composición de la vista
router/ProtectedRoute.tsx      # guardas ProtectedRoute / PublicOnlyRoute
css/views/login.css            # estilos del login
```

### Animaciones del login

- Panel de marca: fade + slide desde la izquierda; fondo con mesh gradient, orbes con blur
  y deriva en espejo, cristal líquido con brillo especular y grano. Parallax suave por cursor
  (solo con hover fino y sin reduced motion).
- Tarjeta: fade + 16 px + `scale` desde 0.98.
- Campos: entrada escalonada (stagger 70 ms).
- Cambio login ↔ recuperación: slide horizontal.
- Errores y avisos: altura animada.
- Botón: spinner/etiqueta según estado; shake del formulario en credenciales inválidas.
- Toast de "Sesión cerrada".

Todas respetan `prefers-reduced-motion`: solo opacidad, sin parallax ni shake.
