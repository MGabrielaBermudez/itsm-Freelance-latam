import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { EstadoOperativo } from '@/models';
import { useCountUp } from '@/hooks/useCountUp';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SPRING, STAGGER } from '@/motion/presets';
import { formatNumber, percentOf } from '@/utils/formatters';

interface StatusInv {
  id: 'enStock' | 'asignado';
  nombre: string;
  colorClass: string;
  ruta: string;
}

const INVENTARIO: StatusInv[] = [
  { id: 'enStock', nombre: 'En stock', colorClass: 'b-accent', ruta: '/stock' },
  { id: 'asignado', nombre: 'Asignados', colorClass: 'b-primary', ruta: '/asignaciones' },
];

const DETALLE = [
  { id: 'asignado', nombre: 'Asignado', colorClass: 'b-primary' },
  { id: 'enResguardo', nombre: 'En resguardo', colorClass: 'b-neutral' },
  { id: 'enStock', nombre: 'En stock', colorClass: 'b-accent' },
] as const;

function StatusBox({
  item,
  valor,
  isLoading,
}: {
  item: StatusInv;
  valor: number;
  isLoading: boolean;
}) {
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const animated = useCountUp({
    value: valor,
    enabled: !reduced && !isLoading,
    duration: 0.95,
  });
  const shown = isLoading ? 0 : reduced ? valor : animated;

  return (
    <button
      type="button"
      className="status-box"
      onClick={() => navigate(item.ruta)}
      aria-label={`${item.nombre}: ${valor} equipos. Ver detalle`}
    >
      <span className={`status-box__dot ${item.colorClass}`} aria-hidden="true" />
      <span className="status-box__value">{formatNumber(shown)}</span>
      <span className="status-box__label">{item.nombre}</span>
    </button>
  );
}

/**
 * Estado operativo: porcentaje de equipos operativos con barra de progreso,
 * dos cajas (En stock / Asignados) y el desglose por estado.
 */
export function StatusBar({ data, isLoading = false }: { data: EstadoOperativo; isLoading?: boolean }) {
  const reduced = useReducedMotion();
  const operativoPct = percentOf(data.asignado, data.total);

  return (
    <div className="status-bar-card">
      <div className="status-bar-card__head">
        <span className="status-bar-card__label">Equipos operativos</span>
        <span className="badge badge--navy">
          <span className="badge__dot" />
          {isLoading ? 0 : Math.round(operativoPct)}%
        </span>
      </div>

      <div
        className="status-bar__track"
        role="progressbar"
        aria-label="Porcentaje de equipos operativos"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(operativoPct)}
      >
        <motion.span
          className="status-bar__fill"
          initial={reduced ? { scaleX: operativoPct / 100 } : { scaleX: 0 }}
          animate={{ scaleX: isLoading ? 0 : operativoPct / 100 }}
          transition={reduced ? { duration: 0.18 } : SPRING.progress}
        />
      </div>

      <div className="status-bar-card__boxes">
        {INVENTARIO.map((item, index) => (
          <motion.div
            key={item.id}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0.18 } : { ...SPRING.gentle, delay: STAGGER.base * index }}
          >
            <StatusBox item={item} valor={data[item.id]} isLoading={isLoading} />
          </motion.div>
        ))}
      </div>

      <ul className="status-bar-card__list">
        {DETALLE.map((row) => (
          <li key={row.id} className="status-row">
            <span className={`status-row__dot ${row.colorClass}`} aria-hidden="true" />
            <span className="status-row__name">{row.nombre}</span>
            <span className="status-row__value">{formatNumber(data[row.id])}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
