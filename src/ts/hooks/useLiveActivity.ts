import { useCallback, useEffect, useRef, useState } from 'react';

interface UseLiveActivityOptions<T> {
  /** Habilita la simulación en vivo. */
  enabled?: boolean;
  /** Intervalo en milisegundos entre eventos. */
  intervalMs?: number;
  /** Máximo de elementos conservados. */
  limit?: number;
  /** Fábrica del siguiente evento en vivo. */
  generate: () => T;
}

interface LiveActivity<T extends { id: string }> {
  items: T[];
  latestId: string | null;
  push: (item: T) => void;
  reset: (items: T[]) => void;
}

/**
 * Lista acotada de actividad con Tick en vivo.
 * Cada `intervalMs` se inserta un elemento nuevo al principio y
 * `latestId` permite resaltar el recién llegado.
 */
export function useLiveActivity<T extends { id: string }>(
  initialItems: T[],
  { enabled = true, intervalMs = 15_000, limit = 10, generate }: UseLiveActivityOptions<T>,
): LiveActivity<T> {
  const [items, setItems] = useState<T[]>(initialItems);
  const [latestId, setLatestId] = useState<string | null>(null);
  const generateRef = useRef(generate);
  generateRef.current = generate;

  const push = useCallback(
    (item: T) => {
      setItems((current) => [item, ...current].slice(0, limit));
      setLatestId(item.id);
    },
    [limit],
  );

  const reset = useCallback((next: T[]) => {
    setItems(next);
    setLatestId(null);
  }, []);

  useEffect(() => {
    setItems(initialItems);
    setLatestId(null);
  }, [initialItems]);

  useEffect(() => {
    if (!enabled) return;

    const timer = window.setInterval(() => {
      push(generateRef.current());
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [enabled, intervalMs, push]);

  return { items, latestId, push, reset };
}