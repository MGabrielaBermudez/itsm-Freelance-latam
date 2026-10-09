import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Asignacion, EstadoAsignacion } from '@/models';
import { useAsignaciones, useEquipos, useFreelancers } from '@/hooks/queries';
import {
  ActiveFilterNote,
  DataTable,
  FilterSelect,
  asignacionColumns,
} from '@/views/shared/DataTable';
import { getPageMeta } from '@/services/mock';
import { formatCurrency, matchesSearch } from '@/utils/formatters';

const ESTADOS: EstadoAsignacion[] = ['activa', 'pausada', 'finalizada'];

export function AsignacionesView() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const asignacionesQuery = useAsignaciones();
  const equiposQuery = useEquipos();
  const freelancersQuery = useFreelancers();

  const asignaciones: Asignacion[] = useMemo(
    () => asignacionesQuery.data ?? [],
    [asignacionesQuery.data],
  );
  const equipos = equiposQuery.data ?? [];
  const freelancers = freelancersQuery.data ?? [];

  const estadoParam = searchParams.get('estado');
  const proyectoParam = searchParams.get('proyecto');
  const qParam = searchParams.get('q') ?? '';

  const filtered = useMemo(
    () =>
      asignaciones.filter((a) => {
        if (estadoParam && a.estado !== estadoParam) return false;
        if (proyectoParam && a.proyecto !== proyectoParam) return false;
        return matchesSearch([a.codigo, a.proyecto, a.estado], qParam);
      }),
    [asignaciones, estadoParam, proyectoParam, qParam],
  );

  const setParam = (key: string, value: string): void => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params, { replace: true });
  };

  const proyectos = useMemo(() => [...new Set(asignaciones.map((a) => a.proyecto))].sort(), [asignaciones]);

  const activas = asignaciones.filter((a) => a.estado === 'activa');
  const valorMensual = activas.reduce((acc, a) => acc + a.valorMensual, 0);
  const progresoMedio = activas.length
    ? Math.round(activas.reduce((acc, a) => acc + a.progreso, 0) / activas.length)
    : 0;

  const meta = getPageMeta('/asignaciones');

  return (
    <DataTable
      meta={meta}
      columns={asignacionColumns(equipos, freelancers)}
      rows={filtered}
      rowKey={(a) => a.id}
      onRowClick={(a) => navigate(`/asignaciones/${a.id}`)}
      isLoading={asignacionesQuery.isLoading}
      emptyTitle="No hay asignaciones con estos filtros"
      emptyDesc="Cambia el estado o el proyecto para ver más resultados."
      summary={[
        { label: 'Asignaciones activas', value: String(activas.length) },
        { label: 'Valor mensual', value: formatCurrency(valorMensual) },
        { label: 'Progreso medio', value: `${progresoMedio}%`, hint: 'sobre asignaciones activas' },
      ]}
      actions={
        <div className="filters filters--bare">
          <div className="filters__group">
            <label className="filters__label" htmlFor="q-asignaciones">
              Buscar
            </label>
            <div className="search-field">
              <input
                id="q-asignaciones"
                type="search"
                placeholder="Código o proyecto…"
                value={qParam}
                onChange={(e) => setParam('q', e.target.value)}
              />
            </div>
          </div>
          <FilterSelect
            label="Estado"
            param="estado"
            placeholder="Todos"
            options={ESTADOS.map((e) => ({ value: e, label: e }))}
          />
          <FilterSelect
            label="Proyecto"
            param="proyecto"
            placeholder="Todos"
            options={proyectos.map((p) => ({ value: p, label: p }))}
          />
          <ActiveFilterNote param="estado" />
        </div>
      }
    />
  );
}