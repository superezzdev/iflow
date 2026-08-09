import { useState, type FC } from 'react';
import { Header } from '../../components/Header';
import { LinkedinIcon } from '../../components/LinkedinIcon';
import { Sparkles, MessageSquare, CheckCircle2, ArrowRight } from 'lucide-react';

export const App: FC = () => {
  const [currentStep] = useState<number>(1);

  return (
    <div className="w-[400px] min-h-[520px] bg-slate-50 flex flex-col justify-between text-slate-800 text-sm">
      <div>
        <Header />

        <div className="p-4 space-y-4">
          {/* Workflow progress indicator */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium pb-2 border-b border-slate-100">
              <span>Pipeline Progress</span>
              <span className="text-brand-600 font-semibold">Step {currentStep} of 4</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 mt-3">
              {[
                { label: 'Capture', icon: MessageSquare },
                { label: 'Insights', icon: Sparkles },
                { label: 'LinkedIn', icon: LinkedinIcon },
                { label: 'Save', icon: CheckCircle2 }
              ].map((step, idx) => {
                const Icon = step.icon;
                const isActive = idx + 1 === currentStep;
                const isPassed = idx + 1 < currentStep;

                return (
                  <div
                    key={step.label}
                    className={`flex flex-col items-center p-2 rounded-lg text-center transition-all ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-semibold ring-1 ring-brand-300'
                        : isPassed
                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                        : 'bg-slate-50 text-slate-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 mb-1" />
                    <span className="text-[10px]">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main action card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-900">ChatGPT Conversation Capture</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Open a ChatGPT chat tab and click below to extract key insights and generate a LinkedIn post.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-medium text-xs shadow-sm transition-colors cursor-pointer"
                disabled
              >
                <span>Capture & Generate Post</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-2">
                Phase 1 Core Pipeline Ready for Implementation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <footer className="p-3 bg-white border-t border-slate-200 text-center">
        <p className="text-[11px] text-slate-400">
          MindPost Extension v0.1.0 • LinkedIn Creator Edition
        </p>
      </footer>
    </div>
  );
};

export default App;
