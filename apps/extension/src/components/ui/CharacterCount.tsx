import type { FC } from 'react';
import { PLATFORM_LIMITS } from '@mindpost/shared';

export interface CharacterCountProps {
  count: number;
  max?: number;
  className?: string;
}

export const CharacterCount: FC<CharacterCountProps> = ({
  count,
  max = PLATFORM_LIMITS.LINKEDIN_MAX_CHARS,
  className = ''
}) => {
  const isOver = count > max;
  const isOptimal = count >= 800 && count <= 1800;

  const colorClass = isOver
    ? 'text-rose-600 font-semibold'
    : isOptimal
    ? 'text-emerald-600 font-medium'
    : 'text-slate-500';

  const percentage = Math.min(100, Math.round((count / max) * 100));

  return (
    <div className={`flex items-center space-x-2 text-[11px] ${className}`}>
      <div className="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden shrink-0">
        <div
          className={`h-full transition-all duration-200 ${
            isOver ? 'bg-rose-500' : isOptimal ? 'bg-emerald-500' : 'bg-brand-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={colorClass}>
        {count.toLocaleString()} / {max.toLocaleString()} chars
      </span>
    </div>
  );
};
