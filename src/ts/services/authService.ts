import type {
  AuthErrorCode,
  DemoAccount,
  Id,
  LoginCredentials,
  Session,
  User,
} from '@/models';

/* =============================================================
   AUTENTICACIÓN SIMULADA (mock)
   -------------------------------------------------------------
   Este servicio sustituye a una API real. Todas las funciones son
   asíncronas y tipadas para que el reemplazo sea directo:

   1. Cambia el cuerpo de `login` / `requestPasswordReset` por
      llamadas `fetch` (`POST /auth/login`, `POST /auth/password-reset`).
   2. Devuelve la `Session` tal cual la entregue el backend (token JWT,
      caducidad calculada en servidor...). La firma no cambia.
   3. Los tipos viven en `@/models`: no hay que tocar la UI.

   NOTA DE SEGURIDAD: aquí las contraseñas de demo están en claro
   porque es un mock de cliente. En un servicio real NUNCA se guardan
   ni se comparan en el frontend: se envían por HTTPS (POST) y el
   backend valida y responde con el token/la sesión.
   ============================================================= */

/** Error tipado para que la UI pueda distinguir cada caso. */
export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

/** Duración simulada de la sesión: 8 horas. */
export const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

/** Clave compartida de persistencia de sesión. */
export const AUTH_STORAGE_KEY = 'itsm:session';

/** Borra la sesión persistida (local y de sesión). */
export function clearSession(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * ¿Mostrar el panel de cuentas demo?
 * - `VITE_SHOW_DEMO=true` lo fuerza.
 * - `VITE_SHOW_DEMO=false` lo oculta.
 * - Sin definir, se muestra solo en desarrollo (`import.meta.env.DEV`).
 */
export const DEMO_ENABLED =
  import.meta.env.VITE_SHOW_DEMO === 'true' ||
  (import.meta.env.VITE_SHOW_DEMO === undefined && import.meta.env.DEV);

/**
 * Probabilidad de fallo de red simulado (0 = desactivado por defecto
 * para que la demo sea reproducible). Configúralo con la variable de
 * entorno `VITE_AUTH_NETWORK_FAILURE_RATE=0.15` para verlo en acción.
 */
const NETWORK_FAILURE_RATE = Number(import.meta.env.VITE_AUTH_NETWORK_FAILURE_RATE ?? '0');

const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    role: 'admin',
    roleLabel: 'Administrador',
    email: 'admin@itsm.demo',
    password: 'Admin123!',
    nombre: 'Marta Ruiz',
    cargo: 'IT Operations Lead',
  },
  {
    role: 'tecnico',
    roleLabel: 'Técnico',
    email: 'tecnico@itsm.demo',
    password: 'Tecnico123!',
    nombre: 'Luis Pérez',
    cargo: 'Soporte N2',
  },
  {
    role: 'lector',
    roleLabel: 'Solo lectura',
    email: 'lector@itsm.demo',
    password: 'Lector123!',
    nombre: 'Ana Gómez',
    cargo: 'Auditoría',
  },
  {
    role: 'lector',
    roleLabel: 'Usuario desactivado',
    email: 'inactivo@itsm.demo',
    password: 'Inactivo123!',
    nombre: null,
    cargo: null,
    disabled: true,
  },
];

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const randomDelay = (): Promise<void> =>
  delay(800 + Math.floor(Math.random() * 400));

const shouldFailNetwork = (): boolean =>
  NETWORK_FAILURE_RATE > 0 && Math.random() < NETWORK_FAILURE_RATE;

const makeToken = (): string => {
  const random = Math.random().toString(36).slice(2);
  return `demo.${Date.now().toString(36)}.${random}`;
};

export function getDemoAccounts(): readonly DemoAccount[] {
  return DEMO_ACCOUNTS;
}

/**
 * Valida credenciales y abre sesión.
 * - cuenta desactivada → `account_disabled`
 * - credenciales que no coinciden → `invalid_credentials`
 * - fallo de red simulado → `network`
 */
export async function login({ email, password }: LoginCredentials): Promise<Session> {
  await randomDelay();

  const normalized = email.trim().toLowerCase();
  const account = DEMO_ACCOUNTS.find((candidate) => candidate.email === normalized);

  if (account?.disabled) {
    throw new AuthError(
      'account_disabled',
      'Esta cuenta está desactivada. Contacta con el administrador.',
    );
  }

  // El fallo de red solo se simula sobre cuentas existentes, de modo
  // que un correo desconocido siempre devuelva "credenciales incorrectas".
  if (account && shouldFailNetwork()) {
    throw new AuthError('network', 'No se pudo conectar. Inténtalo de nuevo.');
  }

  if (!account || account.password !== password) {
    throw new AuthError('invalid_credentials', 'Correo o contraseña incorrectos.');
  }

  const now = Date.now();
  const user: User = {
    id: `u-${account.role}-${account.email}` as Id,
    nombre: account.nombre ?? 'Usuario',
    email: account.email,
    cargo: account.cargo ?? '—',
    role: account.role,
  };

  return {
    token: makeToken(),
    user,
    issuedAt: now,
    expiresAt: now + SESSION_DURATION_MS,
  };
}

/** Recuperación de contraseña simulada: siempre responde correctamente. */
export async function requestPasswordReset(email: string): Promise<void> {
  await delay(900);
  void email;
}
