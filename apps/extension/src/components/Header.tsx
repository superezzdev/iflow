import type { FC } from 'react';
import { Sparkles, ArrowLeft, LayoutDashboard, Settings as SettingsIcon, Home } from 'lucide-react';
import { APP_NAME } from '@mindpost/shared';

export type ExtensionScreen = 'popup' | 'dashboard' | 'capture-status' | 'review' | 'settings';

export interface HeaderProps {
  currentScreen: ExtensionScreen;
  onNavigate: (screen: ExtensionScreen) => void;
  titleOverride?: string;
}

export const Header: FC<HeaderProps> = ({ currentScreen, onNavigate, titleOverride }) => {
  const isHome = currentScreen === 'popup';

  return (
    <header className="flex items-center justify-between px-3.5 py-2.5 bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="flex items-center space-x-2">
        {!isHome ? (
          <button
            type="button"
            onClick={() => onNavigate('popup')}
            className="p-1 -ml-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <div className="p-1.5 bg-brand-600 rounded-lg text-white shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        )}

        <div>
          <h1 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            {titleOverride || APP_NAME}
          </h1>
          <p className="text-[10px] text-slate-400 font-normal">
            {isHome ? 'Turn what you learn into what you share' : currentScreen.replace('-', ' ').toUpperCase()}
          </p>
        </div>
      </div>

      {/* Navigation shortcuts */}
      <div className="flex items-center space-x-1">
        <button
          type="button"
          onClick={() => onNavigate('popup')}
          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
            currentScreen === 'popup'
              ? 'text-brand-600 bg-brand-50'
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}
          title="Home"
        >
          <Home className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
            currentScreen === 'dashboard'
              ? 'text-brand-600 bg-brand-50'
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}
          title="Dashboard"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onNavigate('settings')}
          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
            currentScreen === 'settings'
              ? 'text-brand-600 bg-brand-50'
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}
          title="Settings"
        >
          <SettingsIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
