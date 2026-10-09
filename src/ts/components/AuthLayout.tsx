import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  authCardReduced,
  authCardVariants,
  brandPanelReduced,
  brandPanelVariants,
  cascadeContainer,
  cascadeItem,
  cascadeItemReduced,
  logoVariants,
} from '@/animations';
import { TWEEN } from '@/motion/presets';
import { IconLogo, IconMoon, IconSun } from '@/components/Icons';
import { AnimatedBackground } from '@/components/AnimatedBackground';

interface AuthLayoutProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  children: ReactNode;
}

const BRAND_POINTS = [
  'Incidencias, equipos y stock en tiempo real',
  'Onboarding de personal sin hojas de cálculo',
  'Accesos por rol para tu equipo de TI',
] as const;

/* Viñeta con check que se "dibuja" al entrar. */
function DrawCheck({ delay }: { delay: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.svg
      className="auth__check"
      viewBox="0 0 24 24"
      width={15}
      height={15}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <motion.path
        d="M5 12.5l4.2 4.2L19 7"
        initial={reduced ? { opacity: 1 } : { pathLength: 0, opacity: 0 }}
        animate={reduced ? { opacity: 1 } : { pathLength: 1, opacity: 1 }}
        transition={reduced ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay }}
      />
    </motion.svg>
  );
}

/**
 * Pantalla de acceso a dos paneles (marca + formulario).
 * El lienzo azul vive en el contenedor y se funde con el espacio del
 * formulario; el panel de marca es transparente y solo aporta la escena
 * abstracta, siempre por detrás del contenido.
 */
export function AuthLayout({ theme, onToggleTheme, children }: AuthLayoutProps) {
  const reduced = useReducedMotion();

  const container = reduced ? cascadeContainer(0, 0) : cascadeContainer(0.08, 0.25);
  const item = reduced ? cascadeItemReduced : cascadeItem;
  const logo = reduced ? cascadeItemReduced : logoVariants;

  return (
    <div className="auth">
      <motion.aside
        className="auth__brand"
        variants={reduced ? brandPanelReduced : brandPanelVariants}
        initial="hidden"
        animate="show"
      >
        <AnimatedBackground />

        <motion.div className="auth__brand-inner" variants={container} initial="hidden" animate="show">
          <motion.span className="auth__logo" variants={logo}>
            <IconLogo width={26} height={26} />
          </motion.span>
          <motion.h1 className="auth__brand-title" variants={item}>
            ITSM Control
          </motion.h1>
          <motion.p className="auth__brand-sub" variants={item}>
            La consola de operaciones de TI para tu equipo: incidencias, equipos y personas en un
            único lugar.
          </motion.p>
          <ul className="auth__points">
            {BRAND_POINTS.map((point, index) => (
              <motion.li key={point} variants={item}>
                <DrawCheck delay={reduced ? 0 : 0.6 + index * 0.08} />
                <span>{point}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.aside>

      <main className="auth__form">
        <motion.div
          className="auth__form-topbar"
          initial={reduced ? { opacity: 0 } : { opacity: 0, rotate: -45, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={reduced ? { duration: 0.2 } : { duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
        >
          <button
            type="button"
            className="icon-button auth__theme"
            onClick={onToggleTheme}
            aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
            aria-pressed={theme === 'dark'}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                className="auth__theme-icon"
                initial={reduced ? { opacity: 0 } : { opacity: 0, rotate: -60, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, rotate: 60, scale: 0.7 }}
                transition={reduced ? { duration: 0.14 } : TWEEN.base}
              >
                {theme === 'light' ? <IconMoon width={18} height={18} /> : <IconSun width={18} height={18} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </motion.div>

        <div className="auth__compact-brand">
          <span className="auth__logo auth__logo--sm">
            <IconLogo width={18} height={18} />
          </span>
          <strong>ITSM Control</strong>
        </div>

        <motion.div
          className="auth__card"
          variants={reduced ? authCardReduced : authCardVariants}
          initial="hidden"
          animate="show"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
