import { useId } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { EASE_OUT_EXPO } from '@/motion/presets';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

/** Checkbox accesible con "pop" y check dibujado al marcar. */
export function Checkbox({ checked, onChange, label, disabled }: CheckboxProps) {
  const reduced = useReducedMotion();
  const controls = useAnimation();
  const id = useId();

  const handleChange = (value: boolean): void => {
    onChange(value);
    if (!reduced) {
      void controls.start({ scale: [1, 1.18, 1], transition: { duration: 0.28, ease: EASE_OUT_EXPO } });
    }
  };

  return (
    <label className={`checkbox${disabled ? ' is-disabled' : ''}`} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className="checkbox__input"
        checked={checked}
        disabled={disabled}
        onChange={(event) => handleChange(event.target.checked)}
      />
      <motion.span className="checkbox__box" aria-hidden="true" animate={controls}>
        <svg
          viewBox="0 0 24 24"
          width={12}
          height={12}
          fill="none"
          stroke="currentColor"
          strokeWidth={3.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M5 12.5l4.2 4.2L19 7"
            initial={false}
            animate={
              reduced
                ? { opacity: checked ? 1 : 0 }
                : { pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }
            }
            transition={reduced ? { duration: 0.12 } : { duration: 0.28, ease: EASE_OUT_EXPO }}
          />
        </svg>
      </motion.span>
      <span className="checkbox__label">{label}</span>
    </label>
  );
}
