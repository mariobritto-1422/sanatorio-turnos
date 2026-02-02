'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface BotonGiganteProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}

export function BotonGigante({
  children,
  onClick,
  icon: Icon,
  variant = 'primary',
  disabled = false,
  type = 'button',
  className,
}: BotonGiganteProps) {
  const variantClasses = {
    primary: 'btn-gigante-primary',
    secondary: 'btn-gigante-secondary',
    success: 'btn-gigante-success',
    danger: 'btn-gigante-danger',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        variantClasses[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {Icon && <Icon size={48} strokeWidth={2.5} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}
