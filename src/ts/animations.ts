import type { Variants } from 'framer-motion';
import { EASE_OUT_EXPO, SPRING, TWEEN } from '@/motion/presets';

/* =============================================================
   animations.ts · Variantes reutilizables
   Punto único del "vocabulario" de movimiento: fadeUp, popIn,
   shake, cascadas y entradas de pantalla viven aquí para que los
   componentes solo consuman (nada de lógica de animación inline).

   Reglas: animar únicamente transform/opacity (height solo en el
   colapsable) y ofrecer siempre la variante `*Reduced` para
   prefers-reduced-motion.
   ============================================================= */

/* ---------------- Genéricas ---------------- */

/** Entrada desde abajo con spring suave: genérica de bloques. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: SPRING.gentle },
  exit: { opacity: 0, y: -8, transition: TWEEN.fast },
};

export const fadeUpReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/** Entrada con "pop": la idea es un rebote cortito y controlado. */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.86 },
  show: { opacity: 1, scale: 1, transition: SPRING.snappy },
};

/** Slide lateral desde la izquierda (paneles de marca). */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } },
};

/** Sacudida corta para errores (keyframes, no física). */
export const shakeKeyframes: number[] = [0, -10, 9, -7, 5, -3, 0];
export const shakeFieldKeyframes: number[] = [0, -6, 5, -4, 3, 0];
export const shakeTransition = { duration: 0.42, ease: 'easeInOut' } as const;

/* ---------------- Cascadas ---------------- */

export const cascadeContainer = (stagger = 0.08, delay = 0.2): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

export const cascadeItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT_EXPO } },
};

export const cascadeItemReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
};

/* ---------------- Pantalla de acceso ---------------- */

/** Panel de marca: fade + slide desde la izquierda. */
export const brandPanelVariants: Variants = {
  hidden: { opacity: 0, x: -24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } },
};

export const brandPanelReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
};

/** Logo: aparición limpia (fade + scale), encabezando la cascada. */
export const logoVariants: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: SPRING.smooth },
};

/** Panel del formulario: fade + slide-up suaves, sin caja. */
export const authCardVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { ...SPRING.smooth, delay: 0.15 },
  },
};

export const authCardReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25, delay: 0.1 } },
};

/** Cascada para las tarjetas de cuentas demo al abrir la sección. */
export const demoContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

export const demoItem: Variants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.28, ease: EASE_OUT_EXPO } },
};

export const demoItemReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.18 } },
};

/* ---------------- Transiciones de ruta ---------------- */

/** Envuelve cada rama del router: salida y entrada fluidas (login ↔ panel). */
export const screenVariants: Variants = {
  initial: { opacity: 0, scale: 0.985 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: EASE_OUT_EXPO } },
  exit: { opacity: 0, scale: 0.985, transition: { duration: 0.22, ease: EASE_OUT_EXPO } },
};

export const screenReducedVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.16 } },
};
