import { useEffect, useState } from 'react';

/**
 * Detecta si Bloq Mayús está activo. Se apoya en `getModifierState`
 * de los eventos de teclado (funciona en keydown y keyup).
 */
export function useCapsLock(): boolean {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const handle = (event: KeyboardEvent): void => {
      if (typeof event.getModifierState !== 'function') return;
      setActive(event.getModifierState('CapsLock'));
    };

    window.addEventListener('keydown', handle);
    window.addEventListener('keyup', handle);
    return () => {
      window.removeEventListener('keydown', handle);
      window.removeEventListener('keyup', handle);
    };
  }, []);

  return active;
}
