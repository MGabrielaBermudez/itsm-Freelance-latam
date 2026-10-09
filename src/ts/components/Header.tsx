import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Notificacion } from '@/models';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SPRING, TWEEN } from '@/motion/presets';
import { matchesSearch } from '@/utils/formatters';
import {
  IconBell,
  IconChevronRight,
  IconLogout,
  IconMenu,
  IconMoon,
  IconRefresh,
  IconSearch,
  IconSun,
} from '@/components/Icons';

export interface SearchResult {
  id: string;
  titulo: string;
  subtitulo: string;
  ruta: string;
  tipo: string;
}

interface HeaderProps {
  titulo: string;
  subtitulo: string;
  notificaciones: Notificacion[];
  resultados: SearchResult[];
  onToggleTheme: () => void;
  theme: 'light' | 'dark';
  onToggleSidebarMobile: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  userInitials: string;
  userName: string;
  onLogout: () => void;
  onReadAll: () => void;
  unreadCount: number;
}

const TYPE_BADGE: Record<string, string> = {
  Equipo: 'badge--navy',
  Freelancer: 'badge--accent',
  Incidente: 'badge--danger',
  Asignación: 'badge--navy',
  Onboarding: 'badge--success',
};

export function Header({
  titulo,
  subtitulo,
  notificaciones,
  resultados,
  onToggleTheme,
  theme,
  onToggleSidebarMobile,
  onRefresh,
  isRefreshing,
  userInitials,
  userName,
  onLogout,
  onReadAll,
  unreadCount,
}: HeaderProps) {
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
        document.getElementById('global-search')?.focus();
      }
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent): void => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const visible = useMemo(
    () => resultados.slice(0, 5).filter((r) => matchesSearch([r.titulo, r.subtitulo, r.tipo], term)),
    [resultados, term],
  );

  return (
    <header className="app-header">
      <button
        type="button"
        className="icon-button header-burger"
        onClick={onToggleSidebarMobile}
        aria-label="Abrir menú lateral"
      >
        <IconMenu />
      </button>

      <div className="app-header__title">
        <h1>{titulo}</h1>
        <p>{subtitulo}</p>
      </div>

      <div className="header-search" ref={searchRef}>
        <IconSearch className="header-search__icon" width={16} height={16} />
        <input
          id="global-search"
          type="search"
          className="header-search__input"
          placeholder="Buscar equipos, freelance, incidencias…"
          aria-label="Buscador global"
          aria-expanded={searchOpen && visible.length > 0}
          aria-controls="global-search-results"
          role="combobox"
          autoComplete="off"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onFocus={() => setSearchOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && visible.length > 0 && visible[0]) {
              navigate(visible[0].ruta);
              setSearchOpen(false);
              setTerm('');
            }
          }}
        />
        <kbd className="header-search__kbd">⌘K</kbd>

        <AnimatePresence>
          {searchOpen && visible.length > 0 && (
            <motion.ul
              id="global-search-results"
              className="search-results"
              role="listbox"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.99 }}
              transition={reduced ? { duration: 0.18 } : SPRING.snappy}
            >
              {visible.map((result) => (
                <li key={result.id}>
                  <button
                    type="button"
                    className="search-results__item"
                    role="option"
                    aria-selected={false}
                    onClick={() => {
                      navigate(result.ruta);
                      setSearchOpen(false);
                      setTerm('');
                    }}
                  >
                    <span className="search-results__text">
                      <span className="search-results__title">{result.titulo}</span>
                      <span className="search-results__sub">{result.subtitulo}</span>
                    </span>
                    <span className={`badge ${TYPE_BADGE[result.tipo] ?? 'badge--navy'}`}>
                      {result.tipo}
                    </span>
                    <IconChevronRight width={14} height={14} />
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <div className="app-header__actions">
        <button
          type="button"
          className="icon-button"
          onClick={onRefresh}
          aria-label="Actualizar datos"
          title="Actualizar datos"
        >
          <motion.span
            className="icon-button__motion"
            animate={isRefreshing && !reduced ? { rotate: 360 } : { rotate: 0 }}
            transition={
              isRefreshing && !reduced
                ? { duration: 0.9, repeat: Infinity, ease: 'linear' }
                : { duration: 0.3 }
            }
          >
            <IconRefresh width={19} height={19} />
          </motion.span>
        </button>

        <button
          type="button"
          className="icon-button"
          onClick={onToggleTheme}
          aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
          aria-pressed={theme === 'dark'}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={theme}
              className="icon-button__motion"
              initial={reduced ? { opacity: 0 } : { opacity: 0, rotate: -40, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, rotate: 40, scale: 0.8 }}
              transition={reduced ? { duration: 0.16 } : TWEEN.fast}
            >
              {theme === 'light' ? <IconMoon /> : <IconSun />}
            </motion.span>
          </AnimatePresence>
        </button>

        <div className="notif-wrap">
          <button
            type="button"
            className="icon-button"
            onClick={() => setNotifOpen((v) => !v)}
            aria-label={`Notificaciones${unreadCount > 0 ? `, ${unreadCount} sin leer` : ''}`}
            aria-expanded={notifOpen}
            aria-haspopup="dialog"
          >
            <IconBell />
            {unreadCount > 0 && <span className="icon-button__dot" aria-hidden="true" />}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                className="notif-panel"
                role="dialog"
                aria-label="Notificaciones"
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
                transition={reduced ? { duration: 0.18 } : SPRING.snappy}
              >
                <div className="notif-panel__head">
                  <strong>Notificaciones</strong>
                  <button type="button" className="btn btn--soft btn--sm" onClick={onReadAll}>
                    Marcar leídas
                  </button>
                </div>
                <ul className="notif-panel__list">
                  {notificaciones.map((n) => (
                    <li key={n.id} className={`notif-item${n.leida ? '' : ' is-unread'}`}>
                      <span className={`notif-item__dot notif-item__dot--${n.tono}`} aria-hidden="true" />
                      <span className="notif-item__body">
                        <span className="notif-item__title">{n.titulo}</span>
                        <span className="notif-item__detail">{n.detalle}</span>
                      </span>
                      <span className="notif-item__time">{n.tiempo}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="header-user">
          <span className="header-user__name" title={userName}>
            {userName}
          </span>
          <button type="button" className="header-user__logout" onClick={onLogout}>
            <IconLogout width={15} height={15} />
            <span className="header-user__logout-text">Cerrar sesión</span>
          </button>
        </div>

        <button type="button" className="avatar" aria-label={`Perfil de ${userName}`}>
          {userInitials}
        </button>
      </div>
    </header>
  );
}