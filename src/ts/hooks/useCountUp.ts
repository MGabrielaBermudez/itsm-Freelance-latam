import { useEffect, useState } from 'react';
import { clamp } from '@/utils/formatters';

interface UseCountUpOptions {
  /** Valor final. */
  value: number;
  /** Si es false el conteo no se ejecuta (movimiento reducido). */
  enabled?: boolean;
  /** Duración en segundos. */
  duration?: number;
}

const easeOutExpo = (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Anima un número desde 0 hasta `value` con easing out exponencial.
 * Devuelve el valor redondeado listo para pintar.
 */
export function useCountUp({ value, enabled = true, duration = 1.1 }: UseCountUpOptions): number {
  const reduced = !enabled;
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    let start: number | null = null;

    const step = (timestamp: number): void => {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      const progress = clamp(elapsed / (duration * 1000), 0, 1);
      const eased = easeOutExpo(progress);

      setDisplay(Math.round(value * (progress === 1 ? 1 : eased)));

      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, reduced]);

  return display;
}