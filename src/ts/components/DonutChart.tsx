import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from 'recharts';
import type { SectorProps } from 'recharts';
import type { DistribucionEstado, EstadoEquipo } from '@/models';
import { useCountUp } from '@/hooks/useCountUp';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SPRING, TWEEN } from '@/motion/presets';
import { ESTADO_EQUIPO_LABEL, formatNumber, percentOf, sum } from '@/utils/formatters';
import { ESTADO_COLOR_CLASS, ESTADO_FILL_CLASS } from '@/components/colorClasses';

interface SegmentDatum extends DistribucionEstado {
  visible: boolean;
  fillClass: string;
  bgClass: string;
  label: string;
}

type ActiveSectorProps = SectorProps & {
  active?: boolean;
  index?: number;
};

function ActiveSector({ active = false, outerRadius, ...rest }: ActiveSectorProps) {
  const reduced = useReducedMotion();
  const grown = typeof outerRadius === 'number' ? outerRadius * (active && !reduced ? 1.04 : 1) : outerRadius;

  return (
    <motion.g
      className="donut__sector"
      animate={{ scale: active && !reduced ? 1 : 0.985 }}
      transition={reduced ? { duration: 0.14 } : SPRING.snappy}
    >
      <Sector {...rest} outerRadius={grown} />
    </motion.g>
  );
}

interface DonutChartProps {
  data: DistribucionEstado[];
  isLoading?: boolean;
}

/**
 * Dona de equipos por estado (disposición horizontal):
 * - dona fija a la izquierda, leyenda compacta a la derecha
 * - clic en la fila o el segmento → /equipos?estado=<estado>
 * - clic en el punto → oculta/muestra el estado
 */
export function DonutChart({ data, isLoading = false }: DonutChartProps) {
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const [hidden, setHidden] = useState<Set<EstadoEquipo>>(() => new Set());
  const [hovered, setHovered] = useState<number | null>(null);

  const segments = useMemo<SegmentDatum[]>(
    () =>
      data.map((d) => ({
        ...d,
        visible: !hidden.has(d.estado),
        fillClass: ESTADO_FILL_CLASS[d.estado],
        bgClass: ESTADO_COLOR_CLASS[d.estado],
        label: ESTADO_EQUIPO_LABEL[d.estado],
      })),
    [data, hidden],
  );

  const visibleSegments = useMemo(() => segments.filter((s) => s.visible), [segments]);
  const totalVisible = useMemo(() => sum(visibleSegments.map((s) => s.valor)), [visibleSegments]);
  const totalAll = useMemo(() => sum(data.map((d) => d.valor)), [data]);

  const animatedTotal = useCountUp({
    value: totalVisible,
    enabled: !reduced && !isLoading,
    duration: 0.9,
  });

  const activeIndex = hovered !== null && visibleSegments[hovered] ? hovered : -1;
  const activeSegment = activeIndex >= 0 ? visibleSegments[activeIndex] : undefined;

  const toggleEstado = useCallback((estado: EstadoEquipo) => {
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(estado)) next.delete(estado);
      else next.add(estado);
      return next;
    });
  }, []);

  const ariaLabel = `Gráfico de donut: equipos por estado. ${data
    .map((d) => `${ESTADO_EQUIPO_LABEL[d.estado]}: ${d.valor}, ${Math.round(percentOf(d.valor, totalAll))} por ciento`)
    .join('. ')}.`;

  return (
    <div className="donut">
      <div className="donut__chart" role="img" aria-label={ariaLabel}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <Pie
              data={[{ name: 'track', valor: 1 }]}
              dataKey="valor"
              cx="50%"
              cy="50%"
              innerRadius="68%"
              outerRadius="94%"
              startAngle={90}
              endAngle={-270}
              fill="none"
              stroke="none"
              isAnimationActive={false}
              className="donut__track-pie"
            >
              <Cell className="c-track" />
            </Pie>
            <Pie
              data={visibleSegments}
              dataKey="valor"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius="68%"
              outerRadius="94%"
              startAngle={90}
              endAngle={-270}
              paddingAngle={visibleSegments.length > 1 ? 2 : 0}
              cornerRadius={4}
              stroke="none"
              activeIndex={activeIndex}
              activeShape={ActiveSector}
              isAnimationActive={!reduced}
              animationDuration={reduced ? 0 : 820}
              animationEasing="ease-out"
              onMouseEnter={(_: unknown, index: number) => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
              onClick={(_: unknown, index: number) => {
                const target = visibleSegments[index];
                if (target) navigate(`/equipos?estado=${target.estado}`);
              }}
            >
              {visibleSegments.map((entry, index) => (
                <Cell
                  key={entry.estado}
                  className={entry.fillClass}
                  fillOpacity={activeIndex === -1 || activeIndex === index ? 1 : 0.28}
                  cursor="pointer"
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="donut__center" aria-hidden="true">
          <span className="donut__center-value">
            {formatNumber(isLoading ? 0 : reduced ? totalVisible : animatedTotal)}
          </span>
          <span className="donut__center-label">{hidden.size > 0 ? 'mostrados' : 'equipos'}</span>
        </div>
      </div>

      {activeSegment && (
        <div className="donut__tip chart-tip" role="tooltip">
          <p className="tooltip__title">{activeSegment.label}</p>
          <div className="tooltip__rows">
            <div className="tooltip__row">
              <span>Equipos</span>
              <strong>{formatNumber(activeSegment.valor)}</strong>
            </div>
            <div className="tooltip__row">
              <span>Porcentaje</span>
              <strong>{percentOf(activeSegment.valor, totalVisible).toFixed(1)}%</strong>
            </div>
            <div className="tooltip__row">
              <span>Acción</span>
              <strong>Ver equipos</strong>
            </div>
          </div>
        </div>
      )}

      <ul className="donut__legend" aria-label="Leyenda de estados">
        {segments.map((entry) => {
          const legendIndex = visibleSegments.findIndex((s) => s.estado === entry.estado);
          const isHidden = !entry.visible;
          const isActive = !isHidden && legendIndex >= 0 && legendIndex === activeIndex;
          return (
            <li key={entry.estado} className={`donut__legend-item${isHidden ? ' is-muted' : ''}`}>
              <button
                type="button"
                className="donut__legend-swatch-btn"
                aria-pressed={!isHidden}
                aria-label={isHidden ? `Mostrar ${entry.label}` : `Ocultar ${entry.label}`}
                onClick={() => toggleEstado(entry.estado)}
              >
                <motion.span
                  className={`donut__legend-swatch ${entry.bgClass}`}
                  animate={{ scale: isActive ? 1.2 : 1 }}
                  transition={reduced ? { duration: 0.01 } : SPRING.snappy}
                />
              </button>
              <button
                type="button"
                className="donut__legend-main"
                onMouseEnter={() => !isHidden && setHovered(legendIndex)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => !isHidden && setHovered(legendIndex)}
                onBlur={() => setHovered(null)}
                onClick={() => navigate(`/equipos?estado=${entry.estado}`)}
              >
                <span className="donut__legend-name">{entry.label}</span>
                <span className="donut__legend-count">{formatNumber(entry.valor)}</span>
                <span className="donut__legend-pct">
                  {isHidden ? '—' : `${percentOf(entry.valor, totalVisible).toFixed(0)}%`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <AnimatePresence initial={false}>
        {hidden.size > 0 && (
          <motion.div
            className="donut__hidden-strip"
            initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={reduced ? { duration: 0.2 } : TWEEN.base}
          >
            <span className="donut__hidden-label">Ocultos:</span>
            {[...hidden].map((estado) => (
              <button
                key={estado}
                type="button"
                className="donut__hidden-chip"
                onClick={() => toggleEstado(estado)}
              >
                {ESTADO_EQUIPO_LABEL[estado]} · mostrar
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
