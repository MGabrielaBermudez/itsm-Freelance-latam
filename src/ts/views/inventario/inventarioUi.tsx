import type { EstadoInventario, InventarioItem, Severity } from '@/models';
import { BadgeCell, type FilterOption } from '@/views/shared/DataTable';

export const ESTADO_INVENTARIO_LABEL: Record<EstadoInventario, string> = {
  'en-stock': 'En stock',
  'en-resguardo': 'En resguardo',
  asignado: 'Asignado',
  'en-mantenimiento': 'En mantenimiento',
  'en-transito': 'En tránsito',
};

export const ESTADO_INVENTARIO_TONE: Record<EstadoInventario, Severity> = {
  'en-stock': 'accent',
  'en-resguardo': 'warning',
  asignado: 'success',
  'en-mantenimiento': 'danger',
  'en-transito': 'neutral',
};

export const ESTADO_INVENTARIO_OPTIONS: FilterOption[] = (
  Object.keys(ESTADO_INVENTARIO_LABEL) as EstadoInventario[]
).map((valor) => ({ value: valor, label: ESTADO_INVENTARIO_LABEL[valor] }));

export function EstadoInventarioCell({ estado }: { estado: EstadoInventario }) {
  return <BadgeCell tone={ESTADO_INVENTARIO_TONE[estado]}>{ESTADO_INVENTARIO_LABEL[estado]}</BadgeCell>;
}

export function valoresUnicos(items: InventarioItem[], key: (item: InventarioItem) => string): FilterOption[] {
  const valores = [...new Set(items.map(key))].sort((a, b) => a.localeCompare(b, 'es'));
  return valores.map((value) => ({ value, label: value }));
}

const PARAMS_FILTRO = {
  estado: (i: InventarioItem) => i.estado,
  categoria: (i: InventarioItem) => i.categoria,
  ubicacion: (i: InventarioItem) => i.ubicacion,
  pais: (i: InventarioItem) => i.pais,
} as const;

export function valorDeFiltro(item: InventarioItem, param: string): string {
  const obtener = (PARAMS_FILTRO as Record<string, (i: InventarioItem) => string>)[param];
  return obtener ? obtener(item) : '';
}