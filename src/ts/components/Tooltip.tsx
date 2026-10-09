import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SPRING } from '@/motion/presets';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface TooltipRow {
  label: string;
  value: ReactNode;
}

interface TooltipProps {
  content?: ReactNode;
  title?: string;
  rows?: TooltipRow[];
  children: ReactNode;
  side?: 'top' | 'bottom';
  /** Modo controlado: permite abrirlo desde el hover/focus del contenedor padre. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Tooltip accesible y sin librería: se posiciona en coordenadas de viewport
 * (position: fixed) respecto a un ancla, y degrada a un fade simple
 * cuando prefers-reduced-motion está activo.
 */
const OFFSET = 16;
const EDGE = 8;

export function Tooltip({
  content,
  title,
  rows,
  children,
  side = 'top',
  open,
  onOpenChange,
}: TooltipProps) {
  const reduced = useReducedMotion();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<{ x: number; y: number } | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  /* Se coloca junto al cursor (offset 16px) y se voltea si desborda el viewport. */
  const recompute = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;
    const cursor = cursorRef.current;
    const cx = cursor ? cursor.x : rect.left + rect.width / 2;
    const cy = cursor ? cursor.y : rect.top + rect.height / 2;
    const w = tipRef.current?.offsetWidth ?? 220;
    const h = tipRef.current?.offsetHeight ?? 120;

    let x = cx + OFFSET;
    let y = cy + OFFSET;
    if (x + w > window.innerWidth - EDGE) x = cx - OFFSET - w;
    if (y + h > window.innerHeight - EDGE) y = cy - OFFSET - h;
    x = Math.max(EDGE, Math.min(x, window.innerWidth - w - EDGE));
    y = Math.max(EDGE, Math.min(y, window.innerHeight - h - EDGE));
    setPosition({ x, y });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    recompute();
    const frame = requestAnimationFrame(recompute);
    const onScroll = (): void => recompute();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [isOpen, recompute]);

  return (
    <>
      <span
        ref={anchorRef}
        className="tooltip-anchor"
        onPointerEnter={(event) => {
          cursorRef.current = { x: event.clientX, y: event.clientY };
          setOpen(true);
        }}
        onPointerMove={(event) => {
          cursorRef.current = { x: event.clientX, y: event.clientY };
          if (isOpen) recompute();
        }}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </span>
      <AnimatePresence>
        {isOpen && position && (
          <motion.div
            ref={tipRef}
            className={`tooltip tooltip--${side}`}
            role="tooltip"
            initial={
              reduced
                ? { opacity: 0, left: position.x, top: position.y }
                : { opacity: 0, left: position.x, top: position.y, y: side === 'top' ? 6 : -6, scale: 0.96 }
            }
            animate={{ opacity: 1, left: position.x, top: position.y, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98, transition: { duration: 0.14 } }}
            transition={reduced ? { duration: 0.18 } : SPRING.snappy}
          >
            {title && <p className="tooltip__title">{title}</p>}
            {content && <p className="tooltip__text">{content}</p>}
            {rows && rows.length > 0 && (
              <div className="tooltip__rows">
                {rows.map((row) => (
                  <div className="tooltip__row" key={row.label}>
                    <span>{row.label}</span>
                    <strong>{row.value}</strong>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}