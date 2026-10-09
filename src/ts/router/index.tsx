import { Suspense, lazy, type ReactElement } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from '@/router/AppShell';
import { ProtectedRoute, PublicOnlyRoute } from '@/router/ProtectedRoute';
import { LoginView } from '@/views/LoginView';
import { DashboardView } from '@/views/DashboardView';
import { EquiposView } from '@/views/EquiposView';
import { FreelancersView } from '@/views/FreelancersView';
import { AsignacionesView } from '@/views/AsignacionesView';
import { IncidentesView } from '@/views/IncidentesView';
import { OnboardingView } from '@/views/OnboardingView';
import { StockView } from '@/views/StockView';
import { InventarioView } from '@/views/inventario/InventarioView';
import { ResguardoView } from '@/views/inventario/ResguardoView';
import { InventarioDashboardView } from '@/views/inventario/InventarioDashboardView';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { EmptyState } from '@/views/shared/EmptyState';
import { Spinner } from '@/components/Spinner';
import { Card } from '@/components/Card';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { screenReducedVariants, screenVariants } from '@/animations';

/* Las vistas de detalle se cargan bajo demanda: el dashboard entra más ligero. */
const EquipoDetailView = lazy(() =>
  import('@/views/EquipoDetailView').then((m) => ({ default: m.EquipoDetailView })),
);
const IncidenteDetailView = lazy(() =>
  import('@/views/IncidenteDetailView').then((m) => ({ default: m.IncidenteDetailView })),
);
const OnboardingDetailView = lazy(() =>
  import('@/views/OnboardingDetailView').then((m) => ({ default: m.OnboardingDetailView })),
);

function RouteFallback(): ReactElement {
  return (
    <div className="state">
      <Spinner label="Cargando detalle" />
      <p className="state__desc">Preparando la ficha…</p>
    </div>
  );
}

function NotFoundView(): ReactElement {
  return (
    <Card>
      <EmptyState
        title="Página no encontrada"
        desc="La ruta solicitada no existe en el panel. Vuelve al dashboard para continuar."
      >
        <Link className="btn btn--primary" to="/">
          Ir al dashboard
        </Link>
      </EmptyState>
    </Card>
  );
}

/** Fallback de error de render dentro del panel (equivalente al errorElement). */
function RouteError(): ReactElement {
  return (
    <div className="app-shell">
      <div className="app-main">
        <main className="app-content">
          <ErrorBoundary>
            <NotFoundView />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

/**
 * Árbol de rutas envuelto en AnimatePresence: cada rama (login / panel)
 * entra y sale con fade + scale suave. La clave es la rama, no la ruta,
 * para que los cambios internos del panel sigan animándose en AppShell.
 */
function RouteTree(): ReactElement {
  const location = useLocation();
  const reduced = useReducedMotion();
  const branch = location.pathname.startsWith('/login') ? 'login' : 'app';

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={branch}
        variants={reduced ? screenReducedVariants : screenVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Routes location={location}>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginView />} />
          </Route>

          <Route path="/" element={<ProtectedRoute />} errorElement={<RouteError />}>
            <Route element={<AppShell />}>
              <Route index element={<DashboardView />} />
              <Route path="equipos" element={<EquiposView />} />
              <Route
                path="equipos/:id"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <EquipoDetailView />
                  </Suspense>
                }
              />
              <Route path="freelancers" element={<FreelancersView />} />
              <Route path="asignaciones" element={<AsignacionesView />} />
              <Route
                path="asignaciones/:id"
                element={
                  <Card>
                    <EmptyState
                      title="Detalle de asignación"
                      desc="La ficha detallada de asignaciones está en preparación. Usa el listado para ver el progreso."
                    >
                      <Link className="btn btn--primary" to="/asignaciones">
                        Volver a asignaciones
                      </Link>
                    </EmptyState>
                  </Card>
                }
              />
              <Route path="incidentes" element={<IncidentesView />} />
              <Route
                path="incidentes/:id"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <IncidenteDetailView />
                  </Suspense>
                }
              />
              <Route path="onboarding" element={<OnboardingView />} />
              <Route
                path="onboarding/:id"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <OnboardingDetailView />
                  </Suspense>
                }
              />
              <Route path="stock" element={<StockView />} />
              <Route path="inventario" element={<InventarioView />} />
              <Route path="inventario/resguardo" element={<ResguardoView />} />
              <Route path="inventario/dashboard" element={<InventarioDashboardView />} />
              <Route path="*" element={<NotFoundView />} />
              <Route path="index" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export function AppRouter(): ReactElement {
  return (
    <BrowserRouter>
      <RouteTree />
    </BrowserRouter>
  );
}
