import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { AuthErrorCode, DemoAccount } from '@/models';
import { useAuth } from '@/hooks/useAuth';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { EASE_OUT_EXPO, SPRING, TWEEN } from '@/motion/presets';
import { AuthError, requestPasswordReset } from '@/services/authService';
import { validateEmail, validatePassword } from '@/utils/validators';
import { FloatingInput } from '@/components/FloatingInput';
import { PasswordInput } from '@/components/PasswordInput';
import { Checkbox } from '@/components/Checkbox';
import { SubmitButton, type SubmitState } from '@/components/SubmitButton';
import { DemoAccounts } from '@/components/DemoAccounts';
import { IconAlert, IconChevronLeft, IconMail } from '@/components/Icons';

const MAX_ATTEMPTS = 5;
const LOCK_MS = 30_000;

const ERROR_MESSAGE: Record<AuthErrorCode, string> = {
  invalid_credentials: 'Correo o contraseña incorrectos.',
  account_disabled: 'Esta cuenta está desactivada. Contacta con el administrador.',
  network: 'No se pudo conectar. Inténtalo de nuevo.',
};

interface LoginFormProps {
  redirectTo: string;
  demoAccounts: readonly DemoAccount[];
}

type Mode = 'login' | 'recovery';

export function LoginForm({ redirectTo, demoAccounts }: LoginFormProps) {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { login } = useAuth();
  const controls = useAnimation();

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [pendingAccount, setPendingAccount] = useState<string | null>(null);
  const [formError, setFormError] = useState<{ code: AuthErrorCode | 'locked'; message: string } | null>(
    null,
  );
  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [recoverySent, setRecoverySent] = useState(false);
  const [autofilled, setAutofilled] = useState(false);
  const [typing, setTyping] = useState(false);
  const autofillTimer = useRef<number | null>(null);
  const typeTimer = useRef<number | null>(null);
  const submitTimer = useRef<number | null>(null);

  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  const locked = lockUntil !== null && now < lockUntil;
  const lockRemaining = lockUntil ? Math.max(0, Math.ceil((lockUntil - now) / 1000)) : 0;

  /* Cuenta atrás del bloqueo temporal por intentos fallidos. */
  useEffect(() => {
    if (lockUntil === null) return undefined;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [lockUntil]);

  useEffect(() => {
    if (lockUntil !== null && Date.now() >= lockUntil) {
      setLockUntil(null);
      setFormError(null);
      setAttempts(0);
    }
  }, [now, lockUntil]);

  useEffect(
    () => () => {
      if (autofillTimer.current !== null) window.clearTimeout(autofillTimer.current);
      if (typeTimer.current !== null) window.clearInterval(typeTimer.current);
      if (submitTimer.current !== null) window.clearTimeout(submitTimer.current);
    },
    [],
  );

  const cancelTypewriter = useCallback((): void => {
    if (typeTimer.current !== null) {
      window.clearInterval(typeTimer.current);
      typeTimer.current = null;
    }
    if (submitTimer.current !== null) {
      window.clearTimeout(submitTimer.current);
      submitTimer.current = null;
    }
    setPendingAccount(null);
    setTyping(false);
  }, []);

  const shake = useCallback((): void => {
    if (reduced) return;
    void controls.start({
      x: [0, -10, 9, -7, 5, -3, 0],
      transition: { duration: 0.45, ease: 'easeInOut' },
    });
  }, [controls, reduced]);

  /** Ejecuta el inicio de sesión y la secuencia de éxito (spinner → check → salida). */
  const runLogin = useCallback(
    async (creds: { email: string; password: string; remember: boolean }): Promise<void> => {
      if (locked) return;

      setSubmitState('loading');
      setFormError(null);

      try {
        await login(creds);
        setSubmitState('success');
        if (!reduced) {
          await controls.start({
            opacity: 0,
            y: -10,
            transition: { duration: 0.3, ease: EASE_OUT_EXPO },
          });
        }
        navigate(redirectTo, { replace: true });
      } catch (error) {
        setSubmitState('idle');
        setPendingAccount(null);
        const code = error instanceof AuthError ? error.code : 'network';

        if (code === 'invalid_credentials') {
          const nextAttempts = attempts + 1;
          setAttempts(nextAttempts);
          shake();
          emailRef.current?.focus();

          if (nextAttempts >= MAX_ATTEMPTS) {
            setLockUntil(Date.now() + LOCK_MS);
            setFormError({
              code: 'locked',
              message: `Demasiados intentos fallidos. Espera ${LOCK_MS / 1000} s para volver a probar.`,
            });
          } else {
            setFormError({ code, message: ERROR_MESSAGE[code] });
          }
          return;
        }

        setFormError({ code, message: ERROR_MESSAGE[code] });
      }
    },
    [login, reduced, controls, navigate, redirectTo, locked, attempts, shake],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (mode === 'recovery') {
      if (emailError) {
        setTouched((prev) => ({ ...prev, email: true }));
        emailRef.current?.focus();
        return;
      }
      setSubmitState('loading');
      await requestPasswordReset(email);
      setSubmitState('idle');
      setRecoverySent(true);
      return;
    }

    setTouched({ email: true, password: true });
    if (emailError || passwordError) {
      (emailError ? emailRef : passwordRef).current?.focus();
      return;
    }
    if (locked) return;

    await runLogin({ email, password, remember });
  };

  const handlePickAccount = (account: DemoAccount): void => {
    setTouched({ email: false, password: false });
    setFormError(null);
    setRecoverySent(false);
    cancelTypewriter();

    if (autofillTimer.current !== null) window.clearTimeout(autofillTimer.current);
    setAutofilled(true);

    if (reduced) {
      setEmail(account.email);
      setPassword(account.password);
      setPendingAccount(account.email);
      autofillTimer.current = window.setTimeout(() => setAutofilled(false), 600);
      submitTimer.current = window.setTimeout(() => {
        void runLogin({ email: account.email, password: account.password, remember: true });
      }, 320);
      return;
    }

    setTyping(true);
    setEmail('');
    setPassword('');
    const emailStr = account.email;
    const passStr = account.password;
    const total = emailStr.length + passStr.length;
    let step = 0;

    typeTimer.current = window.setInterval(() => {
      step += 1;
      setEmail(emailStr.slice(0, Math.min(step, emailStr.length)));
      setPassword(passStr.slice(0, Math.max(0, step - emailStr.length)));

      if (step >= total) {
        if (typeTimer.current !== null) {
          window.clearInterval(typeTimer.current);
          typeTimer.current = null;
        }
        setTyping(false);
        setAutofilled(false);
        setPendingAccount(account.email);
        submitTimer.current = window.setTimeout(() => {
          void runLogin({ email: account.email, password: account.password, remember: true });
        }, 260);
        passwordRef.current?.focus();
      }
    }, 30);
  };

  const handleEmailChange = (value: string): void => {
    if (typing) cancelTypewriter();
    setEmail(value);
  };

  const handlePasswordChange = (value: string): void => {
    if (typing) cancelTypewriter();
    setPassword(value);
  };

  const goToRecovery = (): void => {
    setMode('recovery');
    setRecoverySent(false);
    setFormError(null);
    setTouched({ email: false, password: false });
  };

  const backToLogin = (): void => {
    setMode('login');
    setRecoverySent(false);
    setFormError(null);
  };

  const fieldsVariants = reduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
        hidden: {},
        show: { transition: { staggerChildren: 0.07 } },
      };

  const fieldItem = reduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { duration: 0.34, ease: EASE_OUT_EXPO } },
      };

  return (
    <motion.form
      className="login"
      animate={controls}
      onSubmit={(event) => void handleSubmit(event)}
      noValidate
    >
      <header className="login__head">
        <h1 className="login__title">Iniciar sesión</h1>
        <p className="login__subtitle">Accede a tu consola de operaciones de TI.</p>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        {mode === 'login' ? (
          <motion.div
            key="login"
            className="login__panel"
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: -24 }}
            transition={reduced ? { duration: 0.16 } : SPRING.smooth}
          >
            <AnimatePresence initial={false}>
              {formError && (
                <motion.div
                  className={`auth-alert${formError.code === 'account_disabled' ? ' auth-alert--warn' : ''}`}
                  role="alert"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0, y: -6 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0, y: -6 }}
                  transition={reduced ? { duration: 0.16 } : TWEEN.fast}
                >
                  <IconAlert width={17} height={17} />
                  <span className="auth-alert__text">
                    {formError.message}
                    {formError.code === 'network' && (
                      <button
                        type="button"
                        className="auth-alert__retry"
                        onClick={() => {
                          const form = emailRef.current?.form;
                          form?.requestSubmit();
                        }}
                      >
                        Reintentar
                      </button>
                    )}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className={`login__fields${autofilled ? ' is-autofilled' : ''}`}
              variants={fieldsVariants}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={fieldItem}>
                <FloatingInput
                  id="login-email"
                  name="email"
                  type="email"
                  label="Correo electrónico"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                  error={emailError}
                  touched={touched.email}
                  valid={email.length > 0 && !emailError}
                  icon={<IconMail width={18} height={18} />}
                  autoComplete="email"
                  autoFocus
                  disabled={locked}
                  inputRef={emailRef}
                />
              </motion.div>

              <motion.div variants={fieldItem}>
                <PasswordInput
                  id="login-password"
                  label="Contraseña"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                  error={passwordError}
                  touched={touched.password}
                  valid={password.length > 0 && !passwordError}
                  autoComplete="current-password"
                  disabled={locked}
                  inputRef={passwordRef}
                />
              </motion.div>

              <motion.div className="login__row" variants={fieldItem}>
                <Checkbox
                  checked={remember}
                  onChange={setRemember}
                  label="Recordarme"
                  disabled={locked}
                />
                <button type="button" className="link-button" onClick={goToRecovery}>
                  ¿Olvidaste tu contraseña?
                </button>
              </motion.div>

              <motion.div variants={fieldItem}>
                <SubmitButton state={submitState} disabled={locked} />
              </motion.div>

              {locked && (
                <p className="login__lock" aria-live="polite">
                  Bloqueado temporalmente. Reintenta en {lockRemaining} s.
                </p>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="recovery"
            className="login__panel"
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: 24 }}
            transition={reduced ? { duration: 0.16 } : SPRING.smooth}
          >
            <button type="button" className="link-button login__back" onClick={backToLogin}>
              <IconChevronLeft width={16} height={16} />
              Volver
            </button>

            {recoverySent ? (
              <motion.div
                className="recovery-done"
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduced ? { duration: 0.16 } : TWEEN.base}
              >
                <p className="recovery-done__title">Revisa tu correo</p>
                <p className="recovery-done__text">
                  Si <strong>{email}</strong> está registrado, recibirás un enlace para
                  restablecer tu contraseña.
                </p>
              </motion.div>
            ) : (
              <div className="login__fields">
                <p className="login__recovery-copy">
                  Introduce tu correo y te enviaremos las instrucciones para recuperar el acceso.
                </p>
                <FloatingInput
                  id="recovery-email"
                  name="email"
                  type="email"
                  label="Correo electrónico"
                  value={email}
                  onChange={setEmail}
                  onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                  error={emailError}
                  touched={touched.email}
                  icon={<IconMail width={18} height={18} />}
                  autoComplete="email"
                  inputRef={emailRef}
                />
                <SubmitButton state={submitState} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {mode === 'login' && demoAccounts.length > 0 && (
        <DemoAccounts
          accounts={demoAccounts}
          onPick={handlePickAccount}
          disabled={locked || submitState !== 'idle'}
          activeEmail={pendingAccount}
        />
      )}
    </motion.form>
  );
}
