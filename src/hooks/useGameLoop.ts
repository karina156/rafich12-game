import { useEffect, useRef } from 'react';
import { useGame } from '../store/gameStore';

/**
 * requestAnimationFrame-цикл. dt — секунды с прошлого кадра (не больше 0.05,
 * чтобы после сворачивания вкладки ничего не «телепортировалось»).
 * Цикл стоит на паузе, пока открыто меню паузы, и останавливается при размонтировании.
 */
export function useGameLoop(fn: (dt: number) => void, running: boolean) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!useGame.getState().paused && !document.hidden) fnRef.current(dt);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [running]);
}
