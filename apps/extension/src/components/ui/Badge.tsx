import type { FC, ReactNode } from 'react';

export type BadgeVariant = 'brand' | 'success' | 'warning' | 'danger' | 'neutral' | 'linkedin';

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  icon?: ReactNode;
}

export const Badge: FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  icon
}) => {
  const sizeStyles = {
    sm: 'px-1.5 py-0.5 text-[10px] gap-1 font-medium',
    md: 'px-2.5 py-0.5 text-xs gap-1.5 font-medium'
  };

  const variantStyles: Record<BadgeVariant, string> = {
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    linkedin: 'bg-[#0a66c2]/10 text-[#0a66c2] border-[#0a66c2]/20 font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
