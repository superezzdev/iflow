import type { FC } from 'react';

export type ConnectionState = 'ready' | 'capturing' | 'idle' | 'unsupported';

export interface StatusIndicatorProps {
  sourceName?: string;
  state?: ConnectionState;
  className?: string;
}

export const StatusIndicator: FC<StatusIndicatorProps> = ({
  sourceName = 'ChatGPT',
  state = 'ready',
  className = ''
}) => {
  const stateConfig: Record<
    ConnectionState,
    { label: string; dotColor: string; ping: boolean; containerBg: string; textColor: string }
  > = {
    ready: {
      label: 'Ready',
      dotColor: 'bg-emerald-500',
      ping: true,
      containerBg: 'bg-emerald-50 border-emerald-200',
      textColor: 'text-emerald-800'
    },
    capturing: {
      label: 'Capturing...',
      dotColor: 'bg-brand-500',
      ping: true,
      containerBg: 'bg-brand-50 border-brand-200',
      textColor: 'text-brand-800'
    },
    idle: {
      label: 'Idle',
      dotColor: 'bg-slate-400',
      ping: false,
      containerBg: 'bg-slate-50 border-slate-200',
      textColor: 'text-slate-700'
    },
    unsupported: {
      label: 'Not on ChatGPT',
      dotColor: 'bg-amber-500',
      ping: false,
      containerBg: 'bg-amber-50 border-amber-200',
      textColor: 'text-amber-800'
    }
  };

  const config = stateConfig[state];

  return (
    <div
      className={`inline-flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-medium ${config.containerBg} ${className}`}
    >
      <span className="font-semibold text-slate-900 mr-2">{sourceName}</span>
      <div className="flex items-center space-x-1.5">
        <span className="relative flex h-2 w-2">
          {config.ping && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotColor}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`} />
        </span>
        <span className={`text-[11px] font-medium ${config.textColor}`}>{config.label}</span>
      </div>
    </div>
  );
};
