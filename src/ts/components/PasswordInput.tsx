import { useState, type FocusEvent, type RefObject } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCapsLock } from '@/hooks/useCapsLock';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { TWEEN } from '@/motion/presets';
import { FloatingInput } from '@/components/FloatingInput';
import { IconAlert, IconEye, IconEyeOff, IconLock } from '@/components/Icons';

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  error?: string | null;
  touched?: boolean;
  valid?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  inputRef?: RefObject<HTMLInputElement>;
}

/** Campo de contraseña con mostrar/ocultar y aviso de Bloq Mayús. */
export function PasswordInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  touched,
  valid,
  autoComplete,
  autoFocus,
  disabled,
  inputRef,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const capsLock = useCapsLock();
  const reduced = useReducedMotion();

  const toggle = (
    <button
      type="button"
      className="field__toggle"
      onClick={() => setVisible((v) => !v)}
      aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      aria-pressed={visible}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={visible ? 'off' : 'on'}
          className="field__toggle-icon"
          initial={reduced ? { opacity: 0 } : { opacity: 0, rotate: -45, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, rotate: 45, scale: 0.8 }}
          transition={reduced ? { duration: 0.12 } : TWEEN.fast}
        >
          {visible ? <IconEyeOff width={18} height={18} /> : <IconEye width={18} height={18} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );

  return (
    <div className="password-field">
      <FloatingInput
        id={id}
        label={label}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        type={visible ? 'text' : 'password'}
        icon={<IconLock width={18} height={18} />}
        trailing={toggle}
        error={error}
        touched={touched}
        valid={valid}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        disabled={disabled}
        inputRef={inputRef}
        hint={
          <AnimatePresence>
            {capsLock && !visible && (
              <motion.span
                className="field__caps"
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={reduced ? { duration: 0.14 } : TWEEN.fast}
              >
                <IconAlert width={14} height={14} />
                Bloq Mayús está activado
              </motion.span>
            )}
          </AnimatePresence>
        }
      />
    </div>
  );
}
