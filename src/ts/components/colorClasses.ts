import type { EstadoEquipo, PrioridadIncidente } from '@/models';

/**
 * Clases CSS de color por dominio. Se usan en lugar de estilos inline
 * (regla del proyecto: el color se resuelve en /css, no en el TSX).
 */

export const ESTADO_COLOR_CLASS: Record<EstadoEquipo, string> = {
  asignado: 'b-primary',
  'en-resguardo': 'b-neutral',
  'en-stock': 'b-accent',
};

export const ESTADO_FILL_CLASS: Record<EstadoEquipo, string> = {
  asignado: 'c-primary',
  'en-resguardo': 'c-neutral',
  'en-stock': 'c-accent',
};

export const PRIORIDAD_FILL_CLASS: Record<PrioridadIncidente, string> = {
  critica: 'c-danger',
  alta: 'c-warning-ink',
  media: 'c-accent',
  baja: 'c-success',
};

export const PRIORIDAD_BG_CLASS: Record<PrioridadIncidente, string> = {
  critica: 'b-danger',
  alta: 'b-warning-ink',
  media: 'b-accent',
  baja: 'b-success',
};

export const PRIORIDAD_STROKE_CLASS: Record<PrioridadIncidente, string> = {
  critica: 's-danger',
  alta: 's-warning',
  media: 's-accent',
  baja: 's-success',
};

/**
 * El modelo expone los colores del desglose como token CSS
 * (`var(--color-success)`, ...). Aquí se traducen a clases para
 * mantener la regla "el color vive en /css".
 */
const TOKEN_BG_CLASS: Record<string, string> = {
  'var(--color-primary)': 'b-primary',
  'var(--color-accent)': 'b-accent',
  'var(--color-success)': 'b-success',
  'var(--color-warning)': 'b-warning',
  'var(--color-warning-ink)': 'b-warning-ink',
  'var(--color-danger)': 'b-danger',
  'var(--color-chart-neutral)': 'b-neutral',
  'var(--color-text-muted)': 'b-muted',
};

export const breakdownColorClass = (color: string): string => TOKEN_BG_CLASS[color] ?? 'b-accent';