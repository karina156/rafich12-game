import type { ReactNode } from 'react';

export function Tooltip({ text, children, show = true }: { text: string; children: ReactNode; show?: boolean }) {
  return (
    <span className="tooltip-wrap">
      {children}
      {show && <span className="tooltip">{text}</span>}
    </span>
  );
}
