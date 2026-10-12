import { useEffect, useMemo, useRef } from 'react';

/**
 * Таймеры, которые гарантированно очищаются при уходе со сцены.
 * Использовать вместо голых setTimeout/setInterval внутри игр.
 */
export function useTimers() {
  const ids = useRef(new Set<number>());
  useEffect(() => {
    const set = ids.current;
    return () => {
      set.forEach((id) => { window.clearTimeout(id); window.clearInterval(id); });
      set.clear();
    };
  }, []);
  return useMemo(() => ({
    after(ms: number, fn: () => void) {
      const id = window.setTimeout(() => { ids.current.delete(id); fn(); }, ms);
      ids.current.add(id);
      return id;
    },
    every(ms: number, fn: () => void) {
      const id = window.setInterval(fn, ms);
      ids.current.add(id);
      return id;
    },
    clear(id: number | null | undefined) {
      if (id == null) return;
      window.clearTimeout(id);
      window.clearInterval(id);
      ids.current.delete(id);
    },
    clearAll() {
      ids.current.forEach((id) => { window.clearTimeout(id); window.clearInterval(id); });
      ids.current.clear();
    },
  }), []);
}

export const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
