import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SPRING } from '@/motion/presets';
import { IconClose } from '@/components/Icons';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  tone?: 'info' | 'success' | 'error';
}

/** Aviso flotante con autocierre a los 4 s. */
export function Toast({ message, onClose, tone = 'info' }: ToastProps) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onClose, 4000);
    return () => window.clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div className="toast-region" aria-live="polite" aria-atomic="true">
      <AnimatePresence>
        {message && (
          <motion.div
            key={message}
            className={`toast toast--${tone}`}
            role="status"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={reduced ? { duration: 0.16 } : SPRING.snappy}
          >
            <span className="toast__text">{message}</span>
            <button type="button" className="toast__close" onClick={onClose} aria-label="Cerrar aviso">
              <IconClose width={15} height={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
