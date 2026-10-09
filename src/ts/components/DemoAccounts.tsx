import { useId, useState } from 'react';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import type { DemoAccount } from '@/models';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { demoContainer, demoItem, demoItemReduced } from '@/animations';
import { EASE_OUT_EXPO, TWEEN } from '@/motion/presets';
import { IconChevronRight } from '@/components/Icons';

interface DemoAccountsProps {
  accounts: readonly DemoAccount[];
  onPick: (account: DemoAccount) => void;
  disabled?: boolean;
}

/** Rol → color discreto: navy, cian y gris (sin más colores). */
const ROLE_CLASS: Record<DemoAccount['role'], string> = {
  admin: 'demo-role--admin',
  tecnico: 'demo-role--tecnico',
  lector: 'demo-role--lector',
};

const SHAKE: number[] = [0, -6, 6, -4, 3, 0];

interface DemoItemProps {
  account: DemoAccount;
  onPick: (account: DemoAccount) => void;
  disabled: boolean;
  reduced: boolean;
}

/** Fila de cuenta demo: pop suave al pulsar; shake si está desactivada. */
function DemoItem({ account, onPick, disabled, reduced }: DemoItemProps) {
  const controls = useAnimation();

  const handleClick = (): void => {
    if (disabled) return;
    if (account.disabled) {
      if (!reduced) {
        void controls.start({ x: SHAKE, transition: { duration: 0.4, ease: 'easeInOut' } });
      }
      return;
    }
    onPick(account);
    if (!reduced) {
      void controls.start({ scale: [1, 1.03, 1], transition: { duration: 0.28, ease: EASE_OUT_EXPO } });
    }
  };

  return (
    <motion.li variants={reduced ? demoItemReduced : demoItem}>
      <motion.button
        type="button"
        className={`demo__item${account.disabled ? ' is-disabled' : ''}`}
        onClick={handleClick}
        disabled={disabled}
        animate={controls}
      >
        <span className={`demo__role ${ROLE_CLASS[account.role]}`}>{account.roleLabel}</span>
        <span className="demo__email">{account.email}</span>
        <code className="demo__pass">{account.password}</code>
        {account.disabled && <span className="demo__flag">Cuenta desactivada</span>}
      </motion.button>
    </motion.li>
  );
}

/**
 * Sección colapsable con las cuentas de prueba. La lista tiene scroll
 * interno acotado para que la tarjeta nunca desborde la pantalla.
 */
export function DemoAccounts({ accounts, onPick, disabled }: DemoAccountsProps) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(true);
  const listId = useId();

  return (
    <section className="demo">
      <button
        type="button"
        className="demo__toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={listId}
      >
        <span>Cuentas de demostración</span>
        <motion.span
          className="demo__chevron"
          animate={{ rotate: open ? -90 : 90 }}
          transition={reduced ? { duration: 0.16 } : TWEEN.fast}
        >
          <IconChevronRight width={14} height={14} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="demo__body"
            initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={reduced ? { duration: 0.16 } : TWEEN.base}
          >
            <motion.ul
              id={listId}
              className="demo__list"
              variants={reduced ? undefined : demoContainer}
              initial={reduced ? false : 'hidden'}
              animate={reduced ? undefined : 'show'}
            >
              {accounts.map((account) => (
                <DemoItem
                  key={account.email}
                  account={account}
                  onPick={onPick}
                  disabled={Boolean(disabled)}
                  reduced={reduced}
                />
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="demo__hint">
        Pulsa una cuenta para rellenar el formulario. Credenciales solo para esta demo.
      </p>
    </section>
  );
}
