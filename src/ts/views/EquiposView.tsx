import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Equipo, EstadoEquipo } from '@/models';
import { useEquipos, useFreelancers } from '@/hooks/queries';
import {
  ActiveFilterNote,
  DataTable,
  FilterSelect,
  equipoColumns,
} from '@/views/shared/DataTable';
import { getPageMeta } from '@/services/mock';
import { ESTADO_EQUIPO_LABEL, matchesSearch } from '@/utils/formatters';

export function EquiposView() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const equiposQuery = useEquipos();
  const freelancersQuery = useFreelancers();

  const equipos: Equipo[] = useMemo(() => equiposQuery.data ?? [], [equiposQuery.data]);
  const freelancers = freelancersQuery.data ?? [];

  const estadoParam = searchParams.get('estado');
  const tipoParam = searchParams.get('tipo');
  const ubicacionParam = searchParams.get('ubicacion');
  const qParam = searchParams.get('q') ?? '';

  const filtered = useMemo(
    () =>
      equipos.filter((e) => {
        if (estadoParam && e.estado !== estadoParam) return false;
        if (tipoParam && e.tipo !== tipoParam) return false;
        if (ubicacionParam && e.ubicacion !== ubicacionParam) return false;
        return matchesSearch([e.nombre, e.marca, e.modelo, e.serial, e.ubicacion], qParam);
      }),
    [equipos, estadoParam, tipoParam, ubicacionParam, qParam],
  );

  const setParam = (key: string, value: string): void => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params, { replace: true });
  };

  const tipos = useMemo(() => [...new Set(equipos.map((e) => e.tipo))].sort(), [equipos]);
  const ubicaciones = useMemo(() => [...new Set(equipos.map((e) => e.ubicacion))].sort(), [equipos]);

  const counts = useMemo(() => {
    const map = new Map<EstadoEquipo, number>([['asignado', 0], ['en-resguardo', 0], ['en-stock', 0]]);
    equipos.forEach((e) => map.set(e.estado, (map.get(e.estado) ?? 0) + 1));
    return map;
  }, [equipos]);

  const meta = getPageMeta('/equipos');

  return (
    <DataTable
      meta={meta}
      columns={equipoColumns(freelancers)}
      rows={filtered}
      rowKey={(e) => e.id}
      onRowClick={(e) => navigate(`/equipos/${e.id}`)}
      isLoading={equiposQuery.isLoading}
      emptyTitle="No hay equipos con estos filtros"
      emptyDesc="Prueba a quitar algún filtro o cambia el término de búsqueda."
      summary={[
        { label: 'Total equipos', value: String(equipos.length) },
        { label: 'Asignado', value: String(counts.get('asignado') ?? 0) },
        { label: 'En stock', value: String(counts.get('en-stock') ?? 0) },
        { label: 'En resguardo', value: String(counts.get('en-resguardo') ?? 0) },
      ]}
      actions={
        <div className="filters filters--bare">
          <div className="filters__group">
            <label className="filters__label" htmlFor="q-equipos">
              Buscar
            </label>
            <div className="search-field">
              <input
                id="q-equipos"
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
            options={(Object.keys(ESTADO_EQUIPO_LABEL) as EstadoEquipo[]).map((value) => ({
              value,
              label: `${ESTADO_EQUIPO_LABEL[value]} (${counts.get(value) ?? 0})`,
            }))}
          />
          <FilterSelect
            label="Tipo"
            param="tipo"
            placeholder="Todos"
            options={tipos.map((t) => ({ value: t, label: t }))}
          />
          <FilterSelect
            label="Ubicación"
            param="ubicacion"
            placeholder="Todas"
            options={ubicaciones.map((u) => ({ value: u, label: u }))}
          />
          <ActiveFilterNote param="estado" />
        </div>
      }
    />
  );
}