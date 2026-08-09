import type { FC } from 'react';
import { Sparkles } from 'lucide-react';
import { APP_NAME } from '@mindpost/shared';

export const Header: FC = () => {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
      <div className="flex items-center space-x-2">
        <div className="p-1.5 bg-brand-500 rounded-lg text-white shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-slate-900 tracking-tight">{APP_NAME}</h1>
          <p className="text-[10px] text-slate-500 font-medium">AI Insights to LinkedIn</p>
        </div>
      </div>
      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
        Phase 1
      </span>
    </header>
  );
};
