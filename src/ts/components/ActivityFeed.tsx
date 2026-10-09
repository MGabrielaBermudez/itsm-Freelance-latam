import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Actividad, TipoActividad } from '@/models';
import { useLiveActivity } from '@/hooks/useLiveActivity';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { TWEEN, listItemVariants, reducedVariants } from '@/motion/presets';
import { TIPO_ACTIVIDAD_LABEL, formatRelativeTime } from '@/utils/formatters';
import { generateLiveActivity } from '@/services/mock';
import {
  IconAlert,
  IconClipboard,
  IconOnboarding,
  IconSwap,
} from '@/components/Icons';
import { Tooltip } from '@/components/Tooltip';

const ICONOS: Record<TipoActividad, typeof IconAlert> = {
  asignacion: IconClipboard,
  incidente: IconAlert,
  onboarding: IconOnboarding,
  devolucion: IconSwap,
};

const TIPOS = Object.keys(TIPO_ACTIVIDAD_LABEL) as TipoActividad[];

interface ActivityFeedProps {
  initialItems: Actividad[];
  limit?: number;
  intervalMs?: number;
  liveEnabled?: boolean;
  isLoading?: boolean;
}

/**
 * Timeline de actividad compacta:
 * - chips en una sola línea con scroll horizontal oculto
 * - el evento nuevo entra por arriba sin saltos de scroll
 * - punto rojo solo en eventos de incidente
 * - simulación en vivo cada `intervalMs`
 */
export function ActivityFeed({
  initialItems,
  limit = 10,
  intervalMs = 15_000,
  liveEnabled = true,
  isLoading = false,
}: ActivityFeedProps) {
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState<TipoActividad | 'todos'>('todos');

  const seed = useMemo(() => initialItems.slice(0, limit), [initialItems, limit]);

  const { items, latestId } = useLiveActivity(seed, {
    enabled: liveEnabled && !isLoading,
    intervalMs,
    limit,
    generate: generateLiveActivity,
  });

  const counts = useMemo(() => {
    const map = new Map<TipoActividad | 'todos', number>([['todos', items.length]]);
    TIPOS.forEach((tipo) => {
      map.set(tipo, items.filter((i) => i.tipo === tipo).length);
    });
    return map;
  }, [items]);

  const filtered = useMemo(
    () => (activeType === 'todos' ? items : items.filter((i) => i.tipo === activeType)),
    [items, activeType],
  );

  return (
    <div className="activity">
      <div className="activity__filters">
        <div className="chip-row chip-row--nowrap" role="group" aria-label="Filtrar actividad por tipo">
          <button
            type="button"
            className={`chip${activeType === 'todos' ? ' is-active' : ''}`}
            aria-pressed={activeType === 'todos'}
            onClick={() => setActiveType('todos')}
          >
            Todos
            <span className="chip__count">{counts.get('todos') ?? 0}</span>
          </button>
          {TIPOS.map((tipo) => (
            <button
              key={tipo}
              type="button"
              className={`chip${activeType === tipo ? ' is-active' : ''}`}
              aria-pressed={activeType === tipo}
              onClick={() => setActiveType(tipo)}
            >
              {TIPO_ACTIVIDAD_LABEL[tipo]}
              <span className="chip__count">{counts.get(tipo) ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="activity__list" aria-live="polite" aria-label="Actividad reciente">
        <span className="activity__rail" aria-hidden="true" />
        <AnimatePresence mode="popLayout" initial={false}>
          {filtered.map((item) => {
            const Icon = ICONOS[item.tipo];
            const isLatest = item.id === latestId;
            return (
              <motion.button
                key={item.id}
                type="button"
                layout={!reduced}
                className={`activity__item${isLatest ? ' flash-accent' : ''}`}
                variants={reduced ? reducedVariants : listItemVariants}
                initial={reduced ? 'hidden' : 'initial'}
                animate={reduced ? 'show' : 'animate'}
                exit="exit"
                onClick={() => navigate(item.href)}
                aria-label={`${stripMarkup(item.titulo)}. ${TIPO_ACTIVIDAD_LABEL[item.tipo]}. ${formatRelativeTime(
                  item.timestamp,
                )}`}
              >
                <span className="activity__icon" aria-hidden="true">
                  <Icon width={16} height={16} />
                  {item.tipo === 'incidente' && <span className="activity__alert" />}
                </span>
                <span className="activity__body">
                  <span
                    className="activity__title"
                    dangerouslySetInnerHTML={{ __html: item.titulo }}
                  />
                  <span className="activity__meta">
                    {item.detalle}
                    <span className="activity__dot" aria-hidden="true" />
                    {item.usuario}
                  </span>
                </span>
                <Tooltip title={new Date(item.timestamp).toLocaleString('es-ES')} side="bottom">
                  <span className="activity__time" aria-hidden="true">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                </Tooltip>
              </motion.button>
            );
          })}
        </AnimatePresence>

        <AnimatePresence>
          {filtered.length === 0 && !isLoading && (
            <motion.div
              className="state"
              initial={{ opacity: 0, y: reduced ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={reduced ? { duration: 0.2 } : TWEEN.base}
            >
              <h3 className="state__title">Sin actividad</h3>
              <p className="state__desc">No hay eventos de este tipo en las últimas horas.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const stripMarkup = (html: string): string => html.replace(/<[^>]*>/g, '');
