import { useState, useEffect, type FC } from 'react';
import {
  MessageSquare,
  ArrowRight,
  LayoutDashboard,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { StatusIndicator, type ConnectionState } from '../components/ui/StatusIndicator';
import { Button } from '../components/ui/Button';
import { saveCapturedConversation } from '../utils/storage';
import type { ExtensionScreen } from '../components/Header';
import type { ParserResult, CapturedConversation } from '@mindpost/shared';

export interface PopupScreenProps {
  onNavigate: (screen: ExtensionScreen) => void;
  onConversationCaptured?: (conversation: CapturedConversation) => void;
}

export const PopupScreen: FC<PopupScreenProps> = ({ onNavigate, onConversationCaptured }) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [activeTabUrl, setActiveTabUrl] = useState<string>('');
  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  // Check active tab on mount
  useEffect(() => {
    async function checkCurrentTab() {
      if (typeof chrome !== 'undefined' && chrome.tabs?.query) {
        try {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tab && tab.id) {
            setActiveTabId(tab.id);
            const url = tab.url || '';
            setActiveTabUrl(url);

            const isChatGPT =
              url.includes('chatgpt.com') || url.includes('chat.openai.com');

            if (isChatGPT) {
              setConnectionState('ready');
            } else {
              setConnectionState('unsupported');
            }
          }
        } catch {
          setConnectionState('idle');
        }
      } else {
        // Fallback in non-extension / dev environments
        setConnectionState('ready');
        setActiveTabUrl('https://chatgpt.com/c/example-thread');
      }
    }

    checkCurrentTab();
  }, []);

  const handleCapture = async () => {
    setIsCapturing(true);
    setCaptureError(null);

    // If running in browser extension runtime with active tab
    if (typeof chrome !== 'undefined' && chrome.tabs?.sendMessage && activeTabId) {
      try {
        const response = (await chrome.tabs.sendMessage(activeTabId, {
          type: 'CAPTURE_CONVERSATION'
        })) as ParserResult | undefined;

        if (response && response.success && response.conversation) {
          await saveCapturedConversation(response.conversation);
          if (onConversationCaptured) {
            onConversationCaptured(response.conversation);
          }
          setIsCapturing(false);
          onNavigate('capture-status');
          return;
        } else {
          setCaptureError(
            response?.error?.message ||
              'Could not extract conversation content. Please ensure an active chat thread is open.'
          );
        }
      } catch (err) {
        // Content script might not be injected yet or tab reloaded
        setCaptureError(
          'Could not connect to ChatGPT page script. Please refresh the ChatGPT tab and try again.'
        );
      }
    } else {
      // Development / Test mode mock capture
      const mockConversation: CapturedConversation = {
        id: `conv_${Date.now()}`,
        source: 'chatgpt',
        title: 'PostgreSQL Connection Pooling in Serverless Next.js',
        url: activeTabUrl || 'https://chatgpt.com/c/example',
        capturedAt: new Date().toISOString(),
        totalMessages: 4,
        messages: [
          {
            id: 'msg_1',
            role: 'user',
            content: 'How do I properly configure connection pooling with Prisma in Next.js serverless functions?',
            timestamp: new Date().toISOString(),
            orderIndex: 0
          },
          {
            id: 'msg_2',
            role: 'assistant',
            content: 'To configure Prisma connection pooling in serverless Next.js:\n1. Pin client on globalThis\n2. Use PgBouncer / Accelerate\n3. Keep query timeouts low',
            timestamp: new Date().toISOString(),
            orderIndex: 1
          }
        ]
      };

      await saveCapturedConversation(mockConversation);
      if (onConversationCaptured) {
        onConversationCaptured(mockConversation);
      }
      setIsCapturing(false);
      onNavigate('capture-status');
      return;
    }

    setIsCapturing(false);
  };

  const handleOpenChatGPT = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
      chrome.tabs.create({ url: 'https://chatgpt.com' });
    } else {
      window.open('https://chatgpt.com', '_blank');
    }
  };

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
          <StatusIndicator sourceName="ChatGPT" state={connectionState} />
        </div>
      </div>

      {/* Capture Action Container */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs font-semibold text-slate-900">Conversation Capture</span>
          <span className="text-[10px] text-slate-400 font-medium">Explicit Trigger</span>
        </div>

        {/* Primary Action Button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          icon={<MessageSquare className="w-4 h-4" />}
          iconPosition="left"
          isLoading={isCapturing}
          disabled={connectionState === 'unsupported' && typeof chrome !== 'undefined' && !activeTabUrl.includes('chatgpt')}
          onClick={handleCapture}
        >
          {isCapturing ? 'Extracting conversation...' : 'Capture this conversation'}
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

      {/* Unsupported Tab Notice */}
      {connectionState === 'unsupported' && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Active tab is not ChatGPT</span>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Open a ChatGPT conversation to extract insights and generate posts.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            fullWidth
            icon={<ExternalLink className="w-3 h-3" />}
            onClick={handleOpenChatGPT}
            className="bg-white border-amber-300 text-amber-900 hover:bg-amber-100"
          >
            Open ChatGPT
          </Button>
        </div>
      )}

      {/* Capture Error Banner */}
      {captureError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs text-rose-900">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Capture Failed</span>
              <p className="text-[11px] text-rose-700 mt-0.5">{captureError}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            fullWidth
            icon={<RefreshCw className="w-3 h-3" />}
            onClick={handleCapture}
            className="bg-white border-rose-300 text-rose-900 hover:bg-rose-100"
          >
            Retry Capture
          </Button>
        </div>
      )}

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div
          onClick={() => onNavigate('dashboard')}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="p-1 bg-blue-50 text-blue-600 rounded-md">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </div>
          <h4 className="text-xs font-semibold text-slate-900">Saved Conversations</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">View local captures</p>
        </div>

        <div
          onClick={() => onNavigate('review')}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer group shadow-2xs"
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
      <div className="flex items-center space-x-2 px-3 py-2 bg-slate-200/60 rounded-lg text-slate-600">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span className="text-[10px]">
          MindPost captures only when explicitly clicked. No background browsing scraping.
        </span>
      </div>
    </div>
  );
};
