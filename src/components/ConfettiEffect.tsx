import { useMemo } from 'react';

const COLORS = ['var(--pink)', 'var(--lavender)', 'var(--yellow)', 'var(--mint)', 'var(--sky)', 'var(--heart)', 'var(--peach)'];

/** Пиксельное конфетти (квадратики, CSS-анимация). count — количество частиц. */
export function ConfettiEffect({ count = 60, burst = false, seed = 0 }: { count?: number; burst?: boolean; seed?: number }) {
  const parts = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      left: Math.random() * 100,
      delay: burst ? Math.random() * 0.2 : Math.random() * 2.5,
      dur: 1.6 + Math.random() * 1.8,
      size: 6 + Math.floor(Math.random() * 3) * 3,
      color: COLORS[i % COLORS.length],
      dx: (Math.random() - 0.5) * 200,
      rot: Math.random() * 720,
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, burst, seed],
  );
  return (
    <div className={`confetti ${burst ? 'confetti-burst' : ''}`} aria-hidden>
      {parts.map((p, i) => (
        <span
          key={i}
          style={{
            left: `${p.left}%`, width: p.size, height: p.size, background: p.color,
            animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`,
            ['--dx' as string]: `${p.dx}px`, ['--rot' as string]: `${p.rot}deg`,
          }}
        />
      ))}
    </div>
  );
}
