import { useState, type FC } from 'react';
import { MessageSquare, Sparkles, CheckCircle2, ArrowRight, ArrowLeft, RefreshCw, Layers } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import type { ExtensionScreen } from '../components/Header';

export interface CaptureStatusScreenProps {
  onNavigate: (screen: ExtensionScreen) => void;
}

export const CaptureStatusScreen: FC<CaptureStatusScreenProps> = ({ onNavigate }) => {
  const [capturePhase, setCapturePhase] = useState<'idle' | 'scanning' | 'captured'>('captured');

  // Simulated capture preview metadata for UI demonstration
  const mockConversation = {
    title: 'PostgreSQL Connection Pooling Architecture in Serverless Next.js',
    source: 'chatgpt' as const,
    url: 'https://chatgpt.com/c/67890-abc-123',
    messageCount: 6,
    userTurns: 3,
    assistantTurns: 3,
    capturedAt: 'Just now'
  };

  return (
    <div className="p-4 space-y-4">
      {/* Status Banner */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-brand-50 text-brand-600 rounded-lg">
              <MessageSquare className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Conversation Capture Status</h3>
              <p className="text-[10px] text-slate-500">ChatGPT Session Inspector</p>
            </div>
          </div>
          <StatusIndicator sourceName="ChatGPT" state={capturePhase === 'scanning' ? 'capturing' : 'ready'} />
        </div>

        {/* Phase Timeline */}
        <div className="grid grid-cols-3 gap-1 pt-1">
          {[
            { phase: 'idle', label: '1. Detect Tab', icon: Layers },
            { phase: 'scanning', label: '2. Parse DOM', icon: RefreshCw },
            { phase: 'captured', label: '3. Captured', icon: CheckCircle2 }
          ].map((step) => {
            const isCurrent = capturePhase === step.phase;
            const isCompleted = capturePhase === 'captured';

            return (
              <div
                key={step.label}
                className={`p-2 rounded-lg text-center flex flex-col items-center border transition-all ${
                  isCurrent || isCompleted
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <step.icon className={`w-3.5 h-3.5 mb-1 ${isCurrent ? 'animate-pulse' : ''}`} />
                <span className="text-[10px]">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Captured Conversation Details Card */}
      {capturePhase === 'captured' ? (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <Badge variant="brand" size="sm" className="mb-1.5">
                Ready for Extraction
              </Badge>
              <h4 className="text-xs font-bold text-slate-900 leading-snug">
                {mockConversation.title}
              </h4>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-600 border border-slate-100">
            <div>
              <span className="text-slate-400 block text-[10px]">Total Messages:</span>
              <span className="font-semibold text-slate-800">{mockConversation.messageCount} turns</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Captured:</span>
              <span className="font-semibold text-slate-800">{mockConversation.capturedAt}</span>
            </div>
            <div className="col-span-2 truncate">
              <span className="text-slate-400 block text-[10px]">Source URL:</span>
              <span className="font-mono text-[10px] text-slate-700">{mockConversation.url}</span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <Button
              variant="primary"
              size="md"
              fullWidth
              icon={<Sparkles className="w-3.5 h-3.5" />}
              onClick={() => onNavigate('review')}
            >
              Generate LinkedIn Post
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                icon={<RefreshCw className="w-3 h-3" />}
                onClick={() => setCapturePhase('scanning')}
              >
                Re-scan Tab
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowLeft className="w-3 h-3" />}
                onClick={() => onNavigate('popup')}
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-white rounded-xl border border-slate-200 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 mx-auto flex items-center justify-center animate-spin">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-semibold text-slate-900">Scanning active ChatGPT tab...</h4>
          <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
            Reading conversation DOM nodes with isolated selector heuristics.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCapturePhase('captured')}
          >
            Complete Simulated Scan
          </Button>
        </div>
      )}

      {/* Workflow Navigation info */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-600">Want to review saved posts?</span>
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center space-x-1 cursor-pointer"
        >
          <span>Open Dashboard</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
