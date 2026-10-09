import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { EstadoIncidente, Incidente, PrioridadIncidente } from '@/models';
import { useEquipos, useFreelancers, useIncidentes } from '@/hooks/queries';
import {
  ActiveFilterNote,
  DataTable,
  FilterSelect,
  incidenteColumns,
} from '@/views/shared/DataTable';
import { getPageMeta } from '@/services/mock';
import { PRIORIDAD_LABEL, PRIORIDAD_ORDER, matchesSearch } from '@/utils/formatters';

const ESTADOS: EstadoIncidente[] = ['abierto', 'en-curso', 'resuelto', 'cerrado'];

export function IncidentesView() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const incidentesQuery = useIncidentes();
  const equiposQuery = useEquipos();
  const freelancersQuery = useFreelancers();

  const incidentes: Incidente[] = useMemo(
    () => incidentesQuery.data ?? [],
    [incidentesQuery.data],
  );
  const equipos = equiposQuery.data ?? [];
  const freelancers = freelancersQuery.data ?? [];

  const prioridadParam = searchParams.get('prioridad');
  const estadoParam = searchParams.get('estado');
  const qParam = searchParams.get('q') ?? '';

  const filtered = useMemo(
    () =>
      incidentes.filter((i) => {
        if (prioridadParam && i.prioridad !== prioridadParam) return false;
        if (estadoParam && i.estado !== estadoParam) return false;
        return matchesSearch([i.codigo, i.titulo, i.descripcion, i.prioridad, i.estado], qParam);
      }),
    [incidentes, prioridadParam, estadoParam, qParam],
  );

  const setParam = (key: string, value: string): void => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params, { replace: true });
  };

  const counts = useMemo(() => {
    const map = new Map<PrioridadIncidente, number>([
      ['critica', 0],
      ['alta', 0],
      ['media', 0],
      ['baja', 0],
    ]);
    incidentes.forEach((i) => map.set(i.prioridad, (map.get(i.prioridad) ?? 0) + 1));
    return map;
  }, [incidentes]);

  const abiertos = incidentes.filter((i) => i.estado === 'abierto');
  const criticos = incidentes.filter((i) => i.prioridad === 'critica' && i.estado !== 'cerrado');
  const slaMedio = abiertos.length
    ? (abiertos.reduce((acc, i) => acc + i.slaHoras, 0) / abiertos.length).toFixed(1)
    : '0';

  const meta = getPageMeta('/incidentes');

  return (
    <DataTable
      meta={meta}
      columns={incidenteColumns(equipos, freelancers)}
      rows={filtered}
      rowKey={(i) => i.id}
      onRowClick={(i) => navigate(`/incidentes/${i.id}`)}
      isLoading={incidentesQuery.isLoading}
      emptyTitle="No hay incidencias con estos filtros"
      emptyDesc="Quita el filtro de prioridad o estado para ver el histórico completo."
      summary={[
        { label: 'Abiertas', value: String(abiertos.length) },
        { label: 'Críticas activas', value: String(criticos.length) },
        { label: 'SLA medio', value: `${slaMedio} h`, hint: 'sobre incidencias abiertas' },
      ]}
      actions={
        <div className="filters filters--bare">
          <div className="filters__group">
            <label className="filters__label" htmlFor="q-incidentes">
              Buscar
            </label>
            <div className="search-field">
              <input
                id="q-incidentes"
                type="search"
                placeholder="Código, título, descripción…"
                value={qParam}
                onChange={(e) => setParam('q', e.target.value)}
              />
            </div>
          </div>
          <FilterSelect
            label="Prioridad"
            param="prioridad"
            placeholder="Todas"
            options={PRIORIDAD_ORDER.map((p) => ({
              value: p,
              label: `${PRIORIDAD_LABEL[p]} (${counts.get(p) ?? 0})`,
            }))}
          />
          <FilterSelect
            label="Estado"
            param="estado"
            placeholder="Todos"
            options={ESTADOS.map((e) => ({ value: e, label: e }))}
          />
          <ActiveFilterNote param="prioridad" />
        </div>
      }
    />
  );
}