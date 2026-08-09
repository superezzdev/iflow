import type { CapturedConversation } from './conversation';
import type { ExtractedInsight, InsightExtractionOptions } from './insight';
import type { PostGenerationOptions, SocialPost } from './post';

/**
 * Supported AI Providers.
 * Phase 1: 'openai'
 * Future: 'gemini', 'claude'
 */
export type AIProviderType = 'openai' | 'gemini' | 'claude';

/**
 * Common configuration options across all AI providers.
 */
export interface AIProviderConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

/**
 * Abstract interface for AI providers.
 * All providers (OpenAI, Gemini, Claude) adhere to this contract.
 */
export interface IAIProvider {
  readonly providerType: AIProviderType;
  readonly defaultModel: string;

  /**
   * Health/connectivity check for the provider.
   */
  healthCheck(): Promise<boolean>;

  /**
   * Extract high-value insights from a captured AI conversation.
   */
  extractInsights(
    conversation: CapturedConversation,
    options?: InsightExtractionOptions
  ): Promise<ExtractedInsight>;

  /**
   * Generate a targeted social media post from extracted insights.
   */
  generatePost(
    conversation: CapturedConversation,
    insight: ExtractedInsight,
    options: PostGenerationOptions
  ): Promise<Omit<SocialPost, 'id' | 'createdAt' | 'updatedAt'>>;
}
