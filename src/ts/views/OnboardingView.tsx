import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { EstadoOnboarding, Onboarding } from '@/models';
import { useFreelancers, useOnboarding } from '@/hooks/queries';
import {
  ActiveFilterNote,
  DataTable,
  FilterSelect,
  onboardingColumns,
} from '@/views/shared/DataTable';
import { getPageMeta } from '@/services/mock';
import { matchesSearch } from '@/utils/formatters';

const ESTADOS: EstadoOnboarding[] = ['pendiente', 'en-curso', 'completado'];

export function OnboardingView() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const onboardingQuery = useOnboarding();
  const freelancersQuery = useFreelancers();

  const onboarding: Onboarding[] = useMemo(
    () => onboardingQuery.data ?? [],
    [onboardingQuery.data],
  );
  const freelancers = freelancersQuery.data ?? [];

  const estadoParam = searchParams.get('estado');
  const puestoParam = searchParams.get('puesto');
  const qParam = searchParams.get('q') ?? '';

  const nombreDe = (freelancerId: string): string =>
    freelancers.find((f) => f.id === freelancerId)?.nombre ?? '';

  const filtered = useMemo(
    () =>
      onboarding.filter((o) => {
        if (estadoParam && o.estado !== estadoParam) return false;
        if (puestoParam && o.puesto !== puestoParam) return false;
        return matchesSearch([o.puesto, o.estado, nombreDe(o.freelancerId)], qParam);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onboarding, freelancers, estadoParam, puestoParam, qParam],
  );

  const setParam = (key: string, value: string): void => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params, { replace: true });
  };

  const puestos = useMemo(() => [...new Set(onboarding.map((o) => o.puesto))].sort(), [onboarding]);

  const pendientes = onboarding.filter((o) => o.estado !== 'completado');
  const pasosTotales = onboarding.reduce((acc, o) => acc + o.pasosCompletados, 0);
  const pasosPrevistos = onboarding.reduce((acc, o) => acc + o.pasosTotales, 0);
  const avance = pasosPrevistos > 0 ? Math.round((pasosTotales / pasosPrevistos) * 100) : 0;

  const meta = getPageMeta('/onboarding');

  return (
    <DataTable
      meta={meta}
      columns={onboardingColumns(freelancers)}
      rows={filtered}
      rowKey={(o) => o.id}
      onRowClick={(o) => navigate(`/onboarding/${o.id}`)}
      isLoading={onboardingQuery.isLoading}
      emptyTitle="No hay procesos de onboarding con estos filtros"
      emptyDesc="Cambia el estado o el puesto para ver más resultados."
      summary={[
        { label: 'Pendientes', value: String(pendientes.length), hint: 'pendiente + en curso' },
        { label: 'Completados', value: String(onboarding.length - pendientes.length) },
        { label: 'Avance global', value: `${avance}%`, hint: `${pasosTotales}/${pasosPrevistos} pasos` },
      ]}
      actions={
        <div className="filters filters--bare">
          <div className="filters__group">
            <label className="filters__label" htmlFor="q-onboarding">
              Buscar
            </label>
            <div className="search-field">
              <input
                id="q-onboarding"
                type="search"
                placeholder="Persona o puesto…"
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
            label="Puesto"
            param="puesto"
            placeholder="Todos"
            options={puestos.map((p) => ({ value: p, label: p }))}
          />
          <ActiveFilterNote param="estado" />
        </div>
      }
    />
  );
}