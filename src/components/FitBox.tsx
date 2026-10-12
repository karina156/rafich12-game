import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Вписывает сцену фиксированного логического размера (w×h) в доступное место,
 * сохраняя пропорции — спрайты не растягиваются и масштаб одинаков для всех.
 */
export function FitBox({ w, h, children, className = '' }: { w: number; h: number; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const s = Math.min(el.clientWidth / w, el.clientHeight / h);
      setScale(s > 0 ? s : 1);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, h]);
  return (
    <div ref={ref} className={`fitbox ${className}`}>
      <div className="fitbox-inner" style={{ width: w, height: h, transform: `translate(-50%, -50%) scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}
