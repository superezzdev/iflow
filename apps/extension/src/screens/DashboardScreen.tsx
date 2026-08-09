import { useState, useEffect, type FC } from 'react';
import {
  MessageSquare,
  Sparkles,
  FileText,
  CheckCircle2,
  ArrowRight,
  Trash2,
  Calendar
} from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  getCapturedConversations,
  deleteCapturedConversation
} from '../utils/storage';
import type { ExtensionScreen } from '../components/Header';
import type { CapturedConversation } from '@mindpost/shared';

export type DashboardTab = 'conversations' | 'insights' | 'drafts' | 'approved';

export interface DashboardScreenProps {
  onNavigate: (screen: ExtensionScreen) => void;
  onSelectConversation?: (conversation: CapturedConversation) => void;
}

export const DashboardScreen: FC<DashboardScreenProps> = ({
  onNavigate,
  onSelectConversation
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('conversations');
  const [conversations, setConversations] = useState<CapturedConversation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadConversations = async () => {
    setIsLoading(true);
    const data = await getCapturedConversations();
    setConversations(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Remove this captured conversation from local storage?')) {
      await deleteCapturedConversation(id);
      await loadConversations();
    }
  };

  const handleSelect = (conv: CapturedConversation) => {
    if (onSelectConversation) {
      onSelectConversation(conv);
    }
    onNavigate('capture-status');
  };

  return (
    <div className="p-4 space-y-4">
      {/* Tab Navigation Pill Bar */}
      <div className="flex items-center space-x-1 p-1 bg-slate-200/80 rounded-xl">
        {[
          { id: 'conversations' as const, label: 'Recent Chats', icon: MessageSquare },
          { id: 'insights' as const, label: 'Insights', icon: Sparkles },
          { id: 'drafts' as const, label: 'Drafts', icon: FileText },
          { id: 'approved' as const, label: 'Approved', icon: CheckCircle2 }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-1.5 px-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 mb-0.5 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Header */}
      <div className="flex items-center justify-between text-xs px-1">
        <span className="font-bold text-slate-900 capitalize">
          {activeTab === 'conversations' && `Recent Conversations (${conversations.length})`}
          {activeTab === 'insights' && 'Detected Insights'}
          {activeTab === 'drafts' && 'Draft Posts'}
          {activeTab === 'approved' && 'Approved Posts'}
        </span>
      </div>

      {/* 1. Recent Conversations Tab */}
      {activeTab === 'conversations' && (
        <>
          {isLoading ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
              Loading saved conversations...
            </div>
          ) : conversations.length > 0 ? (
            <div className="space-y-2.5">
              {conversations.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-brand-300 transition-all shadow-2xs space-y-2 cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold text-slate-900 group-hover:text-brand-700 leading-snug line-clamp-2">
                      {item.title}
                    </h4>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.id, e)}
                      className="text-slate-300 hover:text-rose-600 p-1 -mr-1 rounded-md transition-colors cursor-pointer"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Badge variant="neutral" size="sm">
                        {item.source}
                      </Badge>
                      <span>{item.totalMessages} turns</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(item.capturedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<MessageSquare className="w-5 h-5" />}
              title="No conversations captured yet."
              description="Open ChatGPT and capture a conversation to get started."
              actionLabel="Capture from ChatGPT"
              onAction={() => onNavigate('popup')}
            />
          )}
        </>
      )}

      {/* 2. Detected Insights Tab */}
      {activeTab === 'insights' && (
        <EmptyState
          icon={<Sparkles className="w-5 h-5" />}
          title="No detected insights yet."
          description="Capture an AI conversation to extract actionable key takeaways and thought leadership hooks."
          actionLabel="Start Capturing"
          onAction={() => onNavigate('popup')}
        />
      )}

      {/* 3. Draft Posts Tab */}
      {activeTab === 'drafts' && (
        <EmptyState
          icon={<FileText className="w-5 h-5" />}
          title="No draft posts currently in review."
          description="Generated LinkedIn post drafts will appear here for you to polish and approve."
          actionLabel="Generate New Draft"
          onAction={() => onNavigate('popup')}
        />
      )}

      {/* 4. Approved Posts Tab */}
      {activeTab === 'approved' && (
        <EmptyState
          icon={<CheckCircle2 className="w-5 h-5" />}
          title="No approved posts yet."
          description="When you approve generated LinkedIn posts, they are safely saved here for easy sharing."
          actionLabel="Review Drafts"
          onAction={() => setActiveTab('drafts')}
        />
      )}

      {/* Bottom helper */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('popup')}>
          ← Back to Main Menu
        </Button>
        <button
          type="button"
          onClick={() => onNavigate('settings')}
          className="text-[11px] text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 cursor-pointer"
        >
          <span>Extension Settings</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
