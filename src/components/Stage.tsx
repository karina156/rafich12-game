import type { ReactNode } from 'react';
import { useViewport } from '../hooks/useViewport';

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/**
 * Игровая сцена с логической «короткой стороной» 540px.
 * Горизонтально: высота 540, ширина подстраивается под экран (от 16:9 до ~2.2:1).
 * Вертикально: ширина 540, высота подстраивается (телефон без пустых полос).
 * Всё масштабируется одним коэффициентом — спрайты везде одного размера относительно сцены.
 */
export function Stage({ children }: { children: ReactNode }) {
  const { w, h, portrait } = useViewport();
  const size = portrait
    ? { w: 540, h: Math.round(clamp((540 * h) / w, 760, 1200)) }
    : { w: Math.round(clamp((540 * w) / h, 760, 1200)), h: 540 };
  const scale = Math.min(w / size.w, h / size.h);
  return (
    <div className="viewport">
      <div
        className={`stage ${portrait ? 'portrait' : 'landscape'}`}
        style={{ width: size.w, height: size.h, transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
