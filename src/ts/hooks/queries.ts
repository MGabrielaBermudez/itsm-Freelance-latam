import { useQuery } from '@tanstack/react-query';
import type { Id, Periodo } from '@/models';
import {
  QUERY_KEYS,
  fetchAsignaciones,
  fetchDashboardData,
  fetchEquipos,
  fetchFreelancers,
  fetchIncidenteById,
  fetchIncidentes,
  fetchIncidentesSerie,
  fetchOnboarding,
} from '@/services/api';
import { fetchInventario, fetchInventarioResumen } from '@/services/inventarioService';

/* =============================================================
   Hooks de datos (TanStack Query).
   Son la única forma en que las vistas obtienen datos, de modo
   que cambiar el origen (mock → API) no afecta a la UI.
   ============================================================= */

export function useDashboard() {
  return useQuery({ queryKey: QUERY_KEYS.dashboard, queryFn: fetchDashboardData });
}

export function useEquipos() {
  return useQuery({ queryKey: QUERY_KEYS.equipos, queryFn: fetchEquipos });
}

export function useFreelancers() {
  return useQuery({ queryKey: QUERY_KEYS.freelancers, queryFn: fetchFreelancers });
}

export function useAsignaciones() {
  return useQuery({ queryKey: QUERY_KEYS.asignaciones, queryFn: fetchAsignaciones });
}

export function useIncidentes() {
  return useQuery({ queryKey: QUERY_KEYS.incidentes, queryFn: fetchIncidentes });
}

export function useOnboarding() {
  return useQuery({ queryKey: QUERY_KEYS.onboarding, queryFn: fetchOnboarding });
}

export function useIncidentesSerie(periodo: Periodo) {
  return useQuery({
    queryKey: [...QUERY_KEYS.incidentes, 'serie', periodo],
    queryFn: () => fetchIncidentesSerie(periodo),
    staleTime: 5 * 60_000,
  });
}

export function useIncidente(id: Id | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.incidentes, id],
    queryFn: () => fetchIncidenteById(id ?? ''),
    enabled: typeof id === 'string' && id.length > 0,
  });
}

export function useInventario() {
  return useQuery({ queryKey: QUERY_KEYS.inventario, queryFn: fetchInventario });
}

export function useInventarioResumen() {
  return useQuery({ queryKey: QUERY_KEYS.inventarioResumen, queryFn: fetchInventarioResumen });
}