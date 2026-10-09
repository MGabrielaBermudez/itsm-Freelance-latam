import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Equipo } from '@/models';
import { useEquipos } from '@/hooks/queries';
import {
  ActiveFilterNote,
  DataTable,
  FilterSelect,
  stockColumns,
} from '@/views/shared/DataTable';
import { getPageMeta } from '@/services/mock';
import { formatCurrency, matchesSearch } from '@/utils/formatters';

export function StockView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const equiposQuery = useEquipos();

  const todos: Equipo[] = useMemo(() => equiposQuery.data ?? [], [equiposQuery.data]);
  const stock = useMemo(() => todos.filter((e) => e.estado !== 'asignado'), [todos]);

  const estadoParam = searchParams.get('estado');
  const ubicacionParam = searchParams.get('ubicacion');
  const antiguedadParam = searchParams.get('antiguedad');
  const qParam = searchParams.get('q') ?? '';

  const filtered = useMemo(
    () =>
      stock.filter((e) => {
        if (estadoParam && e.estado !== estadoParam) return false;
        if (ubicacionParam && e.ubicacion !== ubicacionParam) return false;
        if (antiguedadParam === 'alta' && e.diasEnStock <= 20) return false;
        if (antiguedadParam === 'baja' && e.diasEnStock > 20) return false;
        return matchesSearch([e.nombre, e.marca, e.modelo, e.serial, e.ubicacion], qParam);
      }),
    [stock, estadoParam, ubicacionParam, antiguedadParam, qParam],
  );

  const setParam = (key: string, value: string): void => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params, { replace: true });
  };

  const ubicaciones = useMemo(() => [...new Set(stock.map((e) => e.ubicacion))].sort(), [stock]);
  const valorTotal = filtered.reduce((acc, e) => acc + e.valor, 0);
  const AntiguedadMedia =
    filtered.length > 0
      ? Math.round(filtered.reduce((acc, e) => acc + e.diasEnStock, 0) / filtered.length)
      : 0;
  const enStock = stock.filter((e) => e.estado === 'en-stock').length;

  const meta = getPageMeta('/stock');

  return (
    <DataTable
      meta={meta}
      columns={stockColumns()}
      rows={filtered}
      rowKey={(e) => e.id}
      isLoading={equiposQuery.isLoading}
      emptyTitle="No hay equipos en stock con estos filtros"
      emptyDesc="Ajusta la antigüedad o la ubicación para ampliar la búsqueda."
      summary={[
        { label: 'Unidades en stock', value: String(stock.length), hint: `de ${todos.length} gestionadas` },
        { label: 'Disponibles', value: String(enStock), hint: 'listas para asignar' },
        { label: 'Antigüedad media', value: `${AntiguedadMedia} días` },
        { label: 'Valor en stock', value: formatCurrency(valorTotal) },
      ]}
      actions={
        <div className="filters filters--bare">
          <div className="filters__group">
            <label className="filters__label" htmlFor="q-stock">
              Buscar
            </label>
            <div className="search-field">
              <input
                id="q-stock"
                type="search"
                placeholder="Nombre, marca, serial…"
                value={qParam}
                onChange={(e) => setParam('q', e.target.value)}
              />
            </div>
          </div>
          <FilterSelect
            label="Estado"
            param="estado"
            placeholder="Todos"
            options={[
              { value: 'en-stock', label: 'En stock' },
              { value: 'en-resguardo', label: 'En resguardo' },
            ]}
          />
          <FilterSelect
            label="Ubicación"
            param="ubicacion"
            placeholder="Todas"
            options={ubicaciones.map((u) => ({ value: u, label: u }))}
          />
          <FilterSelect
            label="Antigüedad"
            param="antiguedad"
            placeholder="Cualquiera"
            options={[
              { value: 'baja', label: '≤ 20 días' },
              { value: 'alta', label: '> 20 días' },
            ]}
          />
          <ActiveFilterNote param="estado" />
        </div>
      }
    />
  );
}