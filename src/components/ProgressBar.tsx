export function ProgressBar({ value, max, color = 'var(--heart)', label, segments }: {
  value: number; max: number; color?: string; label?: string; segments?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={`pbar ${segments ? 'pbar-seg' : ''}`} role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      <div className="pbar-fill" style={{ width: `${pct}%`, background: color }} />
      {label && <span className="pbar-label">{label}</span>}
    </div>
  );
}
