import { useState, type FC } from 'react';
import {
  Sparkles,
  Server,
  ToggleLeft,
  ToggleRight,
  Shield,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import type { ExtensionScreen } from '../components/Header';

export interface SettingsScreenProps {
  onNavigate: (screen: ExtensionScreen) => void;
}

export const SettingsScreen: FC<SettingsScreenProps> = ({ onNavigate }) => {
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini' | 'claude'>('openai');
  const [isCaptureEnabled, setIsCaptureEnabled] = useState<boolean>(true);
  const [stripPII, setStripPII] = useState<boolean>(true);
  const [localOnlyMode, setLocalOnlyMode] = useState<boolean>(false);
  const [clearStatus, setClearStatus] = useState<string | null>(null);

  const handleClearData = () => {
    if (window.confirm('Clear all captured conversation transcripts and local post drafts?')) {
      setClearStatus('Local data cleared successfully');
      setTimeout(() => setClearStatus(null), 2500);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* 1. AI Provider Selection */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <h3 className="text-xs font-bold text-slate-900">AI Provider</h3>
          </div>
          <span className="text-[10px] text-slate-400">Phase 1 Provider</span>
        </div>

        <div className="space-y-1.5">
          {[
            {
              id: 'openai' as const,
              name: 'OpenAI (GPT-4o)',
              status: 'Active',
              badgeVariant: 'success' as const,
              description: 'Primary generation engine for Phase 1'
            },
            {
              id: 'gemini' as const,
              name: 'Google Gemini 1.5 Pro',
              status: 'Phase 2',
              badgeVariant: 'neutral' as const,
              description: 'Scheduled in multi-provider roadmap'
            },
            {
              id: 'claude' as const,
              name: 'Anthropic Claude 3.5',
              status: 'Phase 2',
              badgeVariant: 'neutral' as const,
              description: 'Scheduled in multi-provider roadmap'
            }
          ].map((provider) => {
            const isSelected = selectedProvider === provider.id;
            const isPhase1 = provider.id === 'openai';

            return (
              <div
                key={provider.id}
                onClick={() => isPhase1 && setSelectedProvider(provider.id)}
                className={`p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-400/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                } ${!isPhase1 ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-900">{provider.name}</span>
                    <Badge variant={provider.badgeVariant} size="sm">
                      {provider.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">{provider.description}</p>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300'
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. API Configuration Status */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center space-x-2 pb-1.5 border-b border-slate-100">
          <Server className="w-3.5 h-3.5 text-slate-600" />
          <h3 className="text-xs font-bold text-slate-900">API Service Status</h3>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Backend Endpoint:</span>
            <span className="font-mono text-slate-800 font-medium">http://localhost:3001/api</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Connection:</span>
            <span className="inline-flex items-center text-emerald-700 font-semibold gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Connected (Ready)
            </span>
          </div>
        </div>
      </div>

      {/* 3. Capture Controls & Privacy Settings */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center space-x-2 pb-1.5 border-b border-slate-100">
          <Shield className="w-3.5 h-3.5 text-slate-600" />
          <h3 className="text-xs font-bold text-slate-900">Capture & Privacy Settings</h3>
        </div>

        {/* Toggle: Capture enabled/disabled */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-800">Conversation Capture</span>
            <p className="text-[10px] text-slate-500">Allow extension to detect ChatGPT chat tabs</p>
          </div>
          <button
            type="button"
            onClick={() => setIsCaptureEnabled((prev) => !prev)}
            className="text-brand-600 cursor-pointer focus:outline-none"
          >
            {isCaptureEnabled ? (
              <ToggleRight className="w-6 h-6 text-brand-600" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-slate-400" />
            )}
          </button>
        </div>

        {/* Toggle: Privacy PII Stripping */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-2">
          <div>
            <span className="text-xs font-semibold text-slate-800">PII Redaction</span>
            <p className="text-[10px] text-slate-500">Filter emails and personal names prior to AI analysis</p>
          </div>
          <button
            type="button"
            onClick={() => setStripPII((prev) => !prev)}
            className="text-brand-600 cursor-pointer focus:outline-none"
          >
            {stripPII ? (
              <ToggleRight className="w-6 h-6 text-brand-600" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-slate-400" />
            )}
          </button>
        </div>

        {/* Toggle: Local Only Storage */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-2">
          <div>
            <span className="text-xs font-semibold text-slate-800">Local-Only Cache</span>
            <p className="text-[10px] text-slate-500">Retain conversation drafts solely on local browser</p>
          </div>
          <button
            type="button"
            onClick={() => setLocalOnlyMode((prev) => !prev)}
            className="text-brand-600 cursor-pointer focus:outline-none"
          >
            {localOnlyMode ? (
              <ToggleRight className="w-6 h-6 text-brand-600" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* 4. Data Management: Clear Captured Data */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-slate-900">Clear Local Storage</h4>
            <p className="text-[10px] text-slate-500">Remove cached transcripts, drafts, and preferences</p>
          </div>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={handleClearData}
          >
            Clear Data
          </Button>
        </div>

        {clearStatus && (
          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{clearStatus}</span>
          </div>
        )}
      </div>

      {/* Back button */}
      <div className="pt-1 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('popup')}>
          ← Back to Popup
        </Button>
        <span className="text-[10px] text-slate-400">MindPost v0.1.0</span>
      </div>
    </div>
  );
};
