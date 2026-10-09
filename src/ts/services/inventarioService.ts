import type { Id, InventarioInput, InventarioItem, ResumenInventario } from '@/models';
import { buildItem, inventarioSeeds } from './inventarioData';

/* =============================================================
   SERVICIO DE INVENTARIO · mock asíncrono tipado (punto de
   intercambio mock → API real, igual que la capa de /services).
   ============================================================= */

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

let inventarioCache: InventarioItem[] = inventarioSeeds.map(buildItem);

export function resetInventarioCache(): void {
  inventarioCache = inventarioSeeds.map(buildItem);
}

export async function fetchInventario(): Promise<InventarioItem[]> {
  await delay(240);
  return [...inventarioCache];
}

export async function fetchInventarioResumen(): Promise<ResumenInventario> {
  await delay(180);
  const items = inventarioCache;
  return {
    total: items.length,
    disponibles: items.filter((i) => i.estado === 'en-stock').length,
    enResguardo: items.filter((i) => i.estado === 'en-resguardo').length,
    asignados: items.filter((i) => i.estado === 'asignado').length,
    enMantenimiento: items.filter((i) => i.estado === 'en-mantenimiento').length,
    valorTotal: items.reduce((acc, i) => acc + i.valor, 0),
    porCategoria: rename(agrupar(items, (i) => i.categoria), 'categoria'),
    porPais: rename(agrupar(items, (i) => i.pais), 'pais'),
    porUbicacion: rename(agrupar(items, (i) => i.ubicacion), 'ubicacion'),
  };
}

function agrupar(
  items: InventarioItem[],
  key: (i: InventarioItem) => string,
): Array<{ nombre: string; unidades: number; valor: number }> {
  const map = new Map<string, { unidades: number; valor: number }>();
  for (const item of items) {
    const k = key(item);
    const current = map.get(k) ?? { unidades: 0, valor: 0 };
    current.unidades += 1;
    current.valor += item.valor;
    map.set(k, current);
  }
  return [...map.entries()].map(([nombre, data]) => ({ nombre, ...data }));
}

function rename(
  rows: Array<{ nombre: string; unidades: number; valor: number }>,
  label: 'categoria' | 'pais' | 'ubicacion',
): Array<{ [K in 'categoria' | 'pais' | 'ubicacion']: string } & { unidades: number; valor: number }> {
  return rows.map(({ nombre, ...rest }) => ({ [label]: nombre, ...rest }) as never);
}

export async function crearInventarioItem(input: InventarioInput): Promise<InventarioItem> {
  await delay(320);
  const next = String(inventarioCache.length + 1).padStart(3, '0');
  const item: InventarioItem = {
    id: `inv-${next}`,
    codigo: `INV-${next}`,
    ...input,
    responsableId: null,
    enTransito: false,
    fechaUltimoMovimiento: new Date().toISOString(),
    diasEnUbicacion: 0,
    historial: [
      {
        id: 'mov-nuevo',
        fecha: new Date().toISOString(),
        tipo: 'entrada',
        desde: null,
        hacia: input.ubicacion,
        usuario: 'Inventario',
      },
    ],
  };
  inventarioCache = [item, ...inventarioCache];
  return item;
}

export async function actualizarInventarioItem(id: Id, patch: Partial<InventarioInput>): Promise<InventarioItem> {
  await delay(320);
  const index = inventarioCache.findIndex((i) => i.id === id);
  if (index === -1) throw new Error('Equipo no encontrado');
  const previo = inventarioCache[index]!;
  const hoy = new Date().toISOString();
  const actualizado: InventarioItem = {
    ...previo,
    ...patch,
    historial: [
      {
        id: `mov-${Date.now()}`,
        fecha: hoy,
        tipo: 'traslado',
        desde: previo.ubicacion,
        hacia: patch.ubicacion ?? previo.ubicacion,
        usuario: 'Inventario',
        nota: 'Actualización de ficha',
      },
      ...previo.historial,
    ],
  };
  inventarioCache[index] = actualizado;
  return actualizado;
}