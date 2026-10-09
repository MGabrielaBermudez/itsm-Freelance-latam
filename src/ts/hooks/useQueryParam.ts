import { useCallback } from 'react';

/** Estado persistido en la URL (?clave=valor) — sin dependencias extra. */
export function useQueryParam(key: string): [string | null, (value: string | null) => void] {
  const params = new URLSearchParams(window.location.search);
  const value = params.get(key);

  const setValue = useCallback(
    (next: string | null) => {
      const url = new URL(window.location.href);
      if (next === null || next === '') {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, next);
      }
      window.history.replaceState(null, '', url);
      window.dispatchEvent(new PopStateEvent('popstate'));
    },
    [key],
  );

  return [value, setValue];
}