import { useEffect, useRef, useState } from 'react';

/** Пиксельная «шторка» между сценами: срабатывает при смене key */
export function PixelTransition({ sceneKey }: { sceneKey: string }) {
  const [on, setOn] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setOn(true);
    const t = window.setTimeout(() => setOn(false), 650);
    return () => window.clearTimeout(t);
  }, [sceneKey]);
  if (!on) return null;
  return (
    <div className="ptrans" aria-hidden>
      {Array.from({ length: 48 }, (_, i) => (
        <span key={i} style={{ animationDelay: `${((i * 7) % 48) * 6}ms` }} />
      ))}
    </div>
  );
}
