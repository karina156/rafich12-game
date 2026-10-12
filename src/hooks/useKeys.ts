import { useEffect, useRef } from 'react';

/** Подписка на клавиши. handler получает event.key */
export function useKeyDown(handler: (key: string, e: KeyboardEvent) => void, active = true) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    if (!active) return;
    const on = (e: KeyboardEvent) => ref.current(e.key, e);
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [active]);
}

/** Удержание клавиш: возвращает ref с набором нажатых клавиш */
export function useHeldKeys(active = true) {
  const held = useRef(new Set<string>());
  useEffect(() => {
    if (!active) return;
    const set = held.current;
    const down = (e: KeyboardEvent) => { set.add(e.key); if (e.key.startsWith('Arrow')) e.preventDefault(); };
    const up = (e: KeyboardEvent) => set.delete(e.key);
    const blur = () => set.clear();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, [active]);
  return held;
}
