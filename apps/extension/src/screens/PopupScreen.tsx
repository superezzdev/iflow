import type { FC } from 'react';
import { MessageSquare, ArrowRight, LayoutDashboard, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { Button } from '../components/ui/Button';
import type { ExtensionScreen } from '../components/Header';

export interface PopupScreenProps {
  onNavigate: (screen: ExtensionScreen) => void;
}

export const PopupScreen: FC<PopupScreenProps> = ({ onNavigate }) => {
  return (
    <div className="p-4 space-y-4">
      {/* Hero Welcome Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 text-white p-4 rounded-xl shadow-sm border border-slate-800">
        <div className="flex items-center space-x-2 mb-2">
          <span className="p-1 bg-brand-500/20 text-brand-300 rounded-md border border-brand-400/30">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <span className="text-[11px] font-semibold tracking-wide uppercase text-brand-300">
            MindPost Assistant
          </span>
        </div>
        <h2 className="text-base font-bold tracking-tight text-white leading-snug">
          &ldquo;Turn what you learn into what you share.&rdquo;
        </h2>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          Capture problem-solving discussions from ChatGPT and transform them into high-value LinkedIn content.
        </p>

        {/* Source Status Pill */}
        <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Target Chat:</span>
          <StatusIndicator sourceName="ChatGPT" state="ready" />
        </div>
      </div>

      {/* Primary & Secondary Actions */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs font-semibold text-slate-900">Quick Actions</span>
          <span className="text-[10px] text-slate-400 font-medium">Phase 1</span>
        </div>

        {/* Primary Action */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          icon={<MessageSquare className="w-4 h-4" />}
          iconPosition="left"
          onClick={() => onNavigate('capture-status')}
        >
          Capture this conversation
        </Button>

        {/* Secondary Action */}
        <Button
          variant="outline"
          size="md"
          fullWidth
          icon={<LayoutDashboard className="w-3.5 h-3.5" />}
          iconPosition="left"
          onClick={() => onNavigate('dashboard')}
        >
          Open Dashboard
        </Button>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div
          onClick={() => onNavigate('dashboard')}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="p-1 bg-blue-50 text-blue-600 rounded-md">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </div>
          <h4 className="text-xs font-semibold text-slate-900">Detected Insights</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Core takeaways & hooks</p>
        </div>

        <div
          onClick={() => onNavigate('review')}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="p-1 bg-emerald-50 text-emerald-600 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </div>
          <h4 className="text-xs font-semibold text-slate-900">Post Reviewer</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Edit & approve drafts</p>
        </div>
      </div>

      {/* Privacy guarantee notice */}
      <div className="flex items-center space-x-2 px-3 py-2 bg-slate-100 rounded-lg text-slate-600">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span className="text-[10px]">
          Transcripts are processed safely without storing personal credentials.
        </span>
      </div>
    </div>
  );
};
