import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SPRING, TWEEN } from '@/motion/presets';
import { IconChat, IconClose } from '@/components/Icons';

/**
 * Botón flotante de chat/ayuda (abajo a la derecha).
 * El contenido reserva espacio inferior para que nunca tape nada.
 */
export function HelpFab() {
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="help-fab">
      <AnimatePresence>
        {open && (
          <motion.div
            className="help-fab__panel"
            role="dialog"
            aria-label="Centro de ayuda"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={reduced ? TWEEN.fast : SPRING.snappy}
          >
            <p className="help-fab__title">¿Necesitas ayuda?</p>
            <p className="help-fab__text">
              Consulta las incidencias pendientes o contacta con el equipo de soporte.
            </p>
            <div className="help-fab__actions">
              <button
                type="button"
                className="btn btn--primary btn--sm btn--block"
                onClick={() => {
                  setOpen(false);
                  navigate('/incidentes?estado=pendiente');
                }}
              >
                Ver tickets pendientes
              </button>
              <a className="btn btn--ghost btn--sm btn--block" href="mailto:soporte@itsm.local">
                Contactar soporte
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        className="help-fab__button"
        aria-label={open ? 'Cerrar ayuda' : 'Abrir ayuda y soporte'}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
        whileHover={reduced ? undefined : { scale: 1.06 }}
        whileTap={reduced ? undefined : { scale: 0.94 }}
        transition={SPRING.snappy}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? 'close' : 'chat'}
            className="help-fab__icon"
            initial={reduced ? { opacity: 0 } : { opacity: 0, rotate: -35, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, rotate: 35, scale: 0.7 }}
            transition={reduced ? TWEEN.fast : SPRING.snappy}
          >
            {open ? <IconClose /> : <IconChat />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
