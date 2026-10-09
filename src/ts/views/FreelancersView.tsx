import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Freelancer } from '@/models';
import { useFreelancers } from '@/hooks/queries';
import {
  ActiveFilterNote,
  DataTable,
  FilterSelect,
  freelancerColumns,
} from '@/views/shared/DataTable';
import { getPageMeta } from '@/services/mock';
import { formatCurrency, matchesSearch } from '@/utils/formatters';

const NIVELES = ['junior', 'mid', 'senior'] as const;
const ESTADOS = ['activo', 'pausado', 'inactivo'] as const;

export function FreelancersView() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useFreelancers();

  const freelancers: Freelancer[] = useMemo(() => query.data ?? [], [query.data]);

  const nivelParam = searchParams.get('nivel');
  const estadoParam = searchParams.get('estado');
  const espParam = searchParams.get('especialidad');
  const qParam = searchParams.get('q') ?? '';

  const filtered = useMemo(
    () =>
      freelancers.filter((f) => {
        if (nivelParam && f.nivel !== nivelParam) return false;
        if (estadoParam && f.estado !== estadoParam) return false;
        if (espParam && f.especialidad !== espParam) return false;
        return matchesSearch([f.nombre, f.email, f.especialidad, f.nivel], qParam);
      }),
    [freelancers, nivelParam, estadoParam, espParam, qParam],
  );

  const setParam = (key: string, value: string): void => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params, { replace: true });
  };

  const especialidades = useMemo(
    () => [...new Set(freelancers.map((f) => f.especialidad))].sort(),
    [freelancers],
  );

  const disponibles = freelancers.filter((f) => f.estado === 'activo');
  const valorHoraMedio = disponibles.length
    ? disponibles.reduce((acc, f) => acc + f.tarifaHora, 0) / disponibles.length
    : 0;
  const valoracionMedia = disponibles.length
    ? disponibles.reduce((acc, f) => acc + f.valoracion, 0) / disponibles.length
    : 0;

  const meta = getPageMeta('/freelancers');

  return (
    <DataTable
      meta={meta}
      columns={freelancerColumns()}
      rows={filtered}
      rowKey={(f) => f.id}
      onRowClick={() => navigate('/freelancers')}
      isLoading={query.isLoading}
      emptyTitle="No hay freelancers con estos filtros"
      emptyDesc="Cambia el nivel, el estado o el término de búsqueda para ampliar resultados."
      summary={[
        { label: 'Total', value: String(freelancers.length) },
        { label: 'Activos', value: String(disponibles.length) },
        { label: 'Tarifa media/h', value: formatCurrency(valorHoraMedio) },
        { label: 'Valoración media', value: `${valoracionMedia.toFixed(1)} / 5` },
      ]}
      actions={
        <div className="filters filters--bare">
          <div className="filters__group">
            <label className="filters__label" htmlFor="q-freelancers">
              Buscar
            </label>
            <div className="search-field">
              <input
                id="q-freelancers"
                type="search"
                placeholder="Nombre o email…"
                value={qParam}
                onChange={(e) => setParam('q', e.target.value)}
              />
            </div>
          </div>
          <FilterSelect
            label="Nivel"
            param="nivel"
            placeholder="Todos"
            options={NIVELES.map((n) => ({ value: n, label: n }))}
          />
          <FilterSelect
            label="Estado"
            param="estado"
            placeholder="Todos"
            options={ESTADOS.map((e) => ({ value: e, label: e }))}
          />
          <FilterSelect
            label="Especialidad"
            param="especialidad"
            placeholder="Todas"
            options={especialidades.map((e) => ({ value: e, label: e }))}
          />
          <ActiveFilterNote param="estado" />
        </div>
      }
    />
  );
}