import type { InventarioInput, InventarioItem, MovimientoInventario } from '@/models';
import { addDays, subDays } from './mockData';

const BASE = '2025-10-01T00:00:00.000Z';

function movements(patron: Array<[number, MovimientoInventario['tipo'], string, string | null]>): MovimientoInventario[] {
  return patron.map(([dias, tipo, hacia, desde], i) => ({
    id: `mov-${i}`,
    fecha: subDays(BASE, dias),
    tipo,
    desde,
    hacia,
    usuario: i % 2 === 0 ? 'Ops' : 'Logística',
  }));
}

export interface InventarioSeed extends InventarioInput {
  id: string;
  codigo: string;
  diasEnUbicacion: number;
}

export function buildItem(seed: InventarioSeed): InventarioItem {
  const enTransito = seed.estado === 'en-transito';
  const historial = movements([
    [seed.diasEnUbicacion + 2, enTransito ? 'salida' : 'entrada', seed.ubicacion, enTransito ? 'Almacén Central' : null],
    [seed.diasEnUbicacion, 'entrada', seed.ubicacion, null],
  ]);

  return {
    ...seed,
    enTransito,
    responsableId: seed.estado === 'asignado' ? 'fr-001' : seed.estado === 'en-resguardo' ? 'fr-003' : null,
    fechaUltimoMovimiento: seed.diasEnUbicacion > 0 ? subDays(BASE, seed.diasEnUbicacion) : addDays(BASE, 0),
    historial,
  };
}

export const inventarioSeeds: InventarioSeed[] = [
  { id: 'inv-001', codigo: 'INV-001', nombre: 'MacBook Pro 16', categoria: 'Portátil', marca: 'Apple', modelo: 'M3 Max', serial: 'INV001', estado: 'asignado', ubicacion: 'Oficina Madrid', pais: 'España', almacen: 'Almacén Central', valor: 2800, diasEnUbicacion: 0 },
  { id: 'inv-002', codigo: 'INV-002', nombre: 'ThinkPad X1', categoria: 'Portátil', marca: 'Lenovo', modelo: 'X1 Gen 11', serial: 'INV002', estado: 'asignado', ubicacion: 'Oficina Bilbao', pais: 'España', almacen: 'Almacén Norte', valor: 1800, diasEnUbicacion: 1 },
  { id: 'inv-003', codigo: 'INV-003', nombre: 'Monitor UltraWide', categoria: 'Monitor', marca: 'LG', modelo: '34GP83', serial: 'INV003', estado: 'en-resguardo', ubicacion: 'Almacén Norte', pais: 'España', almacen: 'Almacén Norte', valor: 800, diasEnUbicacion: 12 },
  { id: 'inv-004', codigo: 'INV-004', nombre: 'Dell Precision 7760', categoria: 'Workstation', marca: 'Dell', modelo: '7760', serial: 'INV004', estado: 'en-stock', ubicacion: 'Almacén Central', pais: 'Panamá', almacen: 'Almacén Central', valor: 3200, diasEnUbicacion: 20 },
  { id: 'inv-005', codigo: 'INV-005', nombre: 'iPad Pro 12.9', categoria: 'Tablet', marca: 'Apple', modelo: 'M2', serial: 'INV005', estado: 'en-stock', ubicacion: 'Almacén Central', pais: 'Panamá', almacen: 'Almacén Central', valor: 1150, diasEnUbicacion: 8 },
  { id: 'inv-006', codigo: 'INV-006', nombre: 'Docking TB4', categoria: 'Accesorio', marca: 'CalDigit', modelo: 'TS4', serial: 'INV006', estado: 'en-stock', ubicacion: 'Almacén Norte', pais: 'España', almacen: 'Almacén Norte', valor: 420, diasEnUbicacion: 5 },
  { id: 'inv-007', codigo: 'INV-007', nombre: 'Teclado Mecánico', categoria: 'Periférico', marca: 'Keychron', modelo: 'K8 Pro', serial: 'INV007', estado: 'en-resguardo', ubicacion: 'Oficina Bilbao', pais: 'España', almacen: 'Almacén Norte', valor: 140, diasEnUbicacion: 3 },
  { id: 'inv-008', codigo: 'INV-008', nombre: 'Ratón Logi MX', categoria: 'Periférico', marca: 'Logitech', modelo: 'MX Master 3S', serial: 'INV008', estado: 'en-mantenimiento', ubicacion: 'Almacén Central', pais: 'Panamá', almacen: 'Almacén Central', valor: 110, diasEnUbicacion: 2 },
  { id: 'inv-009', codigo: 'INV-009', nombre: 'Monitor 4K Dell', categoria: 'Monitor', marca: 'Dell', modelo: 'U2723QE', serial: 'INV009', estado: 'en-stock', ubicacion: 'Almacén Norte', pais: 'México', almacen: 'Almacén Norte', valor: 950, diasEnUbicacion: 15 },
  { id: 'inv-010', codigo: 'INV-010', nombre: 'HP EliteBook', categoria: 'Portátil', marca: 'HP', modelo: '840 G10', serial: 'INV010', estado: 'asignado', ubicacion: 'Oficina Madrid', pais: 'España', almacen: 'Almacén Central', valor: 1500, diasEnUbicacion: 0 },
  { id: 'inv-011', codigo: 'INV-011', nombre: 'Cámara Logitech Brio', categoria: 'Periférico', marca: 'Logitech', modelo: 'Brio 4K', serial: 'INV011', estado: 'en-stock', ubicacion: 'Almacén Norte', pais: 'Colombia', almacen: 'Almacén Norte', valor: 190, diasEnUbicacion: 25 },
  { id: 'inv-012', codigo: 'INV-012', nombre: 'Auriculares Sennheiser', categoria: 'Accesorio', marca: 'Sennheiser', modelo: 'HD 450BT', serial: 'INV012', estado: 'en-resguardo', ubicacion: 'Oficina Madrid', pais: 'España', almacen: 'Almacén Central', valor: 170, diasEnUbicacion: 9 },
  { id: 'inv-013', codigo: 'INV-013', nombre: 'Switch 16-puertos', categoria: 'Red', marca: 'Ubiquiti', modelo: 'USW-16', serial: 'INV013', estado: 'en-stock', ubicacion: 'Almacén Central', pais: 'Panamá', almacen: 'Almacén Central', valor: 780, diasEnUbicacion: 30 },
  { id: 'inv-014', codigo: 'INV-014', nombre: 'Workstation Rack HP', categoria: 'Workstation', marca: 'HP', modelo: 'Z8 G5', serial: 'INV014', estado: 'en-transito', ubicacion: 'En tránsito', pais: 'México', almacen: 'Almacén Norte', valor: 4100, diasEnUbicacion: 1 },
  { id: 'inv-015', codigo: 'INV-015', nombre: 'Mac mini M2', categoria: 'Workstation', marca: 'Apple', modelo: 'M2', serial: 'INV015', estado: 'en-stock', ubicacion: 'Almacén Norte', pais: 'Colombia', almacen: 'Almacén Norte', valor: 1100, diasEnUbicacion: 4 },
  { id: 'inv-016', codigo: 'INV-016', nombre: 'Tablet Samsung S9', categoria: 'Tablet', marca: 'Samsung', modelo: 'Tab S9', serial: 'INV016', estado: 'en-resguardo', ubicacion: 'Oficina Bilbao', pais: 'España', almacen: 'Almacén Norte', valor: 920, diasEnUbicacion: 6 },
];