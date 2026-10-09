import type { ReactElement } from 'react';
import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/** Devuelve solo rutas internas; evita redirecciones abiertas. */
export function safeRedirect(value: string | null): string {
  if (!value) return '/';
  if (!value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}

/** Bloquea el acceso a usuarios sin sesión y conserva la ruta de destino. */
export function ProtectedRoute(): ReactElement {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  /* Al salir hacia /login la vista anterior sigue montada (AnimatePresence):
     no redirigimos otra vez para dejar que termine su animación de salida. */
  if (!isAuthenticated && location.pathname !== '/login') {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  return <Outlet />;
}

/** Evita que un usuario ya autenticado vuelva a ver el login. */
export function PublicOnlyRoute(): ReactElement {
  const { isAuthenticated } = useAuth();
  const [params] = useSearchParams();
  const location = useLocation();

  /* Mismo criterio: solo redirige mientras sigamos en /login, para que el
     panel de acceso pueda completar su animación de salida. */
  if (isAuthenticated && location.pathname === '/login') {
    return <Navigate to={safeRedirect(params.get('redirect'))} replace />;
  }

  return <Outlet />;
}
