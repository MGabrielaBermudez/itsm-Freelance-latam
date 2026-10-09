import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SPRING, TWEEN } from '@/motion/presets';
import { IconCheck } from '@/components/Icons';

export type SubmitState = 'idle' | 'loading' | 'success';

interface SubmitButtonProps {
  state: SubmitState;
  disabled?: boolean;
}

export function SubmitButton({ state, disabled }: SubmitButtonProps) {
  const reduced = useReducedMotion();
  const label = state === 'loading' ? 'Verificando…' : state === 'success' ? 'Bienvenida/o' : 'Entrar';
  const isBusy = state !== 'idle';

  return (
    <motion.button
      type="submit"
      className={`auth-submit${state === 'success' ? ' is-success' : ''}`}
      disabled={disabled || isBusy}
      aria-busy={state === 'loading'}
      animate={{ scale: state === 'loading' ? 0.98 : 1 }}
      whileHover={reduced || isBusy ? undefined : { y: -2 }}
      whileTap={reduced || isBusy ? undefined : { scale: 0.97 }}
      transition={reduced ? { duration: 0.15 } : SPRING.snappy}
    >
      <AnimatePresence mode="wait" initial={false}>
        {state === 'loading' && (
          <motion.span
            key="spinner"
            className="auth-submit__spinner"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={reduced ? { duration: 0.12 } : TWEEN.fast}
            aria-hidden="true"
          />
        )}
        {state === 'success' && (
          <motion.span
            key="check"
            className="auth-submit__check"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={reduced ? { duration: 0.12 } : TWEEN.fast}
            aria-hidden="true"
          >
            <IconCheck width={18} height={18} />
          </motion.span>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        {state !== 'loading' && (
          <motion.span
            key={label}
            className="auth-submit__label"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={reduced ? { duration: 0.12 } : TWEEN.fast}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
