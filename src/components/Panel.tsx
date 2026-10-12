import type { CSSProperties, ReactNode } from 'react';

export function Panel({ children, className = '', style, tone = 'cream' }: {
  children: ReactNode; className?: string; style?: CSSProperties; tone?: 'cream' | 'plum' | 'lavender';
}) {
  return <div className={`panel panel-${tone} ${className}`} style={style}>{children}</div>;
}
