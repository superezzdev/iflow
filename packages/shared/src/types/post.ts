/**
 * Target social platform for content generation.
 * Phase 1 focus: 'linkedin'
 */
export type TargetPlatform = 'linkedin' | 'x' | 'threads';

/**
 * Lifecycle state of a generated post.
 */
export type PostStatus = 'draft' | 'review' | 'approved' | 'rejected';

/**
 * Tone style for generated social media posts.
 */
export type PostTone = 'professional' | 'thought_leadership' | 'storytelling' | 'educational' | 'actionable';

/**
 * Options to control post generation.
 */
export interface PostGenerationOptions {
  platform: TargetPlatform;
  tone?: PostTone;
  includeCallToAction?: boolean;
  includeHashtags?: boolean;
  maxCharacters?: number;
  customInstructions?: string;
}

/**
 * Canonical Social Post data model.
 */
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

/**
 * Payload for updating / editing a post during review.
 */
export interface UpdatePostPayload {
  hook?: string;
  body?: string;
  callToAction?: string;
  hashtags?: string[];
  formattedContent?: string;
  status?: PostStatus;
}
