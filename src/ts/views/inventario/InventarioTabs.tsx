import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SPRING } from '@/motion/presets';

export const INVENTARIO_TABS = [
  { to: '/inventario', label: 'Listado' },
  { to: '/inventario/resguardo', label: 'En resguardo' },
  { to: '/inventario/dashboard', label: 'Dashboard' },
] as const;

interface InventarioTabsProps {
  /** Contadores por ruta (para los badges de cada pestaña). */
  counters?: Partial<Record<(typeof INVENTARIO_TABS)[number]['to'], number>>;
}

/**
 * Tabs segmentadas del módulo de inventario: navegan entre las tres
 * vistas y muestran contadores; el pulgar se desliza con layoutId.
 */
export function InventarioTabs({ counters = {} }: InventarioTabsProps) {
  const reduced = useReducedMotion();

  return (
    <div className="segmented inv-tabs" role="tablist" aria-label="Vistas de inventario">
      {INVENTARIO_TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/inventario'}
          role="tab"
          aria-selected="false"
          className={({ isActive }) =>
            `segmented__btn inv-tabs__btn${isActive ? ' is-active' : ''}`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="inv-tab-thumb"
                  className="segmented__thumb"
                  transition={reduced ? { duration: 0.01 } : SPRING.smooth}
                  aria-hidden="true"
                />
              )}
              <span className="segmented__label">{tab.label}</span>
              {counters[tab.to] !== undefined && (
                <span className="inv-tabs__count">{counters[tab.to]}</span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}