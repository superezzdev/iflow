import type {
  AIProviderType,
  AIProviderConfig,
  CapturedConversation,
  ExtractedInsight,
  InsightExtractionOptions,
  PostGenerationOptions,
  SocialPost
} from '@mindpost/shared';
import { BaseAIProvider } from './base.provider';

/**
 * Anthropic Claude Provider placeholder.
 *
 * Status: ROADMAP (Phase 2)
 * Limitation: Not active in Phase 1 per engineering scope.
 * Implementation will utilize `@anthropic-ai/sdk`.
 */
export class ClaudeProvider extends BaseAIProvider {
  readonly providerType: AIProviderType = 'claude';
  readonly defaultModel: string = 'claude-3-5-sonnet-20241022';

  constructor(config: AIProviderConfig) {
    super(config);
  }

  async healthCheck(): Promise<boolean> {
    throw new Error(
      '[MindPost AI] ClaudeProvider is scheduled for Phase 2 implementation. Please configure AI_PROVIDER=openai for Phase 1.'
    );
  }

  async extractInsights(
    _conversation: CapturedConversation,
    _options?: InsightExtractionOptions
  ): Promise<ExtractedInsight> {
    throw new Error(
      '[MindPost AI] ClaudeProvider is scheduled for Phase 2 implementation. Please configure AI_PROVIDER=openai for Phase 1.'
    );
  }

  async generatePost(
    _conversation: CapturedConversation,
    _insight: ExtractedInsight,
    _options: PostGenerationOptions
  ): Promise<Omit<SocialPost, 'id' | 'createdAt' | 'updatedAt'>> {
    throw new Error(
      '[MindPost AI] ClaudeProvider is scheduled for Phase 2 implementation. Please configure AI_PROVIDER=openai for Phase 1.'
    );
  }
}
