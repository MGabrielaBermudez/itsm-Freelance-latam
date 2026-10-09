import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { SPRING } from '@/motion/presets';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  IconAlert,
  IconBox,
  IconClipboard,
  IconInventory,
  IconLaptop,
  IconLogo,
  IconOnboarding,
  IconSwap,
  IconUsers,
} from '@/components/Icons';

export interface NavItem {
  to: string;
  label: string;
  Icon: typeof IconLaptop;
  badge?: number;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', Icon: IconBox, end: true },
  { to: '/inventario', label: 'Inventario', Icon: IconInventory },
  { to: '/equipos', label: 'Equipos', Icon: IconLaptop },
  { to: '/freelancers', label: 'Freelancers', Icon: IconUsers, badge: 4 },
  { to: '/asignaciones', label: 'Asignaciones', Icon: IconClipboard, badge: 3 },
  { to: '/incidentes', label: 'Incidentes', Icon: IconAlert, badge: 3 },
  { to: '/onboarding', label: 'Onboarding', Icon: IconOnboarding, badge: 2 },
  { to: '/stock', label: 'Stock', Icon: IconSwap },
];

const SIDEBAR_WIDTH = 232;
const SIDEBAR_WIDTH_COLLAPSED = 64;

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  userName: string;
  userRole: string;
  userInitials: string;
}

/** Etiqueta que se desvanece y se retrae al colapsar. */
function CollapseFade({
  show,
  reduced,
  children,
}: {
  show: boolean;
  reduced: boolean;
  children: ReactNode;
}) {
  return (
    <motion.span
      className="sidebar__collapse-label"
      initial={false}
      animate={{
        opacity: show ? 1 : 0,
        width: show ? 'auto' : 0,
        marginLeft: show ? 0 : -8,
      }}
      transition={reduced ? { duration: 0.12 } : { ...SPRING.smooth, opacity: { duration: 0.18 } }}
      aria-hidden={!show}
    >
      {children}
    </motion.span>
  );
}

/**
 * Sidebar colapsable:
 * - el indicador activo se desliza entre ítems con layoutId
 * - el colapso es un spring sobre el width; las etiquetas se desvanecen
 * - en móvil se muestra como panel con overlay
 */
export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  userName,
  userRole,
  userInitials,
}: SidebarProps) {
  const reduced = useReducedMotion();
  const location = useLocation();
  const activeLabel =
    NAV_ITEMS.find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to),
    )?.label ?? 'Panel';

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.button
            type="button"
            className="sidebar__backdrop"
            aria-label="Cerrar menú"
            onClick={onCloseMobile}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduced ? { duration: 0.15 } : { duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={[
          'sidebar',
          collapsed ? 'is-collapsed' : '',
          mobileOpen ? 'is-mobile-open' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label="Navegación principal"
        initial={false}
        animate={{
          width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH,
          x: mobileOpen ? 0 : undefined,
        }}
        transition={reduced ? { duration: 0.15 } : SPRING.smooth}
      >
        <div className="sidebar__brand">
          <span className="sidebar__logo" aria-hidden="true">
            <IconLogo />
          </span>
          <CollapseFade show={!collapsed} reduced={reduced}>
            <span className="sidebar__brand-text">
              <span className="sidebar__brand-name">ITSM Control</span>
              <span className="sidebar__brand-sub">Operaciones TI</span>
            </span>
          </CollapseFade>
        </div>

        <nav className="sidebar__nav" aria-label="Secciones">
          <CollapseFade show={!collapsed} reduced={reduced}>
            <p className="sidebar__section-label">Operaciones</p>
          </CollapseFade>

          <ul className="sidebar__list">
            {NAV_ITEMS.map(({ to, label, Icon, badge, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={onCloseMobile}
                  className={({ isActive }) => `sidebar__link${isActive ? ' is-active' : ''}`}
                  title={collapsed ? label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="sidebar-active-indicator"
                          className="sidebar__indicator"
                          transition={reduced ? { duration: 0.01 } : SPRING.smooth}
                          aria-hidden="true"
                        />
                      )}
                      <span className="sidebar__icon" aria-hidden="true">
                        <Icon width={19} height={19} />
                      </span>
                      <CollapseFade show={!collapsed} reduced={reduced}>
                        <span className="sidebar__label">{label}</span>
                      </CollapseFade>
                      {badge !== undefined && (
                        <CollapseFade show={!collapsed} reduced={reduced}>
                          <span className="sidebar__pill">{badge}</span>
                        </CollapseFade>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar__footer">
          <button type="button" className="sidebar__user" title={userName}>
            <span className="avatar avatar--sm" aria-hidden="true">
              {userInitials}
            </span>
            <CollapseFade show={!collapsed} reduced={reduced}>
              <span className="sidebar__user-meta">
                <span className="sidebar__user-name">{userName}</span>
                <span className="sidebar__user-role">{userRole}</span>
              </span>
            </CollapseFade>
          </button>

          <button
            type="button"
            className="sidebar__collapse"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
            aria-pressed={collapsed}
          >
            <span
              className={`sidebar__collapse-icon${collapsed ? ' is-collapsed' : ''}`}
              aria-hidden="true"
            >
              <IconSwap width={18} height={18} />
            </span>
          </button>
        </div>

        <span className="sr-only" aria-live="polite">
          {activeLabel}
        </span>
      </motion.aside>
    </>
  );
}