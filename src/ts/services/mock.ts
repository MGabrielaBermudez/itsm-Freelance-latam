import type {
  Actividad,
  DashboardData,
  DistribucionEstado,
  EstadoEquipo,
  KpiBreakdownItem,
  KpiKey,
  Notificacion,
  Periodo,
  PrioridadIncidente,
  ResumenKpi,
  TendenciaDia,
} from '@/models';
import {
  PRIORIDAD_LABEL,
  PRIORIDAD_ORDER,
  percentOf,
  sum,
} from '@/utils/formatters';
import {
  actividadMock,
  asignacionesMock,
  equiposMock,
  freelancersMock,
  incidentesMock,
  onboardingMock,
  rand,
  round,
  clamp,
} from './mockData';

/* =============================================================
   Servicio mock asíncrono y tipado.
   Toda la lógica "de negocio" del dashboard se calcula aquí,
   de modo que sustituirlo por una API real solo exige
   mantener las mismas firmas. Ver /services/api.ts.
   ============================================================= */

function count<T>(items: T[], predicate: (item: T) => boolean): number {
  return items.filter(predicate).length;
}

function desgloseConPorcentaje(
  items: Array<{ id: string; nombre: string; valor: number; color: string }>,
): KpiBreakdownItem[] {
  const total = sum(items.map((i) => i.valor));
  return items.map((i) => ({ ...i, secundario: `${Math.round(percentOf(i.valor, total))}%` }));
}

function porEstado<T extends { estado: string }>(items: T[], estados: string[]): Array<{ valor: number }> {
  return estados.map((estado) => ({ valor: count(items, (i) => i.estado === estado) }));
}

const PRIORIDAD_COLOR_MAP: Record<PrioridadIncidente, string> = {
  critica: 'var(--color-danger)',
  alta: 'var(--color-warning-ink)',
  media: 'var(--color-accent)',
  baja: 'var(--color-success)',
};

/* ---------------- Desgloses de KPI ---------------- */

const desgloseEquipos = (): KpiBreakdownItem[] => {
  const [asignado, resguardo, stock] = porEstado(equiposMock, [
    'asignado',
    'en-resguardo',
    'en-stock',
  ]);
  return desgloseConPorcentaje([
    { id: 'asignado', nombre: 'Asignado', valor: asignado?.valor ?? 0, color: 'var(--color-primary)' },
    { id: 'en-resguardo', nombre: 'En resguardo', valor: resguardo?.valor ?? 0, color: 'var(--color-chart-neutral)' },
    { id: 'en-stock', nombre: 'En stock', valor: stock?.valor ?? 0, color: 'var(--color-accent)' },
  ]);
};

const desgloseFreelancers = (): KpiBreakdownItem[] => {
  const [activo, pausado, inactivo] = porEstado(freelancersMock, ['activo', 'pausado', 'inactivo']);
  return desgloseConPorcentaje([
    { id: 'activo', nombre: 'Activos', valor: activo?.valor ?? 0, color: 'var(--color-primary)' },
    { id: 'pausado', nombre: 'Pausados', valor: pausado?.valor ?? 0, color: 'var(--color-accent)' },
    { id: 'inactivo', nombre: 'Inactivos', valor: inactivo?.valor ?? 0, color: 'var(--color-chart-neutral)' },
  ]);
};

const desgloseAsignaciones = (): KpiBreakdownItem[] => {
  const [activa, pausada, finalizada] = porEstado(asignacionesMock, ['activa', 'pausada', 'finalizada']);
  return desgloseConPorcentaje([
    { id: 'activa', nombre: 'Activas', valor: activa?.valor ?? 0, color: 'var(--color-primary)' },
    { id: 'pausada', nombre: 'Pausadas', valor: pausada?.valor ?? 0, color: 'var(--color-accent)' },
    { id: 'finalizada', nombre: 'Finalizadas', valor: finalizada?.valor ?? 0, color: 'var(--color-chart-neutral)' },
  ]);
};

const desgloseIncidentes = (): KpiBreakdownItem[] =>
  PRIORIDAD_ORDER.map((p) => ({
    id: p,
    nombre: PRIORIDAD_LABEL[p],
    valor: count(incidentesMock, (i) => i.prioridad === p),
    color: PRIORIDAD_COLOR_MAP[p],
  }));

const desgloseOnboarding = (): KpiBreakdownItem[] => {
  const pendiente = count(onboardingMock, (o) => o.estado === 'pendiente');
  const enCurso = count(onboardingMock, (o) => o.estado === 'en-curso');
  const completado = count(onboardingMock, (o) => o.estado === 'completado');
  return desgloseConPorcentaje([
    { id: 'pendiente', nombre: 'Pendientes', valor: pendiente, color: 'var(--color-accent)' },
    { id: 'en-curso', nombre: 'En curso', valor: enCurso, color: 'var(--color-primary)' },
    { id: 'completado', nombre: 'Completados', valor: completado, color: 'var(--color-chart-neutral)' },
  ]);
};

const desgloseStock = (): KpiBreakdownItem[] =>
  desgloseConPorcentaje([
    {
      id: 'en-stock',
      nombre: 'En stock',
      valor: count(equiposMock, (e) => e.estado === 'en-stock'),
      color: 'var(--color-accent)',
    },
    {
      id: 'en-resguardo',
      nombre: 'En resguardo',
      valor: count(equiposMock, (e) => e.estado === 'en-resguardo'),
      color: 'var(--color-chart-neutral)',
    },
  ]);

/* ---------------- Series para sparklines ---------------- */

function sparkline(length = 8): number[] {
  let value = 45 + Math.random() * 20;
  return Array.from({ length }, () => {
    value += rand(-7, 7);
    return clamp(Math.round(value), 20, 95);
  });
}

function buildKpi(
  clave: KpiKey,
  valor: number,
  desglose: KpiBreakdownItem[],
  delta: number,
): ResumenKpi {
  return {
    clave,
    valor,
    anterior: valor + delta,
    serie: sparkline(),
    desglose,
  };
}

/* ---------------- Tendencia diaria (Abiertos vs Resueltos) ---------------- */

const TENDENCIA_FMT = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' });

export function buildTendencia(dias: number, ref = new Date()): TendenciaDia[] {
  return Array.from({ length: dias }, (_, i) => {
    const fecha = new Date(ref);
    fecha.setDate(ref.getDate() - (dias - 1 - i));
    const base = 4 + Math.sin(i / 3) * 2;
    return {
      fecha: fecha.toISOString().slice(0, 10),
      etiqueta: TENDENCIA_FMT.format(fecha).replace('.', ''),
      abiertos: clamp(Math.round(base + rand(-2, 3)), 0, 14),
      resueltos: clamp(Math.round(base + rand(-1, 4)), 1, 16),
    };
  });
}

export function buildDashboardData(): DashboardData {
  const equiposTotal = equiposMock.length;
  const freelancersActivos = count(freelancersMock, (f) => f.estado === 'activo');
  const asignacionesActivas = count(asignacionesMock, (a) => a.estado === 'activa');
  const incidentesAbiertos = count(incidentesMock, (i) => i.estado === 'abierto');
  const onboardingPendientes = count(
    onboardingMock,
    (o) => o.estado === 'pendiente' || o.estado === 'en-curso',
  );
  const enStock = count(equiposMock, (e) => e.estado === 'en-stock');
  const enResguardo = count(equiposMock, (e) => e.estado === 'en-resguardo');
  const asignado = count(equiposMock, (e) => e.estado === 'asignado');

  const kpis: ResumenKpi[] = [
    buildKpi('equipos', equiposTotal, desgloseEquipos(), round(rand(-2, 3))),
    buildKpi('freelancers', freelancersActivos, desgloseFreelancers(), round(rand(-1, 2))),
    buildKpi('asignaciones', asignacionesActivas, desgloseAsignaciones(), round(rand(0, 2))),
    buildKpi('incidentes', incidentesAbiertos, desgloseIncidentes(), round(rand(-1, 3))),
    buildKpi('onboarding', onboardingPendientes, desgloseOnboarding(), round(rand(0, 2))),
    buildKpi('stock', enStock + enResguardo, desgloseStock(), round(rand(-2, 1))),
  ];

  const estados: DistribucionEstado[] = (['asignado', 'en-resguardo', 'en-stock'] as EstadoEquipo[]).map(
    (estado) => ({
      estado,
      valor: count(equiposMock, (e) => e.estado === estado),
    }),
  );

  const incidentesPorPrioridad = PRIORIDAD_ORDER.map((prioridad) => ({
    prioridad,
    valor: count(incidentesMock, (i) => i.prioridad === prioridad),
  }));

  const actividad = [...actividadMock].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return {
    kpis,
    estados,
    operativo: { enStock, asignado, enResguardo, total: equiposTotal },
    incidentesPorPrioridad,
    incidentesSerie: [],
    tendencia: buildTendencia(90),
    ticketsPendientes: [],
    actividad,
  };
}

/* ---------------- Actividad en vivo ---------------- */

const LIVE_POOL: Array<Omit<Actividad, 'id' | 'timestamp'>> = [
  {
    tipo: 'incidente',
    titulo: 'Nuevo incidente <em>INC-006</em> abierto',
    detalle: 'Teclado no responde · prioridad Media',
    usuario: 'Helpdesk',
    href: '/incidentes',
  },
  {
    tipo: 'devolucion',
    titulo: 'Equipo devuelto a <em>En stock</em>',
    detalle: 'Revisión de hardware completada',
    usuario: 'Logística',
    href: '/equipos?estado=en-stock',
  },
  {
    tipo: 'onboarding',
    titulo: 'Paso completado en <em>Onboarding</em>',
    detalle: 'Accesos verificados',
    usuario: 'RRHH',
    href: '/onboarding',
  },
  {
    tipo: 'asignacion',
    titulo: 'Nueva asignación <em>AS-006</em> creada',
    detalle: 'Equipo preparado para entrega',
    usuario: 'Ops',
    href: '/asignaciones',
  },
];

export function generateLiveActivity(): Actividad {
  const pick = LIVE_POOL[Math.floor(Math.random() * LIVE_POOL.length)] ?? LIVE_POOL[0];
  if (!pick) {
    throw new Error('El pool de actividad en vivo no puede estar vacío');
  }
  return {
    ...pick,
    id: `a-live-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
  };
}

/* ---------------- Notificaciones ---------------- */

export function getNotificaciones(): Notificacion[] {
  return [
    {
      id: 'n-001',
      titulo: 'Incidente crítico',
      detalle: 'INC-003 ha consumido el 40 % del SLA (2 h)',
      tiempo: 'hace 5 min',
      leida: false,
      tono: 'danger',
    },
    {
      id: 'n-002',
      titulo: 'Onboarding próximo a cerrar',
      detalle: 'Sara Vega ha completado 4 de 6 pasos',
      tiempo: 'hace 25 min',
      leida: false,
      tono: 'accent',
    },
    {
      id: 'n-003',
      titulo: 'Equipo en resguardo',
      detalle: 'El Monitor UltraWide lleva 12 días',
      tiempo: 'hace 2 h',
      leida: true,
      tono: 'warning',
    },
  ];
}

/* ---------------- Series de incidentes ---------------- */

export function buildIncidentesSerie(periodo: Periodo): DashboardData['incidentesSerie'] {
  const labels = Array.from({ length: periodo }, (_, i) => String(i + 1));
  return PRIORIDAD_ORDER.map((prioridad) => {
    const base = count(incidentesMock, (i) => i.prioridad === prioridad);
    return {
      prioridad,
      etiquetas: labels,
      puntos: Array.from({ length: periodo }, (_, d) =>
        clamp(round(base * rand(0.2, 1.1) * (1 - d / (periodo * 2))), 0, 14),
      ),
    };
  });
}

/* ---------------- Metadatos de página (config estática) ---------------- */

export { getPageMeta } from './mockData';