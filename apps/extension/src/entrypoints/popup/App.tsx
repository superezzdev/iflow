import { useState, type FC } from 'react';
import { Header, type ExtensionScreen } from '../../components/Header';
import { PopupScreen } from '../../screens/PopupScreen';
import { DashboardScreen } from '../../screens/DashboardScreen';
import { CaptureStatusScreen } from '../../screens/CaptureStatusScreen';
import { ReviewScreen } from '../../screens/ReviewScreen';
import { SettingsScreen } from '../../screens/SettingsScreen';

export const App: FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ExtensionScreen>('popup');

  return (
    <div className="w-[420px] min-h-[580px] bg-slate-100 flex flex-col justify-between text-slate-800 text-sm antialiased select-none font-sans">
      {/* Sticky Top Header */}
      <Header currentScreen={currentScreen} onNavigate={setCurrentScreen} />

      {/* Screen View Router */}
      <main className="flex-1 overflow-y-auto">
        {currentScreen === 'popup' && <PopupScreen onNavigate={setCurrentScreen} />}
        {currentScreen === 'dashboard' && <DashboardScreen onNavigate={setCurrentScreen} />}
        {currentScreen === 'capture-status' && <CaptureStatusScreen onNavigate={setCurrentScreen} />}
        {currentScreen === 'review' && <ReviewScreen onNavigate={setCurrentScreen} />}
        {currentScreen === 'settings' && <SettingsScreen onNavigate={setCurrentScreen} />}
      </main>

      {/* Bottom Footer Bar */}
      <footer className="px-3.5 py-2 bg-white border-t border-slate-200 text-center flex items-center justify-between text-[11px] text-slate-400">
        <span>MindPost Studio • Phase 1</span>
        <span className="capitalize text-slate-500 font-medium">{currentScreen.replace('-', ' ')}</span>
      </footer>
    </div>
  );
};

export default App;
