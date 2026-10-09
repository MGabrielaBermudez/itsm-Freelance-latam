import type { Transition, Variants } from 'framer-motion';

/* =============================================================
   Springs y transiciones compartidas.
   Estos valores son el punto único de ajuste de la "física"
   global del panel (ver README § Animaciones).
   ============================================================= */

export const SPRING = {
  /** Interacciones directas: hover, tap, iconos. Rápido y firme. */
  snappy: { type: 'spring', stiffness: 200, damping: 26, mass: 0.7 } as const,
  /** Layout medio: tarjetas que se reacomodan, sidebar, segmented. */
  smooth: { type: 'spring', stiffness: 160, damping: 22, mass: 0.9 } as const,
  /** Entradas y textos largos: más inercia, se siente "vivo". */
  gentle: { type: 'spring', stiffness: 120, damping: 18, mass: 1 } as const,
  /** Barras de progreso: relleno continuo sin rebote. */
  progress: { type: 'spring', stiffness: 130, damping: 24, mass: 1 } as const,
} as const;

export const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

export const TWEEN = {
  fast: { duration: 0.2, ease: EASE_OUT_EXPO },
  base: { duration: 0.28, ease: EASE_OUT_EXPO },
  slow: { duration: 0.42, ease: EASE_OUT_EXPO },
} as const;

/* =============================================================
   Stagger
   ============================================================= */

export const STAGGER: Record<'tight' | 'base' | 'loose', number> = {
  tight: 0.06,
  base: 0.07,
  loose: 0.09,
};

export const staggerContainer = (stagger: number = STAGGER.base, delay = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

/* =============================================================
   Entradas de página
   ============================================================= */

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { ...TWEEN.base, when: 'beforeChildren' },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.18, ease: EASE_OUT_EXPO },
  },
};

export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: TWEEN.base },
  exit: { opacity: 0, transition: { duration: 0.16, ease: EASE_OUT_EXPO } },
};

/** Bloque de contenido: fade + desplazamiento + scale leve desde 0.98. */
export const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...TWEEN.slow, type: 'spring', stiffness: 130, damping: 20 },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...TWEEN.base, type: 'spring', stiffness: 160, damping: 22 },
  },
};

/** Solo opacidad: usado cuando prefers-reduced-motion está activo. */
export const reducedVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/* =============================================================
   Listas animadas (Actividad, tablas, donuts)
   ============================================================= */

export const listItemVariants: Variants = {
  initial: { opacity: 0, y: -10, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...TWEEN.base, type: 'spring', stiffness: 190, damping: 24 },
  },
  exit: {
    opacity: 0,
    x: -18,
    transition: { duration: 0.2, ease: EASE_OUT_EXPO },
  },
};

export const popLayoutItem = {
  layout: true,
  initial: { opacity: 0, y: -12, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: SPRING.snappy },
  exit: { opacity: 0, x: -16, transition: TWEEN.fast },
} satisfies Record<string, unknown>;

/* =============================================================
   Interacciones
   ============================================================= */

export const hoverLift = {
  y: -2,
  transition: SPRING.snappy,
} as const;

export const hoverRest = {
  y: 0,
  scale: 1,
  transition: SPRING.snappy,
} as const;

export const tapPress = { scale: 0.98 } as const;

/* =============================================================
   Transiciones de datos (gráficos)
   ============================================================= */

export const dataTween: Transition = {
  duration: 0.55,
  ease: EASE_OUT_EXPO,
};

export const drawTween: Transition = {
  duration: 0.85,
  ease: EASE_OUT_EXPO,
};

/** Curva para RevealPaths / drawing de sparkline: solo pathLength. */
export const strokeTransition: Transition = {
  duration: 1.1,
  ease: EASE_OUT_EXPO,
};