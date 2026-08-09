import type { CapturedConversation } from './conversation';
import type { ExtractedInsight, InsightExtractionOptions } from './insight';
import type { PostGenerationOptions, SocialPost, UpdatePostPayload } from './post';

/**
 * Standard successful API response envelope.
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

/**
 * Standard error API response envelope.
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Endpoint: POST /api/insights/extract
 */
export interface ExtractInsightsRequest {
  conversation: CapturedConversation;
  options?: InsightExtractionOptions;
}

export interface ExtractInsightsResponse {
  insight: ExtractedInsight;
}

/**
 * Endpoint: POST /api/generate
 */
export interface GeneratePostRequest {
  conversation: CapturedConversation;
  insight?: ExtractedInsight;
  options: PostGenerationOptions;
}

export interface GeneratePostResponse {
  post: SocialPost;
  insight: ExtractedInsight;
}

/**
 * Endpoint: POST /api/posts
 */
export interface SavePostRequest {
  conversationId?: string;
  insightId?: string;
  platform: 'linkedin' | 'x' | 'threads';
  hook: string;
  body: string;
  callToAction?: string;
  hashtags: string[];
  formattedContent: string;
  status: 'draft' | 'approved';
  metadata?: Record<string, unknown>;
}

export interface SavePostResponse {
  post: SocialPost;
}

/**
 * Endpoint: PATCH /api/posts/:id
 */
export interface UpdatePostRequest {
  id: string;
  updates: UpdatePostPayload;
}
