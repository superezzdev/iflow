import { Sparkles, CheckCircle2, MessageSquare, Layers } from 'lucide-react';
import { LinkedinIcon } from '../components/LinkedinIcon';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-8 border-b border-slate-200 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-50 border border-brand-200 rounded-full text-brand-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phase 1 Architecture Active</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            MindPost Studio
          </h1>
          <p className="text-base text-slate-600 mt-1 max-w-2xl">
            Transform high-value AI problem-solving conversations into structured, engaging LinkedIn posts.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/posts"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            <Layers className="w-4 h-4" />
            <span>View Saved Posts</span>
          </Link>
        </div>
      </div>

      {/* Phase 1 Workflow Steps */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Phase 1 Pipeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              step: '01',
              title: 'Capture Conversation',
              description: 'Extract clean message transcripts from ChatGPT sessions without DOM coupling.',
              icon: MessageSquare,
              color: 'text-blue-600 bg-blue-50 border-blue-200'
            },
            {
              step: '02',
              title: 'Extract Insights',
              description: 'AI extracts core takeaways, actionable steps, and compelling discussion hooks.',
              icon: Sparkles,
              color: 'text-purple-600 bg-purple-50 border-purple-200'
            },
            {
              step: '03',
              title: 'Generate LinkedIn Post',
              description: 'Transforms insights into a structured LinkedIn post formatted for high retention.',
              icon: LinkedinIcon,
              color: 'text-brand-600 bg-brand-50 border-brand-200'
            },
            {
              step: '04',
              title: 'Review & Save',
              description: 'Edit drafts, approve final versions, and persist to PostgreSQL database via Prisma.',
              icon: CheckCircle2,
              color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-slate-400">{item.step}</span>
                    <div className={`p-2 rounded-lg border ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Status Grid */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Browser Extension</h3>
          <p className="text-xs text-slate-500 mb-4">
            WXT + React powered extension with decoupled ChatGPT DOM parsers.
          </p>
          <div className="inline-flex items-center text-xs font-medium text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
            Configured & Ready
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">AI Provider Engine</h3>
          <p className="text-xs text-slate-500 mb-4">
            Isolated provider abstraction with active OpenAI driver and strict JSON schemas.
          </p>
          <div className="inline-flex items-center text-xs font-medium text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
            Configured & Ready
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Database & Repositories</h3>
          <p className="text-xs text-slate-500 mb-4">
            PostgreSQL schema and typed Prisma repositories for conversations, insights, and posts.
          </p>
          <div className="inline-flex items-center text-xs font-medium text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
            Configured & Ready
          </div>
        </div>
      </div>
    </main>
  );
}
