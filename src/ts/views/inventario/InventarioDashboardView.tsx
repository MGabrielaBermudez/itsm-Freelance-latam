import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { EstadoInventario, InventarioItem } from '@/models';
import { useInventario, useInventarioResumen } from '@/hooks/queries';
import { useCountUp } from '@/hooks/useCountUp';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { EASE_OUT_EXPO, STAGGER, itemVariants, reducedVariants, staggerContainer } from '@/motion/presets';
import { getPageMeta } from '@/services/mock';
import { ESTADO_INVENTARIO_LABEL } from './inventarioUi';
import { formatCurrency, formatNumber, initials } from '@/utils/formatters';
import { Card } from '@/components/Card';
import { SkeletonsKpiGrid, SkeletonRows } from '@/components/Skeletons';
import { InventarioTabs } from './InventarioTabs';

/* ---------------- Datos auxiliares ---------------- */

const ESTADOS: EstadoInventario[] = ['en-stock', 'en-resguardo', 'asignado', 'en-mantenimiento', 'en-transito'];

/** Color de barra/dot por estado (clases definidas en /css). */
const ESTADO_BAR: Record<EstadoInventario, { dot: string; fill: string }> = {
  'en-stock': { dot: 'b-accent', fill: 'b-accent' },
  'en-resguardo': { dot: 'b-warning', fill: 'b-warning' },
  asignado: { dot: 'b-success', fill: 'b-success' },
  'en-mantenimiento': { dot: 'b-danger', fill: 'b-danger' },
  'en-transito': { dot: 'b-neutral', fill: 'b-neutral' },
};

/* Paleta rotativa para categorías, ubicaciones y países. */
const PALETA: string[] = ['b-accent', 'b-primary', 'b-success', 'b-warning', 'b-neutral'];

function colorDe(index: number): string {
  return PALETA[index % PALETA.length] ?? 'b-accent';
}

function agrupar(
  items: InventarioItem[],
  key: (i: InventarioItem) => string,
): Array<{ nombre: string; unidades: number; valor: number }> {
  const map = new Map<string, { unidades: number; valor: number }>();
  for (const item of items) {
    const k = key(item);
    const data = map.get(k) ?? { unidades: 0, valor: 0 };
    data.unidades += 1;
    data.valor += item.valor;
    map.set(k, data);
  }
  return [...map.entries()]
    .map(([nombre, data]) => ({ nombre, ...data }))
    .sort((a, b) => b.valor - a.valor);
}

/* ---------------- Piezas de UI del panel ---------------- */

interface KpiDef {
  clave: string;
  label: string;
  value: number;
  hint: string;
  dot: string;
  format?: (value: number) => string;
}

function KpiTile({ kpi }: { kpi: KpiDef }) {
  const reduced = useReducedMotion();
  const animated = useCountUp({ value: kpi.value, enabled: !reduced && kpi.value > 0, duration: 0.9 });
  const text = reduced ? kpi.value : animated;

  return (
    <div className="inv-kpi">
      <span className="inv-kpi__head">
        <span className={`inv-kpi__dot ${kpi.dot}`} aria-hidden="true" />
        <span className="inv-kpi__label">{kpi.label}</span>
      </span>
      <span className="inv-kpi__value">{kpi.format ? kpi.format(text) : formatNumber(text)}</span>
      <span className="inv-kpi__hint">{kpi.hint}</span>
    </div>
  );
}

interface BarRow {
  id: string;
  name: string;
  dot: string;
  fill: string;
  units: number;
  value?: number;
}

function BarList({ rows, metric = 'units' }: { rows: BarRow[]; metric?: 'units' | 'value' }) {
  const reduced = useReducedMotion();
  const totalUnits = rows.reduce((acc, r) => acc + r.units, 0);
  const max = Math.max(...rows.map((r) => (metric === 'value' ? (r.value ?? 0) : r.units)), 1);

  return (
    <div className="inv-bars">
      {rows.map((r) => {
        const size = metric === 'value' ? (r.value ?? 0) : r.units;
        const pct = totalUnits > 0 ? Math.round((r.units / totalUnits) * 100) : 0;
        return (
          <div className="inv-bar" key={r.id}>
            <div className="inv-bar__head">
              <span className="inv-bar__name">
                <span className={`inv-dot ${r.dot}`} aria-hidden="true" />
                {r.name}
              </span>
              <span className="inv-bar__values">
                <strong className="text-tabular">{formatNumber(r.units)}</strong>
                {r.value !== undefined && <span className="inv-bar__cur">{formatCurrency(r.value)}</span>}
                <span className="inv-bar__pct">{pct}%</span>
              </span>
            </div>
            <div className="inv-bar__track" role="presentation">
              <motion.span
                className={`inv-bar__fill ${r.fill}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: size / max }}
                transition={reduced ? { duration: 0.01 } : { duration: 0.7, ease: EASE_OUT_EXPO }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Vista ---------------- */

export function InventarioDashboardView() {
  const reduced = useReducedMotion();
  const { data: resumen } = useInventarioResumen();
  const { data: items, isLoading } = useInventario();

  const todos = useMemo(() => items ?? [], [items]);

  const meta = useMemo(() => getPageMeta('/inventario/dashboard'), []);

  const estadoRows = useMemo<BarRow[]>(() => {
    const conteo = new Map<EstadoInventario, number>(ESTADOS.map((e) => [e, 0]));
    for (const item of todos) conteo.set(item.estado, (conteo.get(item.estado) ?? 0) + 1);
    return ESTADOS.map((e) => ({
      id: e,
      name: ESTADO_INVENTARIO_LABEL[e],
      dot: ESTADO_BAR[e].dot,
      fill: ESTADO_BAR[e].fill,
      units: conteo.get(e) ?? 0,
    }));
  }, [todos]);

  const categoriaRows = useMemo<BarRow[]>(
    () =>
      agrupar(todos, (i) => i.categoria).map((r, index) => ({
        id: r.nombre,
        name: r.nombre,
        dot: colorDe(index),
        fill: colorDe(index),
        units: r.unidades,
        value: r.valor,
      })),
    [todos],
  );

  const ubicacionRows = useMemo<BarRow[]>(
    () =>
      agrupar(todos, (i) => i.ubicacion).map((r, index) => ({
        id: r.nombre,
        name: r.nombre,
        dot: colorDe(index),
        fill: colorDe(index),
        units: r.unidades,
      })),
    [todos],
  );

  const paisRows = useMemo<BarRow[]>(
    () =>
      agrupar(todos, (i) => i.pais).map((r, index) => ({
        id: r.nombre,
        name: r.nombre,
        dot: colorDe(index),
        fill: colorDe(index),
        units: r.unidades,
        value: r.valor,
      })),
    [todos],
  );

  const antiguos = useMemo(
    () => todos.slice().sort((a, b) => b.diasEnUbicacion - a.diasEnUbicacion).slice(0, 5),
    [todos],
  );

  const kpis: KpiDef[] = [
    {
      clave: 'total',
      label: 'Unidades gestionadas',
      value: resumen?.total ?? 0,
      hint: 'activo total',
      dot: 'b-accent',
    },
    {
      clave: 'valor',
      label: 'Valor total',
      value: resumen?.valorTotal ?? 0,
      hint: 'costo del activo',
      dot: 'b-primary',
      format: (v) => formatCurrency(v),
    },
    {
      clave: 'disponibles',
      label: 'Disponibles',
      value: resumen?.disponibles ?? 0,
      hint: 'listas para asignar',
      dot: 'b-success',
    },
    {
      clave: 'resguardo',
      label: 'En resguardo',
      value: resumen?.enResguardo ?? 0,
      hint: 'en custodia',
      dot: 'b-warning',
    },
    {
      clave: 'asignados',
      label: 'Asignados',
      value: resumen?.asignados ?? 0,
      hint: 'en manos de personal',
      dot: 'b-primary',
    },
    {
      clave: 'mantenimiento',
      label: 'En mantenimiento',
      value: resumen?.enMantenimiento ?? 0,
      hint: 'fuera de operación',
      dot: 'b-danger',
    },
  ];

  const resumenTiles: Array<{ label: string; value: string; hint: string }> = [
    { label: 'Unidades gestionadas', value: formatNumber(resumen?.total ?? todos.length), hint: 'activo total' },
    { label: 'Disponibles', value: formatNumber(resumen?.disponibles ?? 0), hint: 'listas para asignar' },
    { label: 'En resguardo', value: formatNumber(resumen?.enResguardo ?? 0), hint: 'en custodia' },
    { label: 'Valor total', value: formatCurrency(resumen?.valorTotal ?? 0), hint: 'costo del activo' },
  ];

  return (
    <motion.div
      className="page inv-page"
      variants={reduced ? reducedVariants : staggerContainer(STAGGER.base)}
      initial="hidden"
      animate="show"
    >
      <motion.header className="page-head" variants={reduced ? reducedVariants : itemVariants}>
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
      </motion.header>

      <motion.div variants={reduced ? reducedVariants : itemVariants}>
        <InventarioTabs
          counters={{
            '/inventario': resumen?.total ?? todos.length,
            '/inventario/resguardo': resumen?.enResguardo ?? 0,
          }}
        />
      </motion.div>

      <motion.div className="summary-row" variants={reduced ? reducedVariants : itemVariants}>
        {resumenTiles.map((tile) => (
          <div className="summary-tile" key={tile.label}>
            <span className="summary-tile__label">{tile.label}</span>
            <span className="summary-tile__value">{tile.value}</span>
            <span className="summary-tile__hint">{tile.hint}</span>
          </div>
        ))}
      </motion.div>

      <motion.section
        className="inv-dash__section"
        aria-labelledby="inv-kpis-title"
        variants={reduced ? reducedVariants : itemVariants}
      >
        <h3 className="inv-dash__section-title" id="inv-kpis-title">
          Indicadores clave
        </h3>
        {isLoading ? (
          <SkeletonsKpiGrid />
        ) : (
          <div className="grid grid--kpi">
            {kpis.map((kpi) => (
              <KpiTile key={kpi.clave} kpi={kpi} />
            ))}
          </div>
        )}
      </motion.section>

      <div className="grid grid--charts">
        <Card
          enter
          className="grid__span-5"
          title="Composición por estado"
          subtitle="Distribución del activo según su estado"
        >
          {isLoading ? <SkeletonRows rows={5} /> : <BarList rows={estadoRows} />}
        </Card>

        <Card
          enter
          className="grid__span-7"
          title="Composición por categoría"
          subtitle="Unidades y valor por tipo de equipo"
        >
          {isLoading ? <SkeletonRows rows={5} /> : <BarList rows={categoriaRows} metric="value" />}
        </Card>
      </div>

      <div className="grid grid--halves">
        <Card
          enter
          className="grid__span-5"
          title="Distribución por ubicación"
          subtitle="Dónde está el material hoy"
        >
          {isLoading ? <SkeletonRows rows={5} /> : <BarList rows={ubicacionRows} />}
        </Card>

        <Card
          enter
          className="grid__span-7"
          title="Valor por país"
          subtitle="Exposición del activo por país"
        >
          {isLoading ? <SkeletonRows rows={5} /> : <BarList rows={paisRows} metric="value" />}
        </Card>
      </div>

      <Card enter title="Activos más antiguos" subtitle="Rotación: los equipos que más llevan en su ubicación">
        {isLoading ? (
          <SkeletonRows rows={5} />
        ) : (
          <ul className="inv-ancients">
            {antiguos.map((item) => (
              <li className="inv-ancient" key={item.id}>
                <span className="avatar avatar--sm" aria-hidden="true">
                  {initials(item.nombre)}
                </span>
                <span className="cell-main">
                  <span className="cell-main__title">{item.nombre}</span>
                  <span className="cell-main__sub mono">{item.codigo} · {item.ubicacion}</span>
                </span>
                <span className="badge badge--warning text-tabular">{formatNumber(item.diasEnUbicacion)} días</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </motion.div>
  );
}