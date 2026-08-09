import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';

export default function PostsPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Saved Posts</h1>
        <p className="text-sm text-slate-600 mt-1">
          Review, edit, and export your approved LinkedIn posts generated from AI conversations.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 mb-1">No Posts Recorded Yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Capture a ChatGPT conversation using the MindPost browser extension to generate and save your first post.
        </p>
      </div>
    </main>
  );
}
