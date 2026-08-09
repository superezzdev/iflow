/**
 * Supported platforms in MindPost.
 * Phase 1 initially supports: LINKEDIN.
 */
export const Platform = {
  LINKEDIN: 'LINKEDIN'
} as const;

export type Platform = (typeof Platform)[keyof typeof Platform];

/**
 * Lifecycle states of a PostDraft.
 */
export const PostDraftStatus = {
  DRAFT: 'DRAFT',
  APPROVED: 'APPROVED',
  DISCARDED: 'DISCARDED'
} as const;

export type PostDraftStatus = (typeof PostDraftStatus)[keyof typeof PostDraftStatus];

/**
 * Canonical PostDraft entity.
 */
export interface PostDraft {
  id: string;
  userId: string;
  insightId: string;
  platform: Platform;
  content: string;
  status: PostDraftStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload for creating a new post draft.
 */
export interface CreatePostDraftPayload {
  insightId: string;
  platform?: Platform;
  content: string;
  status?: PostDraftStatus;
}

/**
 * Payload for updating an existing post draft.
 */
export interface UpdatePostDraftPayload {
  content?: string;
  status?: PostDraftStatus;
  platform?: Platform;
}

/**
 * Query filters for listing post drafts.
 */
export interface ListPostDraftsQuery {
  insightId?: string;
  platform?: Platform;
  status?: PostDraftStatus;
  limit?: number;
  offset?: number;
}

/* ==========================================================================
   Backward Compatibility Aliases & Types for Phase 1 Stubs
   ========================================================================== */

export type TargetPlatform = 'linkedin' | 'x' | 'threads' | Platform;
export type PostStatus = 'draft' | 'review' | 'approved' | 'rejected' | PostDraftStatus;
export type PostTone = 'professional' | 'thought_leadership' | 'storytelling' | 'educational' | 'actionable';

export interface PostGenerationOptions {
  platform: TargetPlatform;
  tone?: PostTone;
  includeCallToAction?: boolean;
  includeHashtags?: boolean;
  maxCharacters?: number;
  customInstructions?: string;
}

export interface SocialPost {
  id: string;
  conversationId: string;
  insightId?: string;
  platform: TargetPlatform;
  hook: string;
  body: string;
  callToAction?: string;
  hashtags: string[];
  formattedContent: string;
  status: PostStatus;
  characterCount: number;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdatePostPayload {
  hook?: string;
  body?: string;
  callToAction?: string;
  hashtags?: string[];
  formattedContent?: string;
  status?: PostStatus;
  content?: string;
  platform?: Platform;
}
