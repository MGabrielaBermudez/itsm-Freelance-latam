import { QueryClient } from '@tanstack/react-query';
import type {
  Actividad,
  Asignacion,
  DashboardData,
  Equipo,
  Freelancer,
  Id,
  Incidente,
  Onboarding,
  Periodo,
} from '@/models';
import { buildDashboardData, buildIncidentesSerie, generateLiveActivity } from './mock';
import {
  actividadMock,
  asignacionesMock,
  equiposMock,
  freelancersMock,
  incidentesMock,
  onboardingMock,
} from './mockData';

/* =============================================================
   CAPA DE SERVICIO · punto único de intercambio mock → API real.

   Todas las funciones son asíncronas y tipadas. Para migrar:
   1. Sustituye el cuerpo de cada función por una llamada HTTP
      manteniendo la firma (Promise<T>) y los tipos de @/models.
   2. Añade la base URL desde import.meta.env.VITE_API_BASE_URL.
   3. Para el feed en vivo, cambia `generateLiveActivity()` por
      SSE / WebSocket o por `refetchInterval` de TanStack Query.
   Ninguna vista importa datos directamente: todas usan los hooks
   de /hooks/queries, así que la migración no toca la UI.
   ============================================================= */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: { retry: 0 },
  },
});

/** Latencia artificial para que los skeletons sean visibles. */
const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const QUERY_KEYS = {
  dashboard: ['dashboard'],
  equipos: ['equipos'],
  freelancers: ['freelancers'],
  asignaciones: ['asignaciones'],
  incidentes: ['incidentes'],
  onboarding: ['onboarding'],
  actividad: ['actividad'],
  inventario: ['inventario'],
  inventarioResumen: ['inventario', 'resumen'],
} as const;

/* ---------------- Lecturas ---------------- */

export async function fetchDashboardData(): Promise<DashboardData> {
  await delay(260);
  return buildDashboardData();
}

export async function fetchEquipos(): Promise<Equipo[]> {
  await delay(200);
  return [...equiposMock];
}

export async function fetchFreelancers(): Promise<Freelancer[]> {
  await delay(210);
  return [...freelancersMock];
}

export async function fetchAsignaciones(): Promise<Asignacion[]> {
  await delay(215);
  return [...asignacionesMock];
}

export async function fetchIncidentes(): Promise<Incidente[]> {
  await delay(205);
  return [...incidentesMock];
}

export async function fetchOnboarding(): Promise<Onboarding[]> {
  await delay(225);
  return [...onboardingMock];
}

export async function fetchIncidentesSerie(periodo: Periodo): Promise<DashboardData['incidentesSerie']> {
  await delay(160);
  return buildIncidentesSerie(periodo);
}

export async function fetchActividad(limit = 10): Promise<Actividad[]> {
  await delay(170);
  return [...actividadMock]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export async function fetchActividadEnVivo(): Promise<Actividad> {
  await delay(120);
  return generateLiveActivity();
}

/* ---------------- Detalle ---------------- */

export async function fetchEquipoById(id: Id): Promise<Equipo | null> {
  await delay(150);
  return equiposMock.find((equipo) => equipo.id === id) ?? null;
}

export async function fetchIncidenteById(id: Id): Promise<Incidente | null> {
  await delay(150);
  return incidentesMock.find((incidente) => incidente.id === id) ?? null;
}

export { generateLiveActivity, BASE_URL };