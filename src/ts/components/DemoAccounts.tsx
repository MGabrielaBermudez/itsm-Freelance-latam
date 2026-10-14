import { useId, useState } from 'react';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import type { DemoAccount } from '@/models';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { demoContainer, demoItem, demoItemReduced } from '@/animations';
import { EASE_OUT_EXPO, TWEEN } from '@/motion/presets';
import { IconChevronRight, IconCopy } from '@/components/Icons';

interface DemoAccountsProps {
  accounts: readonly DemoAccount[];
  onPick: (account: DemoAccount) => void;
  disabled?: boolean;
  /** Correo de la cuenta que está autocompletando/entrando (se resalta). */
  activeEmail?: string | null;
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
  active: boolean;
}

/** Tarjeta de cuenta demo: entrar la autocompleta; botón "Copiar" copia credenciales. */
function DemoItem({ account, onPick, disabled, reduced, active }: DemoItemProps) {
  const controls = useAnimation();
  const [copied, setCopied] = useState(false);

  const isDisabled = disabled || account.disabled;

  const handlePick = (): void => {
    if (isDisabled) {
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

  const handleCopy = async (): Promise<void> => {
    const text = `email=${account.email}\npassword=${account.password}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <motion.li variants={reduced ? demoItemReduced : demoItem} className="demo__card-wrap">
      <motion.div
        className={`demo__card${account.disabled ? ' is-disabled' : ''}${active ? ' is-active' : ''}`}
        animate={controls}
      >
        <div className="demo__card-top">
          <span className={`demo__role ${ROLE_CLASS[account.role]}`}>{account.roleLabel}</span>
          {account.disabled && <span className="demo__flag">Cuenta desactivada</span>}
          {active && <span className="demo__spinner" aria-hidden="true" />}
        </div>
        <div className="demo__card-body">
          <span className="demo__email" title={account.email}>
            {account.email}
          </span>
          <span className="demo__pass-wrap">
            <code className="demo__pass">{account.password}</code>
          </span>
        </div>
        <div className="demo__card-actions">
          <button
            type="button"
            className="demo__action demo__action--enter"
            onClick={handlePick}
            disabled={isDisabled}
          >
            {active ? 'Entrando…' : 'Usar esta cuenta'}
          </button>
          <button
            type="button"
            className="demo__action demo__action--copy"
            onClick={handleCopy}
            aria-label={`Copiar credenciales de ${account.email}`}
            title={copied ? 'Copiado' : 'Copiar email y contraseña'}
          >
            <IconCopy width={16} height={16} />
            <span className="demo__copy-label">{copied ? 'Copiado' : 'Copiar'}</span>
          </button>
        </div>
      </motion.div>
    </motion.li>
  );
}

/**
 * Sección colapsable con las cuentas de prueba. La lista tiene scroll
 * interno acotado para que la tarjeta nunca desborde la pantalla.
 */
export function DemoAccounts({ accounts, onPick, disabled, activeEmail }: DemoAccountsProps) {
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
                  active={activeEmail === account.email}
                />
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="demo__hint">
        Elige una cuenta para autocompletar el formulario o copia sus credenciales para usarlas manualmente.
      </p>
    </section>
  );
}
