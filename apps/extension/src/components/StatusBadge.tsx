import type { FC } from 'react';
import type { PostStatus, PostDraftStatus } from '@mindpost/shared';

interface StatusBadgeProps {
  status: PostStatus | PostDraftStatus;
}

export const StatusBadge: FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<string, string> = {
    draft: 'bg-amber-50 text-amber-700 border-amber-200',
    DRAFT: 'bg-amber-50 text-amber-700 border-amber-200',
    review: 'bg-blue-50 text-blue-700 border-blue-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    DISCARDED: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border capitalize ${
        styles[status] || styles.draft
      }`}
    >
      {status}
    </span>
  );
};
