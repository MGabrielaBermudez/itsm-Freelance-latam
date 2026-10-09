import { useCallback, type ReactElement } from 'react';
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { DEMO_ENABLED, getDemoAccounts } from '@/services/authService';
import { safeRedirect } from '@/router/ProtectedRoute';
import { AuthLayout } from '@/components/AuthLayout';
import { LoginForm } from '@/components/LoginForm';
import { Toast } from '@/components/Toast';

export function LoginView(): ReactElement {
  const [params] = useSearchParams();
  const location = useLocation();
  const { mode, toggle } = useTheme();
  const { isAuthenticated, notice, setNotice } = useAuth();

  const redirectTo = safeRedirect(params.get('redirect'));

  const handleClose = useCallback(() => setNotice(null), [setNotice]);

  /* Solo salimos de la vista si seguimos en /login: al autenticarnos la
     rama queda en animación de salida y debe seguir renderizando. */
  if (isAuthenticated && location.pathname === '/login') {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <>
      <AuthLayout theme={mode} onToggleTheme={toggle}>
        <LoginForm
          redirectTo={redirectTo}
          demoAccounts={DEMO_ENABLED ? getDemoAccounts() : []}
        />
      </AuthLayout>
      <Toast message={notice} onClose={handleClose} />
    </>
  );
}
