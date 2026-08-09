import { useState, useEffect, type FC } from 'react';
import {
  MessageSquare,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  LayoutDashboard,
  User,
  Bot
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { getLatestCapturedConversation } from '../utils/storage';
import type { ExtensionScreen } from '../components/Header';
import type { CapturedConversation } from '@mindpost/shared';

export interface CaptureStatusScreenProps {
  onNavigate: (screen: ExtensionScreen) => void;
  conversation?: CapturedConversation | null;
}

export const CaptureStatusScreen: FC<CaptureStatusScreenProps> = ({
  onNavigate,
  conversation: propConversation
}) => {
  const [conversation, setConversation] = useState<CapturedConversation | null>(
    propConversation || null
  );
  const [isLoading, setIsLoading] = useState<boolean>(!propConversation);

  useEffect(() => {
    if (!propConversation) {
      getLatestCapturedConversation().then((latest) => {
        setConversation(latest);
        setIsLoading(false);
      });
    }
  }, [propConversation]);

  const userMessagesCount =
    conversation?.messages.filter((m) => m.role === 'user').length || 0;
  const assistantMessagesCount =
    conversation?.messages.filter((m) => m.role === 'assistant').length || 0;

  return (
    <div className="p-4 space-y-4">
      {/* Status Banner */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Conversation Captured</h3>
              <p className="text-[10px] text-emerald-600 font-medium">Ready for insight extraction</p>
            </div>
          </div>
          <StatusIndicator sourceName="ChatGPT" state="ready" />
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
          Loading conversation data...
        </div>
      ) : conversation ? (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
          {/* Title & Metadata */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Badge variant="brand" size="sm">
                ChatGPT Capture
              </Badge>
              <span className="text-[10px] text-slate-400">
                {new Date(conversation.capturedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 leading-snug">
              {conversation.title}
            </h4>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 text-center">
            <div className="p-1">
              <span className="text-[10px] text-slate-400 block">Total Turns</span>
              <span className="text-xs font-bold text-slate-800">
                {conversation.totalMessages}
              </span>
            </div>
            <div className="p-1 border-x border-slate-200">
              <span className="text-[10px] text-slate-400 block">Questions</span>
              <span className="text-xs font-bold text-brand-600">
                {userMessagesCount}
              </span>
            </div>
            <div className="p-1">
              <span className="text-[10px] text-slate-400 block">AI Answers</span>
              <span className="text-xs font-bold text-emerald-600">
                {assistantMessagesCount}
              </span>
            </div>
          </div>

          {/* Message Turns Preview List */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-700 block">
              Captured Transcript Preview
            </span>
            <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
              {conversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2.5 rounded-lg border text-[11px] space-y-1 ${
                    msg.role === 'user'
                      ? 'bg-blue-50/60 border-blue-100 text-slate-800'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-slate-500">
                    {msg.role === 'user' ? (
                      <User className="w-3 h-3 text-blue-600" />
                    ) : (
                      <Bot className="w-3 h-3 text-emerald-600" />
                    )}
                    <span className="capitalize">{msg.role}</span>
                  </div>
                  <p className="line-clamp-3 leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
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
                icon={<LayoutDashboard className="w-3 h-3" />}
                onClick={() => onNavigate('dashboard')}
              >
                View in Dashboard
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
        <div className="p-8 bg-white rounded-xl border border-slate-200 text-center space-y-3">
          <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-xs font-semibold text-slate-900">No active capture found</h4>
          <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
            Please navigate to an open ChatGPT tab and click &quot;Capture this conversation&quot;.
          </p>
          <Button variant="primary" size="sm" onClick={() => onNavigate('popup')}>
            Go to Capture Screen
          </Button>
        </div>
      )}
    </div>
  );
};
