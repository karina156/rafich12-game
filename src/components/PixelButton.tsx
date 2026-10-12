import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { sound } from '../audio/sound';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'pink' | 'mint' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  silent?: boolean;
}

/** Пиксельная кнопка: состояния idle / hover / pressed / disabled. Текст всегда React-текстом. */
export function PixelButton({ variant = 'primary', size = 'md', className = '', children, onClick, silent, ...rest }: Props) {
  return (
    <button
      type="button"
      className={`pbtn pbtn-${variant} pbtn-${size} ${className}`}
      onPointerEnter={() => !rest.disabled && sound.play('hover')}
      onClick={(e) => {
        if (!silent) sound.play('click');
        onClick?.(e);
      }}
      {...rest}
    >
      <span className="pbtn-inner">{children}</span>
    </button>
  );
}
