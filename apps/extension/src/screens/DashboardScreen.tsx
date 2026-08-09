import { useState, type FC } from 'react';
import { MessageSquare, Sparkles, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LinkedinIcon } from '../components/LinkedinIcon';
import type { ExtensionScreen } from '../components/Header';

export type DashboardTab = 'conversations' | 'insights' | 'drafts' | 'approved';

export interface DashboardScreenProps {
  onNavigate: (screen: ExtensionScreen) => void;
}

export const DashboardScreen: FC<DashboardScreenProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('conversations');
  const [showSampleData, setShowSampleData] = useState<boolean>(false);

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

      {/* Tab Content Header with Preview Toggle */}
      <div className="flex items-center justify-between text-xs px-1">
        <span className="font-bold text-slate-900 capitalize">
          {activeTab === 'conversations' && 'Recent Conversations'}
          {activeTab === 'insights' && 'Detected Insights'}
          {activeTab === 'drafts' && 'Draft Posts'}
          {activeTab === 'approved' && 'Approved Posts'}
        </span>

        {/* Realistic Demo Preview Toggle */}
        <button
          type="button"
          onClick={() => setShowSampleData((prev) => !prev)}
          className="text-[10px] text-brand-600 hover:text-brand-700 font-medium underline cursor-pointer"
        >
          {showSampleData ? 'Show Empty States' : 'Preview Sample Cards'}
        </button>
      </div>

      {/* 1. Recent Conversations Tab */}
      {activeTab === 'conversations' && (
        <>
          {showSampleData ? (
            <div className="space-y-2.5">
              {[
                {
                  title: 'Optimizing PostgreSQL Indexing for Full-Text Search',
                  source: 'chatgpt',
                  time: '2 hours ago',
                  messages: 8
                },
                {
                  title: 'Designing Zero-Downtime Prisma Migrations',
                  source: 'chatgpt',
                  time: 'Yesterday',
                  messages: 12
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold text-slate-900 leading-snug">{item.title}</h4>
                    <Badge variant="neutral" size="sm">
                      {item.source}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{item.messages} messages • {item.time}</span>
                    <Button variant="outline" size="sm" onClick={() => onNavigate('review')}>
                      Review Post
                    </Button>
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
              onAction={() => onNavigate('capture-status')}
            />
          )}
        </>
      )}

      {/* 2. Detected Insights Tab */}
      {activeTab === 'insights' && (
        <>
          {showSampleData ? (
            <div className="space-y-2.5">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="brand" size="sm">
                    Core Breakthrough
                  </Badge>
                  <span className="text-[10px] text-slate-400">10m ago</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  Connection pool exhaustion in serverless occurs during cold starts.
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Key takeaway: Use pgBouncer or direct Prisma singleton pooling to prevent connection bursts during scale spikes.
                </p>
                <div className="flex items-center gap-1 flex-wrap pt-1">
                  <Badge variant="neutral" size="sm">#PostgreSQL</Badge>
                  <Badge variant="neutral" size="sm">#Serverless</Badge>
                  <Badge variant="neutral" size="sm">#Architecture</Badge>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<Sparkles className="w-5 h-5" />}
              title="No detected insights yet."
              description="Capture an AI conversation to extract actionable key takeaways and thought leadership hooks."
              actionLabel="Start Capturing"
              onAction={() => onNavigate('capture-status')}
            />
          )}
        </>
      )}

      {/* 3. Draft Posts Tab */}
      {activeTab === 'drafts' && (
        <>
          {showSampleData ? (
            <div className="space-y-2.5">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="linkedin" size="sm" icon={<LinkedinIcon className="w-3 h-3" />}>
                    LinkedIn Draft
                  </Badge>
                  <Badge variant="warning" size="sm">
                    In Review
                  </Badge>
                </div>
                <p className="text-xs text-slate-800 line-clamp-3 font-normal leading-relaxed">
                  Most engineers configure database connection pools wrong in serverless... Here are 3 architecture fixes to avoid cold-start connection limits.
                </p>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">845 chars</span>
                  <Button variant="primary" size="sm" onClick={() => onNavigate('review')}>
                    Open Reviewer
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<FileText className="w-5 h-5" />}
              title="No draft posts currently in review."
              description="Generated LinkedIn post drafts will appear here for you to polish and approve."
              actionLabel="Generate New Draft"
              onAction={() => onNavigate('capture-status')}
            />
          )}
        </>
      )}

      {/* 4. Approved Posts Tab */}
      {activeTab === 'approved' && (
        <>
          {showSampleData ? (
            <div className="space-y-2.5">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="linkedin" size="sm" icon={<LinkedinIcon className="w-3 h-3" />}>
                    LinkedIn
                  </Badge>
                  <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                    Approved
                  </Badge>
                </div>
                <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed">
                  How we cut our API latency by 40% using isolated AI prompt caching and PostgreSQL connection pooling.
                </p>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Approved: Yesterday</span>
                  <span className="text-brand-600 font-semibold cursor-pointer">Copy to Clipboard</span>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<CheckCircle2 className="w-5 h-5" />}
              title="No approved posts yet."
              description="When you approve generated LinkedIn posts, they are safely saved here for easy sharing."
              actionLabel="Review Drafts"
              onAction={() => setActiveTab('drafts')}
            />
          )}
        </>
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
