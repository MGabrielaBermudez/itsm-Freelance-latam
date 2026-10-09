import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  AUTH_STORAGE_KEY,
  clearSession,
  login as loginRequest,
} from '@/services/authService';
import type {
  LoginCredentials,
  Permission,
  Role,
  Session,
  User,
} from '@/models';

/** Permisos concedidos a cada rol. */
const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  admin: ['create', 'edit', 'delete', 'refresh', 'manage'],
  tecnico: ['create', 'edit', 'refresh'],
  lector: ['refresh'],
};

function readStoredSession(): Session | null {
  if (typeof window === 'undefined') return null;
  const raw =
    window.localStorage.getItem(AUTH_STORAGE_KEY) ??
    window.sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Session;
    if (!parsed.user || typeof parsed.expiresAt !== 'number') return null;
    if (parsed.expiresAt <= Date.now()) {
      clearSession();
      return null;
    }
    return parsed;
  } catch {
    clearSession();
    return null;
  }
}

function persistSession(session: Session, remember: boolean): void {
  const target = remember ? window.localStorage : window.sessionStorage;
  const other = remember ? window.sessionStorage : window.localStorage;
  other.removeItem(AUTH_STORAGE_KEY);
  target.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<Session>;
  logout: () => void;
  /** Comprueba si el rol actual puede realizar una acción. */
  can: (permission: Permission) => boolean;
  /** Mensaje transitorio (p. ej. "Sesión cerrada") para mostrar en un toast. */
  notice: string | null;
  setNotice: (notice: string | null) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): ReactElement {
  const [session, setSession] = useState<Session | null>(() => readStoredSession());
  const [notice, setNotice] = useState<string | null>(null);

  /* Cierra la sesión automáticamente al caducar (8 h simuladas). */
  useEffect(() => {
    if (!session) return;
    const remaining = session.expiresAt - Date.now();
    if (remaining <= 0) {
      clearSession();
      setSession(null);
      return;
    }
    const timer = window.setTimeout(() => {
      clearSession();
      setSession(null);
      setNotice('Tu sesión ha caducado. Inicia sesión de nuevo.');
    }, remaining);
    return () => window.clearTimeout(timer);
  }, [session]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<Session> => {
    const next = await loginRequest(credentials);
    persistSession(next, credentials.remember);
    setSession(next);
    setNotice(null);
    return next;
  }, []);

  const logout = useCallback((): void => {
    clearSession();
    setSession(null);
    setNotice('Sesión cerrada');
  }, []);

  const can = useCallback(
    (permission: Permission): boolean => {
      if (!session) return false;
      return ROLE_PERMISSIONS[session.user.role].includes(permission);
    },
    [session],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: session !== null,
      login,
      logout,
      can,
      notice,
      setNotice,
    }),
    [session, login, logout, can, notice],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
