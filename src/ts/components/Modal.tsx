import { useEffect, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SPRING } from '@/motion/presets';
import { IconClose } from '@/components/Icons';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Diálogo modal accesible: overlay + panel centrado, cierra con Escape,
 * recibe el foco al abrir y anima con spring suave.
 */
export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }: ModalProps) {
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="modal-root">
          <motion.button
            type="button"
            className="modal-overlay"
            aria-label="Cerrar diálogo"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className={`modal modal--${size}`}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={reduced ? { duration: 0.16 } : SPRING.smooth}
          >
            <header className="modal__header">
              <div className="modal__title-group">
                <h2 className="modal__title">{title}</h2>
                {subtitle && <p className="modal__subtitle">{subtitle}</p>}
              </div>
              <button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar">
                <IconClose width={18} height={18} />
              </button>
            </header>
            <div className="modal__body">{children}</div>
            {footer && <footer className="modal__footer">{footer}</footer>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}