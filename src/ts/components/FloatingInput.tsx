import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import { useEffect, type FocusEvent, type ReactNode, type RefObject } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { shakeFieldKeyframes, shakeTransition } from '@/animations';
import { TWEEN } from '@/motion/presets';
import { IconCheck } from '@/components/Icons';

interface FloatingInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  type?: 'text' | 'email' | 'password';
  name?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  error?: string | null;
  touched?: boolean;
  valid?: boolean;
  hint?: ReactNode;
  autoComplete?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  inputRef?: RefObject<HTMLInputElement>;
}

/**
 * Campo con label flotante, icono y error animado.
 * `aria-describedby` apunta al mensaje de error o a la pista visible.
 */
export function FloatingInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  onFocus,
  type = 'text',
  name,
  icon,
  trailing,
  error,
  touched,
  valid,
  hint,
  autoComplete,
  autoFocus,
  disabled,
  inputRef,
}: FloatingInputProps) {
  const reduced = useReducedMotion();
  const fieldControls = useAnimation();
  const invalid = Boolean(error && touched);
  const isValid = Boolean(valid) && !invalid && value.length > 0;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  /* Shake corto del campo en cuanto pasa a inválido (blur o submit). */
  useEffect(() => {
    if (!invalid || reduced) return;
    void fieldControls.start({ x: shakeFieldKeyframes, transition: shakeTransition });
  }, [invalid, reduced, fieldControls]);

  return (
    <div className="field-group">
      <motion.div
        className={`field${invalid ? ' has-error' : ''}${isValid ? ' is-valid' : ''}${
          disabled ? ' is-disabled' : ''
        }${value.length > 0 ? ' is-filled' : ''}`}
        animate={fieldControls}
      >
        {icon && <span className="field__icon">{icon}</span>}

        <div className="field__control">
          <input
            id={id}
            ref={inputRef}
            className="field__input"
            type={type}
            name={name}
            value={value}
            placeholder=" "
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            disabled={disabled}
            aria-invalid={invalid}
            aria-describedby={invalid ? errorId : hint ? hintId : undefined}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            onFocus={onFocus}
          />
          <label className="field__label" htmlFor={id}>
            {label}
          </label>
        </div>

        <AnimatePresence initial={false}>
          {isValid && (
            <motion.span
              className="field__valid"
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
              transition={reduced ? { duration: 0.14 } : TWEEN.fast}
              aria-hidden="true"
            >
              <IconCheck width={16} height={16} />
            </motion.span>
          )}
        </AnimatePresence>

        {trailing && <span className="field__trailing">{trailing}</span>}
      </motion.div>

      <AnimatePresence initial={false}>
        {invalid && (
          <motion.p
            id={errorId}
            className="field__error"
            role="alert"
            initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0, y: -4 }}
            transition={reduced ? { duration: 0.16 } : TWEEN.fast}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {!invalid && hint && (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
    </div>
  );
}
