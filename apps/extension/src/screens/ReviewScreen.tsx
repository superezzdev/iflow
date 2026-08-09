import { useState, type FC, type ChangeEvent } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Eye,
  Edit3
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CharacterCount } from '../components/ui/CharacterCount';
import { LinkedinIcon } from '../components/LinkedinIcon';
import type { ExtensionScreen } from '../components/Header';

export interface ReviewScreenProps {
  onNavigate: (screen: ExtensionScreen) => void;
}

const INITIAL_POST_DRAFT = `Most engineers configure database connection pools wrong in serverless architectures.

Here are 3 architectural fixes we implemented to eliminate connection timeouts:

1. Use a single Prisma instance on globalThis
In Next.js development and lambdas, module reload creates a new pool per invocation if not pinned globally.

2. Attach PgBouncer / Connection Pooler
Direct PostgreSQL connections crash when 50 concurrent lambdas spin up simultaneously. PgBouncer limits active pool size while buffering queries.

3. Keep query timeouts low (under 5s)
Fail fast instead of holding precious pool connections when database read locks occur.

What connection pooling pattern do you use in your serverless stack?

#Engineering #PostgreSQL #Serverless #NextJS #SoftwareArchitecture`;

export const ReviewScreen: FC<ReviewScreenProps> = ({ onNavigate }) => {
  const [postContent, setPostContent] = useState<string>(INITIAL_POST_DRAFT);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPostContent(e.target.value);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setPostContent(
        `3 PostgreSQL Architecture Lessons Learned from Scaling Serverless Applications 🚀\n\nWhen scaling serverless endpoints against PostgreSQL, connection exhaustion is the #1 silent killer.\n\nKey Takeaways:\n• Pin your Prisma / ORM client globally to avoid connection leaks.\n• Use PgBouncer / Accelerate for connection multiplexing.\n• Set strict 5-second query timeouts to release pool slots instantly.\n\nDrop your thoughts below: how do you manage database scaling in serverless environments?\n\n#SoftwareEngineering #PostgreSQL #Backend #DevOps`
      );
      setIsRegenerating(false);
    }, 600);
  };

  const handleApprove = () => {
    setIsApproved(true);
  };

  const handleDiscard = () => {
    if (window.confirm('Are you sure you want to discard this LinkedIn post draft?')) {
      onNavigate('dashboard');
    }
  };

  return (
    <div className="p-4 space-y-3.5">
      {/* Header Bar with Platform Indicator */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-2">
          {/* Platform Indicator: LinkedIn */}
          <Badge variant="linkedin" size="md" icon={<LinkedinIcon className="w-3.5 h-3.5" />}>
            LinkedIn Post
          </Badge>
          <Badge variant={isApproved ? 'success' : 'warning'} size="sm">
            {isApproved ? 'Approved' : 'Draft in Review'}
          </Badge>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center space-x-1 p-0.5 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setPreviewMode('edit')}
            className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all cursor-pointer ${
              previewMode === 'edit'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3 h-3 inline mr-1" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode('preview')}
            className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all cursor-pointer ${
              previewMode === 'preview'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3 h-3 inline mr-1" />
            Preview
          </button>
        </div>
      </div>

      {/* Main Review / Edit Area */}
      {previewMode === 'edit' ? (
        <div className="space-y-2">
          <div className="relative bg-white rounded-xl border border-slate-300 shadow-2xs focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100 transition-all overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Post Body & Formatting</span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-brand-600 hover:text-brand-700 font-medium inline-flex items-center space-x-1 cursor-pointer"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>

            <textarea
              value={postContent}
              onChange={handleTextChange}
              rows={9}
              className="w-full p-3 text-xs text-slate-800 focus:outline-none resize-none font-sans leading-relaxed"
              placeholder="Edit your LinkedIn post..."
            />

            {/* Character count footer */}
            <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">LinkedIn limit: 3,000</span>
              <CharacterCount count={postContent.length} max={3000} />
            </div>
          </div>
        </div>
      ) : (
        /* LinkedIn Preview Card */
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
              MP
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold text-slate-900">Your LinkedIn Profile</span>
                <span className="text-[10px] text-slate-400">• 1st</span>
              </div>
              <p className="text-[10px] text-slate-500">Engineering Thought Leader</p>
            </div>
          </div>

          <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed border-t border-slate-100 pt-2 font-normal">
            {postContent}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <CharacterCount count={postContent.length} max={3000} />
            <button
              type="button"
              onClick={handleCopy}
              className="text-brand-600 font-semibold inline-flex items-center space-x-1 cursor-pointer"
            >
              {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{isCopied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Success Confirmation Modal / Banner when Approved */}
      {isApproved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">Post Approved!</span>
              <p className="text-[10px] text-emerald-700">Saved to your Approved Posts archive.</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100"
            onClick={() => onNavigate('dashboard')}
          >
            View in Dashboard
          </Button>
        </div>
      )}

      {/* Review Action Controls */}
      <div className="space-y-2 pt-1">
        {/* Approve Button */}
        <Button
          variant="primary"
          size="md"
          fullWidth
          icon={<CheckCircle2 className="w-4 h-4" />}
          onClick={handleApprove}
        >
          {isApproved ? 'Saved to Approved Archive' : 'Approve Post'}
        </Button>

        {/* Secondary controls: Regenerate and Discard */}
        <div className="grid grid-cols-2 gap-2">
          {/* Regenerate Button */}
          <Button
            variant="outline"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            isLoading={isRegenerating}
            onClick={handleRegenerate}
          >
            Regenerate
          </Button>

          {/* Discard Button */}
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={handleDiscard}
          >
            Discard
          </Button>
        </div>
      </div>

      {/* Quick Navigation Footer */}
      <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="hover:text-slate-700 underline cursor-pointer"
        >
          ← All Saved Posts
        </button>
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-brand-500" />
          AI Engine: OpenAI (gpt-4o)
        </span>
      </div>
    </div>
  );
};
