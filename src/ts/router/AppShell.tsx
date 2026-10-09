import { memo, useCallback, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useIsCompact } from '@/hooks/useMediaQuery';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import {
  useAsignaciones,
  useDashboard,
  useEquipos,
  useFreelancers,
  useIncidentes,
  useOnboarding,
} from '@/hooks/queries';
import type { Notificacion } from '@/models';
import { Header, type SearchResult } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { HelpFab } from '@/components/HelpFab';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { getNotificaciones, getPageMeta } from '@/services/mock';
import { initials } from '@/utils/formatters';

/** Las rutas de detalle heredan la cabecera de su sección. */
const SECTION_PREFIXES = [
  '/equipos',
  '/freelancers',
  '/asignaciones',
  '/incidentes',
  '/onboarding',
  '/stock',
  '/inventario',
] as const;

/* Las subrutas con cabecera propia se resuelven por coincidencia exacta. */
const SECTION_EXACT = ['/inventario/resguardo', '/inventario/dashboard'] as const;

function resolveSection(pathname: string): string {
  const exact = SECTION_EXACT.find((path) => pathname === path);
  if (exact) return exact;
  return SECTION_PREFIXES.find((prefix) => pathname.startsWith(prefix)) ?? '/';
}

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const isCompact = useIsCompact();
  const { mode, toggle } = useTheme();
  const { user, logout } = useAuth();

  const userName = user?.nombre ?? 'Invitado/a';
  const userRole = user?.cargo ?? '';
  const userInitials = initials(userName);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(() => getNotificaciones());

  const equiposQuery = useEquipos();
  const freelancersQuery = useFreelancers();
  const asignacionesQuery = useAsignaciones();
  const incidentesQuery = useIncidentes();
  const onboardingQuery = useOnboarding();
  const dashboardQuery = useDashboard();

  const meta = useMemo(() => getPageMeta(resolveSection(location.pathname)), [location.pathname]);

  const resultados = useMemo<SearchResult[]>(() => {
    const rows: SearchResult[] = [];

    (equiposQuery.data ?? []).forEach((e) =>
      rows.push({
        id: e.id,
        titulo: e.nombre,
        subtitulo: `${e.marca} ${e.modelo} · ${e.ubicacion}`,
        ruta: `/equipos/${e.id}`,
        tipo: 'Equipo',
      }),
    );

    (freelancersQuery.data ?? []).forEach((f) =>
      rows.push({
        id: f.id,
        titulo: f.nombre,
        subtitulo: `${f.especialidad} · ${f.nivel}`,
        ruta: '/freelancers',
        tipo: 'Freelancer',
      }),
    );

    (incidentesQuery.data ?? []).forEach((i) =>
      rows.push({
        id: i.id,
        titulo: `${i.codigo} · ${i.titulo}`,
        subtitulo: `Prioridad ${i.prioridad} · estado ${i.estado}`,
        ruta: `/incidentes/${i.id}`,
        tipo: 'Incidente',
      }),
    );

    (asignacionesQuery.data ?? []).forEach((a) =>
      rows.push({
        id: a.id,
        titulo: `${a.codigo} · ${a.proyecto}`,
        subtitulo: `Estado ${a.estado}`,
        ruta: `/asignaciones/${a.id}`,
        tipo: 'Asignación',
      }),
    );

    (onboardingQuery.data ?? []).forEach((o) =>
      rows.push({
        id: o.id,
        titulo: `Onboarding · ${o.puesto}`,
        subtitulo: `${o.pasosCompletados}/${o.pasosTotales} pasos · ${o.estado}`,
        ruta: `/onboarding/${o.id}`,
        tipo: 'Onboarding',
      }),
    );

    return rows;
  }, [
    equiposQuery.data,
    freelancersQuery.data,
    incidentesQuery.data,
    asignacionesQuery.data,
    onboardingQuery.data,
  ]);

  const handleRefresh = useCallback(() => {
    void Promise.all([
      dashboardQuery.refetch(),
      equiposQuery.refetch(),
      freelancersQuery.refetch(),
      asignacionesQuery.refetch(),
      incidentesQuery.refetch(),
      onboardingQuery.refetch(),
    ]);
  }, [
    dashboardQuery,
    equiposQuery,
    freelancersQuery,
    asignacionesQuery,
    incidentesQuery,
    onboardingQuery,
  ]);

  const handleLogout = useCallback(() => {
    setNotificaciones([]);
    setMobileOpen(false);
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  const unreadCount = notificaciones.filter((n) => !n.leida).length;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Saltar al contenido principal
      </a>

      <Sidebar
        collapsed={collapsed && !isCompact}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        userName={userName}
        userRole={userRole}
        userInitials={userInitials}
      />

      <div className="app-main">
        <Header
          titulo={meta.titulo}
          subtitulo={meta.descripcion}
          notificaciones={notificaciones}
          resultados={resultados}
          onToggleTheme={toggle}
          theme={mode}
          onToggleSidebarMobile={() => setMobileOpen((v) => !v)}
          onRefresh={handleRefresh}
          isRefreshing={dashboardQuery.isFetching}
          userInitials={userInitials}
          userName={userName}
          onLogout={handleLogout}
          onReadAll={() => setNotificaciones((list) => list.map((n) => ({ ...n, leida: true })))}
          unreadCount={unreadCount}
        />

        <main className="app-content" id="main-content" tabIndex={-1}>
          <ErrorBoundary>
            <div className="page-anim" key={location.pathname}>
              <Outlet />
            </div>
          </ErrorBoundary>
        </main>
      </div>

      <HelpFab />
    </div>
  );
}

export const MemoAppShell = memo(AppShell);