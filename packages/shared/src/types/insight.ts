import type { PostDraft } from './post';

/**
 * Individual key takeaway extracted from an AI conversation.
 */
export interface KeyTakeaway {
  point: string;
  explanation: string;
  quoteSnippet?: string;
}

/**
 * Structured insight entity.
 */
export interface Insight {
  id: string;
  conversationId: string;
  title?: string | null;
  coreIdea: string;
  keyTakeaways?: KeyTakeaway[];
  practicalApplications?: string[];
  suggestedHooks?: string[];
  tags: string[];
  suggestedTone?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt?: string;
  postDrafts?: PostDraft[];
}

/**
 * Backward compatibility alias for ExtractedInsight.
 */
export type ExtractedInsight = Insight;

/**
 * Payload for creating an insight.
 */
export interface CreateInsightPayload {
  conversationId: string;
  title?: string;
  coreIdea: string;
  keyTakeaways?: KeyTakeaway[] | unknown;
  practicalApplications?: string[] | unknown;
  suggestedHooks?: string[] | unknown;
  tags?: string[];
  suggestedTone?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Query parameters for listing insights.
 */
export interface ListInsightsQuery {
  conversationId?: string;
  limit?: number;
  offset?: number;
}

/**
 * Options to guide the insight extraction process.
 */
export interface InsightExtractionOptions {
  focusTopic?: string;
  targetAudience?: string;
  maxTakeaways?: number;
}
