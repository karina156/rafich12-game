import type { ReactNode } from 'react';
import { Panel } from './Panel';

export function Modal({ title, children, onClose, wide }: {
  title?: string; children: ReactNode; onClose?: () => void; wide?: boolean;
}) {
  return (
    <div className="modal-back" onClick={onClose}>
      <Panel className={`modal ${wide ? 'modal-wide' : ''}`}>
        <div onClick={(e) => e.stopPropagation()} className="modal-body">
          {title && <h2 className="modal-title">{title}</h2>}
          {onClose && (
            <button className="modal-x" onClick={onClose} aria-label="Закрыть">✕</button>
          )}
          {children}
        </div>
      </Panel>
    </div>
  );
}
