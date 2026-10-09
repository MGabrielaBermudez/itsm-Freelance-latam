import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import type {
  Asignacion,
  Equipo,
  EstadoAsignacion,
  EstadoIncidente,
  EstadoOnboarding,
  Freelancer,
  Incidente,
  KpiKey,
  Onboarding,
  PageMeta,
  PrioridadIncidente,
} from '@/models';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { STAGGER, itemVariants, reducedVariants, staggerContainer } from '@/motion/presets';
import { SkeletonTable } from '@/components/Skeletons';
import { EmptyState } from '@/views/shared/EmptyState';
import { formatCurrency, formatDate, formatNumber, initials } from '@/utils/formatters';
import { Card } from '@/components/Card';

interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  width?: string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  meta: PageMeta;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  isLoading: boolean;
  emptyTitle: string;
  emptyDesc: string;
  /** Resumen numérico mostrado sobre la tabla. */
  summary?: Array<{ label: string; value: string; hint?: string }>;
  actions?: React.ReactNode;
}

export function DataTable<T>({
  meta,
  columns,
  rows,
  rowKey,
  onRowClick,
  isLoading,
  emptyTitle,
  emptyDesc,
  summary,
  actions,
}: DataTableProps<T>) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="page"
      variants={reduced ? reducedVariants : staggerContainer(STAGGER.base)}
      initial="hidden"
      animate="show"
    >
      <motion.header
        className="page-head"
        variants={reduced ? reducedVariants : itemVariants}
        id="page-title"
      >
        <div className="page-head__text">
          <nav className="breadcrumb" aria-label="Ruta de navegación">
            <a className="breadcrumb__item" href="/">
              Inicio
            </a>
            <span className="breadcrumb__sep" aria-hidden="true">
              /
            </span>
            <span className="breadcrumb__item is-current" aria-current="page">
              {meta.titulo}
            </span>
          </nav>
          <h1 className="page-head__title">{meta.titulo}</h1>
          <p className="page-head__desc">{meta.descripcion}</p>
        </div>
        {actions && <div className="page-head__tools">{actions}</div>}
      </motion.header>

      {summary && summary.length > 0 && (
        <motion.div className="summary-row" variants={reduced ? reducedVariants : itemVariants}>
          {summary.map((item) => (
            <div className="summary-tile" key={item.label}>
              <span className="summary-tile__label">{item.label}</span>
              <span className="summary-tile__value">{item.value}</span>
              {item.hint && <span className="summary-tile__hint">{item.hint}</span>}
            </div>
          ))}
        </motion.div>
      )}

      <motion.div variants={reduced ? reducedVariants : itemVariants}>
        <Card>
          {isLoading ? (
            <SkeletonTable rows={6} />
          ) : rows.length === 0 ? (
            <EmptyState title={emptyTitle} desc={emptyDesc} />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <caption className="sr-only">{meta.titulo}</caption>
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        style={{ width: col.width }}
                        className={col.align === 'right' ? 'table__num' : undefined}
                        scope="col"
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={rowKey(row)}
                      className={onRowClick ? 'link-row' : undefined}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      tabIndex={onRowClick ? 0 : undefined}
                      onKeyDown={
                        onRowClick
                          ? (e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onRowClick(row);
                              }
                            }
                          : undefined
                      }
                    >
                      {columns.map((col) => (
                        <td key={col.key} className={col.align === 'right' ? 'table__num' : undefined}>
                          {col.render(row)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}

/* ---------------- Helpers compartidos por las vistas ---------------- */

export function BadgeCell({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span className={`badge badge--${tone}`}>
      <span className="badge__dot" aria-hidden="true" />
      {children}
    </span>
  );
}

export function AvatarCell({ name, sub }: { name: string; sub?: string }) {
  return (
    <span className="cell-inline">
      <span className="avatar avatar--sm" aria-hidden="true">
        {initials(name)}
      </span>
      <span className="cell-main">
        <span className="cell-main__title">{name}</span>
        {sub && <span className="cell-main__sub">{sub}</span>}
      </span>
    </span>
  );
}

export function MeterCell({ value, max = 100, tone = 'primary' }: { value: number; max?: number; tone?: string }) {
  const reduced = useReducedMotion();
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <span className="meter-cell">
      <span className="meter" role="meter" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <motion.span
          className={`meter__fill b-${tone}`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: pct / 100 }}
          transition={reduced ? { duration: 0.01 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      </span>
      <span className="meter-cell__value">{Math.round(pct)}%</span>
    </span>
  );
}

/* ---------------- Selects de filtro ---------------- */

export interface FilterOption {
  value: string;
  label: string;
}

export function FilterSelect({
  label,
  param,
  options,
  placeholder,
}: {
  label: string;
  param: string;
  options: FilterOption[];
  placeholder: string;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(param) ?? '';

  const onChange = (next: string): void => {
    const params = new URLSearchParams(searchParams);
    if (next) params.set(param, next);
    else params.delete(param);
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="filters__group">
      <label className="filters__label" htmlFor={`filter-${param}`}>
        {label}
      </label>
      <select
        id={`filter-${param}`}
        className="select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ActiveFilterNote({ param }: { param: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(param);
  if (!value) return null;

  return (
    <button
      type="button"
      className="active-filter-note"
      onClick={() => {
        const params = new URLSearchParams(searchParams);
        params.delete(param);
        setSearchParams(params, { replace: true });
      }}
      aria-label={`Quitar filtro ${param} con valor ${value}`}
    >
      Filtro aplicado: <strong>{value}</strong> · quitar
    </button>
  );
}

/* ---------------- Fábricas de columnas ---------------- */

export function equipoColumns(freelancers: Freelancer[]): Column<Equipo>[] {
  const nombreDe = (id: string | null): string =>
    freelancers.find((f) => f.id === id)?.nombre ?? 'Sin asignar';

  return [
    {
      key: 'equipo',
      header: 'Equipo',
      render: (e: Equipo) => (
        <span className="cell-inline">
          <span className="avatar avatar--sm" aria-hidden="true">
            {e.marca.slice(0, 2).toUpperCase()}
          </span>
          <span className="cell-main">
            <span className="cell-main__title">{e.nombre}</span>
            <span className="cell-main__sub mono">{e.serial}</span>
          </span>
        </span>
      ),
    },
    {
      key: 'ubicacion',
      header: 'Ubicación',
      render: (e: Equipo) => e.ubicacion,
    },
    {
      key: 'responsable',
      header: 'Responsable',
      render: (e: Equipo) => nombreDe(e.freelancerId),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (e: Equipo) => (
        <BadgeCell tone={e.estado === 'asignado' ? 'success' : e.estado === 'en-stock' ? 'accent' : 'warning'}>
          {e.estado === 'asignado' ? 'Asignado' : e.estado === 'en-stock' ? 'En stock' : 'En resguardo'}
        </BadgeCell>
      ),
    },
    {
      key: 'dias',
      header: 'Días en stock',
      align: 'right',
      render: (e: Equipo) => formatNumber(e.diasEnStock),
    },
    {
      key: 'valor',
      header: 'Valor',
      align: 'right',
      render: (e: Equipo) => formatCurrency(e.valor),
    },
  ];
}

export function freelancerColumns(): Column<Freelancer>[] {
  return [
    {
      key: 'freelancer',
      header: 'Freelancer',
      render: (f: Freelancer) => <AvatarCell name={f.nombre} sub={f.email} />,
    },
    { key: 'especialidad', header: 'Especialidad', render: (f: Freelancer) => f.especialidad },
    {
      key: 'nivel',
      header: 'Nivel',
      render: (f: Freelancer) => <BadgeCell tone="neutral">{f.nivel}</BadgeCell>,
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (f: Freelancer) => (
        <BadgeCell tone={f.estado === 'activo' ? 'success' : f.estado === 'pausado' ? 'warning' : 'danger'}>
          {f.estado}
        </BadgeCell>
      ),
    },
    {
      key: 'disponibilidad',
      header: 'Disponibilidad',
      render: (f: Freelancer) => <MeterCell value={f.disponibilidad} tone="accent" />,
    },
    {
      key: 'tarifa',
      header: 'Tarifa/h',
      align: 'right',
      render: (f: Freelancer) => formatCurrency(f.tarifaHora),
    },
  ];
}

export function asignacionColumns(equipos: Equipo[], freelancers: Freelancer[]): Column<Asignacion>[] {
  const labelEstado = (e: EstadoAsignacion): string =>
    e === 'activa' ? 'Activa' : e === 'pausada' ? 'Pausada' : 'Finalizada';

  return [
    {
      key: 'codigo',
      header: 'Código',
      render: (a: Asignacion) => (
        <span className="cell-main">
          <span className="cell-main__title mono">{a.codigo}</span>
          <span className="cell-main__sub">{a.proyecto}</span>
        </span>
      ),
    },
    {
      key: 'freelancer',
      header: 'Freelancer',
      render: (a: Asignacion) => {
        const f = freelancers.find((x) => x.id === a.freelancerId);
        return f ? <AvatarCell name={f.nombre} sub={f.especialidad} /> : '—';
      },
    },
    {
      key: 'equipos',
      header: 'Equipos',
      render: (a: Asignacion) => {
        if (a.equipoIds.length === 0) return <span className="cell-main__sub">Sin equipo</span>;
        return (
          <span className="cell-main">
            <span className="cell-main__title">
              {a.equipoIds.length} equipo{a.equipoIds.length > 1 ? 's' : ''}
            </span>
            <span className="cell-main__sub">
              {a.equipoIds
                .map((id) => equipos.find((e) => e.id === id)?.nombre ?? id)
                .join(', ')}
            </span>
          </span>
        );
      },
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (a: Asignacion) => (
        <BadgeCell tone={a.estado === 'activa' ? 'success' : a.estado === 'pausada' ? 'warning' : 'navy'}>
          {labelEstado(a.estado)}
        </BadgeCell>
      ),
    },
    {
      key: 'progreso',
      header: 'Progreso',
      render: (a: Asignacion) => <MeterCell value={a.progreso} tone={a.estado === 'activa' ? 'success' : 'muted'} />,
    },
    {
      key: 'fin',
      header: 'Fin prevista',
      align: 'right',
      render: (a: Asignacion) => formatDate(a.finPrevista),
    },
    {
      key: 'valor',
      header: 'Valor/mes',
      align: 'right',
      render: (a: Asignacion) => formatCurrency(a.valorMensual),
    },
  ];
}

export function incidenteColumns(equipos: Equipo[], freelancers: Freelancer[]): Column<Incidente>[] {
  const tonoPrioridad: Record<PrioridadIncidente, string> = {
    critica: 'danger',
    alta: 'warning',
    media: 'accent',
    baja: 'success',
  };
  const tonoEstado: Record<EstadoIncidente, string> = {
    abierto: 'danger',
    'en-curso': 'accent',
    resuelto: 'success',
    cerrado: 'navy',
  };
  const labelPrioridad: Record<PrioridadIncidente, string> = {
    critica: 'Crítica',
    alta: 'Alta',
    media: 'Media',
    baja: 'Baja',
  };
  const labelEstado: Record<EstadoIncidente, string> = {
    abierto: 'Abierto',
    'en-curso': 'En curso',
    resuelto: 'Resuelto',
    cerrado: 'Cerrado',
  };

  return [
    {
      key: 'incidente',
      header: 'Incidencia',
      render: (i: Incidente) => (
        <span className="cell-main">
          <span className="cell-main__title">{i.titulo}</span>
          <span className="cell-main__sub mono">{i.codigo}</span>
        </span>
      ),
    },
    {
      key: 'prioridad',
      header: 'Prioridad',
      render: (i: Incidente) => <BadgeCell tone={tonoPrioridad[i.prioridad]}>{labelPrioridad[i.prioridad]}</BadgeCell>,
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (i: Incidente) => <BadgeCell tone={tonoEstado[i.estado]}>{labelEstado[i.estado]}</BadgeCell>,
    },
    {
      key: 'equipo',
      header: 'Equipo',
      render: (i: Incidente) => equipos.find((e) => e.id === i.equipoId)?.nombre ?? '—',
    },
    {
      key: 'asignado',
      header: 'Asignado a',
      render: (i: Incidente) => {
        const f = freelancers.find((x) => x.id === i.asignadoA);
        return f ? f.nombre : <span className="cell-main__sub">Sin asignar</span>;
      },
    },
    {
      key: 'sla',
      header: 'SLA',
      align: 'right',
      render: (i: Incidente) => `${i.slaHoras} h`,
    },
    {
      key: 'actualizado',
      header: 'Actualizado',
      align: 'right',
      render: (i: Incidente) => formatDate(i.actualizado),
    },
  ];
}

export function onboardingColumns(freelancers: Freelancer[]): Column<Onboarding>[] {
  const tono: Record<EstadoOnboarding, string> = {
    pendiente: 'warning',
    'en-curso': 'accent',
    completado: 'success',
  };
  const label: Record<EstadoOnboarding, string> = {
    pendiente: 'Pendiente',
    'en-curso': 'En curso',
    completado: 'Completado',
  };

  return [
    {
      key: 'onboarding',
      header: 'Persona',
      render: (o: Onboarding) => {
        const f = freelancers.find((x) => x.id === o.freelancerId);
        return f ? <AvatarCell name={f.nombre} sub={o.puesto} /> : '—';
      },
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (o: Onboarding) => <BadgeCell tone={tono[o.estado]}>{label[o.estado]}</BadgeCell>,
    },
    {
      key: 'pasos',
      header: 'Pasos',
      render: (o: Onboarding) => (
        <MeterCell value={o.pasosCompletados} max={o.pasosTotales} tone={o.estado === 'completado' ? 'success' : 'accent'} />
      ),
    },
    {
      key: 'inicio',
      header: 'Inicio',
      align: 'right',
      render: (o: Onboarding) => formatDate(o.inicio),
    },
  ];
}

export function stockColumns(): Column<Equipo>[] {
  return [
    {
      key: 'equipo',
      header: 'Equipo',
      render: (e: Equipo) => (
        <span className="cell-inline">
          <span className="avatar avatar--sm" aria-hidden="true">
            {e.marca.slice(0, 2).toUpperCase()}
          </span>
          <span className="cell-main">
            <span className="cell-main__title">{e.nombre}</span>
            <span className="cell-main__sub">{e.tipo}</span>
          </span>
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (e: Equipo) => (
        <BadgeCell tone={e.estado === 'en-stock' ? 'accent' : 'warning'}>
          {e.estado === 'en-stock' ? 'En stock' : 'En resguardo'}
        </BadgeCell>
      ),
    },
    { key: 'ubicacion', header: 'Ubicación', render: (e: Equipo) => e.ubicacion },
    {
      key: 'antiguedad',
      header: 'Antigüedad',
      align: 'right',
      render: (e: Equipo) => `${formatNumber(e.diasEnStock)} días`,
    },
    {
      key: 'rotacion',
      header: 'Rotación',
      render: (e: Equipo) => {
        return <MeterCell value={Math.max(e.diasEnStock, 1)} max={30} tone={e.diasEnStock > 20 ? 'danger' : 'primary'} />;
      },
    },
    {
      key: 'valor',
      header: 'Valor',
      align: 'right',
      render: (e: Equipo) => formatCurrency(e.valor),
    },
  ];
}

export const KPI_ROUTE: Record<KpiKey, string> = {
  equipos: '/equipos',
  freelancers: '/freelancers',
  asignaciones: '/asignaciones',
  incidentes: '/incidentes',
  onboarding: '/onboarding',
  stock: '/stock',
};

export function useFilteredRows<T>(rows: T[] | undefined, filters: Array<[string, string] | null>): T[] {
  return useMemo(() => {
    const active = filters.filter((f): f is [string, string] => !!f && f[1] !== '');
    if (!rows) return [];
    if (active.length === 0) return rows;
    return rows.filter((row) =>
      active.every(([key, value]) => String((row as Record<string, unknown>)[key] ?? '') === value),
    );
  }, [rows, filters]);
}