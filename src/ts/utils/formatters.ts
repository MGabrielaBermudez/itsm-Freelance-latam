import type { EstadoEquipo, PrioridadIncidente, Severity } from '@/models';

const numberFormat = new Intl.NumberFormat('es-ES');

export const formatNumber = (value: number): string => numberFormat.format(Math.round(value));

export const formatCompact = (value: number): string =>
  new Intl.NumberFormat('es-ES', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);

export const formatPercent = (value: number, decimals = 0): string =>
  `${value.toFixed(decimals)}%`;

export const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(iso),
  );

export const formatDateTime = (iso: string): string =>
  new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));

const RELATIVE_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 31536000],
  ['month', 2592000],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1],
];

const relativeFormat = new Intl.RelativeTimeFormat('es', { numeric: 'auto', style: 'narrow' });

export const formatRelativeTime = (iso: string, now = Date.now()): string => {
  const diffSeconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const absolute = Math.abs(diffSeconds);

  for (const [unit, seconds] of RELATIVE_UNITS) {
    if (absolute >= seconds || unit === 'second') {
      return relativeFormat.format(Math.round(diffSeconds / seconds), unit);
    }
  }

  return relativeFormat.format(diffSeconds, 'second');
};

export const initials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const sum = (values: number[]): number => values.reduce((acc, value) => acc + value, 0);

export const percentOf = (part: number, total: number): number =>
  total <= 0 ? 0 : (part / total) * 100;

export const trendDirection = (delta: number): 'up' | 'down' | 'flat' => {
  if (delta > 0.05) return 'up';
  if (delta < -0.05) return 'down';
  return 'flat';
};

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const matchesSearch = (haystack: string[], term: string): boolean => {
  const needle = term.trim().toLowerCase();
  if (needle.length === 0) return true;
  return haystack.some((value) => value.toLowerCase().includes(needle));
};

/* ---------- Etiquetas de dominio ---------- */

export const ESTADO_EQUIPO_LABEL: Record<EstadoEquipo, string> = {
  asignado: 'Asignado',
  'en-resguardo': 'En resguardo',
  'en-stock': 'En stock',
};

export const ESTADO_EQUIPO_COLOR: Record<EstadoEquipo, string> = {
  asignado: 'var(--color-primary)',
  'en-resguardo': 'var(--color-chart-neutral)',
  'en-stock': 'var(--color-accent)',
};

export const ESTADO_EQUIPO_TONE: Record<EstadoEquipo, Severity> = {
  asignado: 'success',
  'en-resguardo': 'warning',
  'en-stock': 'accent',
};

export const PRIORIDAD_LABEL: Record<PrioridadIncidente, string> = {
  critica: 'Crítica',
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

export const PRIORIDAD_COLOR: Record<PrioridadIncidente, string> = {
  critica: 'var(--color-danger)',
  alta: 'var(--color-warning-ink)',
  media: 'var(--color-accent)',
  baja: 'var(--color-success)',
};

export const PRIORIDAD_TONE: Record<PrioridadIncidente, Severity> = {
  critica: 'danger',
  alta: 'warning',
  media: 'accent',
  baja: 'success',
};

export const PRIORIDAD_ORDER: PrioridadIncidente[] = ['critica', 'alta', 'media', 'baja'];

export const ESTADO_INCIDENTE_LABEL = {
  abierto: 'Abierto',
  'en-curso': 'En curso',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado',
} as const;

export const ESTADO_ASIGNACION_LABEL = {
  activa: 'Activa',
  pausada: 'Pausada',
  finalizada: 'Finalizada',
} as const;

export const ESTADO_ONBOARDING_LABEL = {
  pendiente: 'Pendiente',
  'en-curso': 'En curso',
  completado: 'Completado',
} as const;

export const TIPO_ACTIVIDAD_LABEL = {
  asignacion: 'Asignación',
  incidente: 'Incidente',
  onboarding: 'Onboarding',
  devolucion: 'Devolución',
} as const;

export const ESTADO_EQUIPO_VALUES = Object.keys(ESTADO_EQUIPO_LABEL) as EstadoEquipo[];
export const PRIORIDAD_VALUES = Object.keys(PRIORIDAD_LABEL) as PrioridadIncidente[];