import { memo, useId, useMemo, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ResumenKpi } from '@/models';
import { useCountUp } from '@/hooks/useCountUp';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  SPRING,
  STAGGER,
  TWEEN,
  hoverLift,
  itemVariants,
  reducedVariants,
  staggerContainer,
  strokeTransition,
  tapPress,
} from '@/motion/presets';
import { formatNumber, trendDirection } from '@/utils/formatters';
import { Tooltip } from '@/components/Tooltip';
import { Skeleton } from '@/components/Skeletons';
import { breakdownColorClass } from '@/components/colorClasses';
import {
  IconAlert,
  IconArrowDown,
  IconArrowUp,
  IconBox,
  IconChevronDown,
  IconClipboard,
  IconLaptop,
  IconMinus,
  IconOnboarding,
  IconUsers,
} from '@/components/Icons';

const ICONS = {
  equipos: IconLaptop,
  freelancers: IconUsers,
  asignaciones: IconClipboard,
  incidentes: IconAlert,
  onboarding: IconOnboarding,
  stock: IconBox,
} as const;

/* Hex reales por indicador para el SVG (sin CSS vars ni rgba). */
const KPI_COLOR: Record<ResumenKpi['clave'], string> = {
  equipos: '#1d3fd6',
  freelancers: '#1db0f0',
  asignaciones: '#8b3dff',
  incidentes: '#e5484d',
  onboarding: '#0baa4b',
  stock: '#ffd60a',
};

const ROUTES = {
  equipos: '/equipos',
  freelancers: '/freelancers',
  asignaciones: '/asignaciones',
  incidentes: '/incidentes',
  onboarding: '/onboarding',
  stock: '/stock',
} as const;

/* ---------------- Sparkline con barrido de trazo ---------------- */

function Sparkline({ points, reduced, color }: { points: number[]; reduced: boolean; color: string }) {
  const width = 132;
  const height = 48;
  const pad = 2;
  const gradientId = `kpi-spark-${useId().replace(/:/g, '')}`;

  const { linePath, areaPath } = useMemo(() => {
    if (points.length < 2) return { linePath: '', areaPath: '' };
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = Math.max(max - min, 1);
    const stepX = (width - pad * 2) / (points.length - 1);
    const coords = points.map((p, i) => {
      const x = pad + i * stepX;
      const y = height - pad - ((p - min) / range) * (height - pad * 2);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });
    const line = `M${coords.join(' L')}`;
    return {
      linePath: line,
      areaPath: `${line} L${width - pad},${height} L${pad},${height} Z`,
    };
  }, [points]);

  if (!linePath) return null;

  return (
    <svg
      className="kpi__spark"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.22} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <motion.path
        className="kpi__spark-area"
        d={areaPath}
        fill={`url(#${gradientId})`}
        stroke="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...TWEEN.slow, delay: 0.2 }}
      />
      <motion.path
        className="kpi__spark-line"
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={reduced ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={reduced ? { duration: 0.01 } : strokeTransition}
      />
    </svg>
  );
}

/* ---------------- Tarjeta KPI ---------------- */

interface KpiCardProps {
  kpi: ResumenKpi;
  label: string;
  expanded: boolean;
  onToggleExpand: () => void;
  isLoading?: boolean;
}

function KpiCardBase({ kpi, label, expanded, onToggleExpand, isLoading = false }: KpiCardProps) {
  const reduced = useReducedMotion();
  const navigate = useNavigate();

  const Icon = ICONS[kpi.clave];
  const route = ROUTES[kpi.clave];

  const animatedValue = useCountUp({
    value: kpi.valor,
    enabled: !reduced && !isLoading,
    duration: 1.05,
  });
  const displayValue = isLoading ? 0 : reduced ? kpi.valor : animatedValue;

  const delta = kpi.valor - kpi.anterior;
  const direction = trendDirection(delta);
  const deltaPct = kpi.anterior === 0 ? 0 : Math.abs((delta / kpi.anterior) * 100);
  const maxBreakdown = Math.max(...kpi.desglose.map((d) => d.valor), 1);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter') {
      event.preventDefault();
      navigate(route);
    }
  };

  return (
    <motion.div
      layout="position"
      className={`kpi kpi--${kpi.clave}`}
      variants={reduced ? reducedVariants : itemVariants}
      initial="hidden"
      animate="show"
      exit="hidden"
      whileHover={reduced ? undefined : hoverLift}
      whileTap={reduced ? undefined : tapPress}
      onKeyDown={handleKeyDown}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest('[data-no-navigate]')) return;
        navigate(route);
      }}
      tabIndex={0}
      role="link"
      aria-label={`${label}: ${formatNumber(kpi.valor)} · ${
        direction === 'up' ? 'sube' : direction === 'down' ? 'baja' : 'estable'
      } ${deltaPct.toFixed(0)} por ciento. Ir a ${route}`}
      data-testid={`kpi-${kpi.clave}`}
    >
      <div className="kpi__main">
        <div className="kpi__left">
          <div className="kpi__head">
            <span className="kpi__icon" aria-hidden="true">
              <Icon width={17} height={17} />
            </span>
            <span className="kpi__label">{label}</span>
          </div>

          <div className="kpi__value-row">
            <span className="kpi__value">
              {isLoading ? <Skeleton width="64" height="26" radius="6" /> : formatNumber(displayValue)}
            </span>
            {!isLoading && (
              <Tooltip
                title="vs. periodo anterior"
                rows={[
                  { label: 'Actual', value: formatNumber(kpi.valor) },
                  { label: 'Anterior', value: formatNumber(kpi.anterior) },
                  { label: 'Variación', value: `${delta >= 0 ? '+' : '−'}${deltaPct.toFixed(0)}%` },
                ]}
              >
                <span className={`kpi__trend kpi__trend--${direction}`}>
                  {direction === 'up' ? (
                    <IconArrowUp />
                  ) : direction === 'down' ? (
                    <IconArrowDown />
                  ) : (
                    <IconMinus />
                  )}
                  {deltaPct.toFixed(0)}%
                </span>
              </Tooltip>
            )}
          </div>
        </div>

        <div className="kpi__right">
          <Sparkline points={kpi.serie} reduced={reduced} color={KPI_COLOR[kpi.clave]} />
        </div>
      </div>

      <button
        type="button"
        className="kpi__expand"
        data-no-navigate
        aria-expanded={expanded}
        aria-label={expanded ? `Contraer desglose de ${label}` : `Expandir desglose de ${label}`}
        onClick={(event) => {
          event.stopPropagation();
          onToggleExpand();
        }}
      >
        <IconChevronDown className="kpi__chevron" width={16} height={16} />
      </button>

      <AnimatePresence initial={false}>
        {expanded && !isLoading && (
          <motion.div
            key="kpi-breakdown"
            className="kpi__breakdown"
            initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={
              reduced
                ? { duration: 0.2 }
                : { ...SPRING.smooth, opacity: { duration: 0.24, ease: [0.22, 1, 0.36, 1] } }
            }
          >
            <motion.ul
              className="kpi__breakdown-list"
              variants={reduced ? reducedVariants : staggerContainer(STAGGER.tight)}
              initial="hidden"
              animate="show"
            >
              {kpi.desglose.map((item) => (
                <motion.li
                  key={item.id}
                  className="kpi__breakdown-item"
                  variants={reduced ? reducedVariants : itemVariants}
                >
                  <span className="kpi__breakdown-name">
                    <span className={`kpi__breakdown-dot ${breakdownColorClass(item.color)}`} />
                    {item.nombre}
                  </span>
                  <span className="kpi__breakdown-value">
                    <span className="kpi__bar">
                      <motion.span
                        className={`kpi__bar-fill ${breakdownColorClass(item.color)}`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: Math.max(item.valor / maxBreakdown, 0.04) }}
                        transition={reduced ? { duration: 0.01 } : SPRING.progress}
                      />
                    </span>
                    {formatNumber(item.valor)}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export const KpiCard = memo(KpiCardBase);
