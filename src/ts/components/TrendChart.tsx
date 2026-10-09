import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Periodo, TendenciaDia } from '@/models';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SPRING } from '@/motion/presets';
import { formatNumber } from '@/utils/formatters';
import { AXIS_TEXT, CURSOR_FILL, GRID_CURSOR } from '@/components/chartTokens';
import { Card } from '@/components/Card';

export const PERIODOS: Periodo[] = [7, 30, 90];

type Serie = 'abiertos' | 'resueltos';

interface TrendChartProps {
  data: TendenciaDia[];
  periodo: Periodo;
  onPeriodoChange: (periodo: Periodo) => void;
  isLoading?: boolean;
  className?: string;
}

const SERIES: Array<{ key: Serie; label: string; fill: string; bgClass: string }> = [
  { key: 'abiertos', label: 'Abiertos', fill: 'var(--color-primary)', bgClass: 'b-primary' },
  { key: 'resueltos', label: 'Resueltos', fill: 'var(--color-accent)', bgClass: 'b-accent' },
];

/** Agrupa la serie para evitar saturación: 7d por día, 30d por 3 días, 90d por semana. */
function agrupar(data: TendenciaDia[], periodo: Periodo): TendenciaDia[] {
  if (periodo === 7) return data.slice(-7);
  const size = periodo === 30 ? 3 : 7;
  const slice = data.slice(-periodo);
  const buckets: TendenciaDia[] = [];
  for (let i = 0; i < slice.length; i += size) {
    const chunk = slice.slice(i, i + size);
    const first = chunk[0];
    const last = chunk[chunk.length - 1];
    if (!first || !last) continue;
    buckets.push({
      fecha: first.fecha,
      fechaFin: last.fecha,
      etiqueta: first.etiqueta,
      abiertos: chunk.reduce((acc, d) => acc + d.abiertos, 0),
      resueltos: chunk.reduce((acc, d) => acc + d.resueltos, 0),
    });
  }
  return buckets;
}

function PeriodSelector({
  periodo,
  onPeriodoChange,
  reduced,
}: {
  periodo: Periodo;
  onPeriodoChange: (periodo: Periodo) => void;
  reduced: boolean;
}) {
  return (
    <div className="segmented" role="group" aria-label="Seleccionar periodo">
      {PERIODOS.map((p) => {
        const isActive = p === periodo;
        return (
          <button
            key={p}
            type="button"
            className={`segmented__btn${isActive ? ' is-active' : ''}`}
            aria-pressed={isActive}
            onClick={() => onPeriodoChange(p)}
          >
            {p} d
          </button>
        );
      })}
      <motion.span
        className="segmented__thumb"
        aria-hidden="true"
        initial={false}
        animate={{
          x: `calc(${PERIODOS.indexOf(periodo)} * 100%)`,
          width: `calc((100% - 6px) / ${PERIODOS.length})`,
        }}
        transition={reduced ? { duration: 0.01 } : SPRING.smooth}
      />
    </div>
  );
}

/**
 * Tendencia de incidentes (Abiertos vs Resueltos) en 7/30/90 días.
 * - agrupación para no saturar (7d día, 30d cada 3 días, 90d semana)
 * - clic en una barra → /incidentes?estado=<serie>&fecha=<fecha>
 */
export function TrendChart({
  data,
  periodo,
  onPeriodoChange,
  isLoading = false,
  className,
}: TrendChartProps) {
  const reduced = useReducedMotion();
  const navigate = useNavigate();

  const visible = useMemo(() => agrupar(data, periodo), [data, periodo]);

  const totalAbiertos = visible.reduce((acc, d) => acc + d.abiertos, 0);
  const totalResueltos = visible.reduce((acc, d) => acc + d.resueltos, 0);

  const goTo = (serie: Serie, item?: TendenciaDia): void => {
    const query = new URLSearchParams({ estado: serie });
    if (item) {
      query.set('fecha', item.fechaFin ? `${item.fecha},${item.fechaFin}` : item.fecha);
    }
    navigate(`/incidentes?${query.toString()}`);
  };

  return (
    <Card
      enter
      className={className}
      title="Tendencia de incidentes"
      subtitle={`${formatNumber(totalAbiertos)} abiertos · ${formatNumber(totalResueltos)} resueltos`}
      actions={
        <PeriodSelector periodo={periodo} onPeriodoChange={onPeriodoChange} reduced={reduced} />
      }
    >
      <div className={`trend-chart${isLoading ? ' is-loading' : ''}`} aria-busy={isLoading}>
        <div
          className="trend-chart__plot"
          role="img"
          aria-label={`Incidentes abiertos y resueltos en ${periodo} días: ${formatNumber(
            totalAbiertos,
          )} abiertos, ${formatNumber(totalResueltos)} resueltos`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RBarChart data={visible} margin={{ top: 8, right: 8, bottom: 0, left: -18 }} barGap={2} barCategoryGap="30%">
              <CartesianGrid stroke={GRID_CURSOR} vertical={false} strokeDasharray="3 4" />
              <XAxis
                dataKey="etiqueta"
                tickLine={false}
                axisLine={false}
                minTickGap={18}
                tick={{ fill: AXIS_TEXT, fontSize: 11, fontWeight: 600 }}
                dy={6}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={32}
                tick={{ fill: AXIS_TEXT, fontSize: 11 }}
              />
              <RTooltip
                cursor={{ fill: CURSOR_FILL, radius: 4 }}
                wrapperStyle={{ outline: 'none' }}
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  return (
                    <div className="chart-tip">
                      <p className="tooltip__title">{label}</p>
                      <div className="tooltip__rows">
                        {SERIES.map((serie) => {
                          const value = payload.find((p) => p.dataKey === serie.key)?.value ?? 0;
                          return (
                            <div key={serie.key} className="tooltip__row">
                              <span>{serie.label}</span>
                              <strong>{formatNumber(Number(value))}</strong>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }}
              />
              {SERIES.map((serie) => (
                <Bar
                  key={serie.key}
                  dataKey={serie.key}
                  fill={serie.fill}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={14}
                  isAnimationActive={!reduced}
                  animationDuration={reduced ? 0 : 620}
                  animationEasing="ease-out"
                  onClick={(entry: unknown) => goTo(serie.key, entry as TendenciaDia | undefined)}
                />
              ))}
            </RBarChart>
          </ResponsiveContainer>
        </div>

        <ul className="trend-chart__legend" aria-label="Series de la tendencia">
          {SERIES.map((serie) => (
            <li key={serie.key}>
              <button
                type="button"
                className="trend-chart__legend-item"
                disabled={isLoading}
                onClick={() => goTo(serie.key)}
              >
                <span className={`trend-chart__legend-swatch ${serie.bgClass}`} aria-hidden="true" />
                <span className="trend-chart__legend-name">{serie.label}</span>
                <span className="trend-chart__legend-value">
                  {isLoading
                    ? '—'
                    : formatNumber(serie.key === 'abiertos' ? totalAbiertos : totalResueltos)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
