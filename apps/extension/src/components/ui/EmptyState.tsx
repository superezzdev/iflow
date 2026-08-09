import type { FC, ReactNode } from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-6 text-center bg-white rounded-xl border border-slate-200 shadow-2xs ${className}`}
    >
      <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 shrink-0">
        {icon}
      </div>
      <h4 className="text-xs font-semibold text-slate-900 mb-1">{title}</h4>
      <p className="text-[11px] text-slate-500 max-w-[260px] leading-relaxed mb-3">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
