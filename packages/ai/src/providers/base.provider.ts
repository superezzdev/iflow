import type {
  AIProviderType,
  AIProviderConfig,
  CapturedConversation,
  ExtractedInsight,
  IAIProvider,
  InsightExtractionOptions,
  PostGenerationOptions,
  SocialPost
} from '@mindpost/shared';

/**
 * Base abstract class providing common configuration, validation and telemetry hooks
 * for all AI provider implementations.
 */
export abstract class BaseAIProvider implements IAIProvider {
  abstract readonly providerType: AIProviderType;
  abstract readonly defaultModel: string;

  protected readonly config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    if (!config.apiKey || config.apiKey.trim() === '') {
      throw new Error(`[MindPost AI] API key is required for provider initialization.`);
    }
    this.config = {
      ...config,
      timeoutMs: config.timeoutMs ?? 30000,
      maxRetries: config.maxRetries ?? 2
    };
  }

  abstract healthCheck(): Promise<boolean>;

  abstract extractInsights(
    conversation: CapturedConversation,
    options?: InsightExtractionOptions
  ): Promise<ExtractedInsight>;

  abstract generatePost(
    conversation: CapturedConversation,
    insight: ExtractedInsight,
    options: PostGenerationOptions
  ): Promise<Omit<SocialPost, 'id' | 'createdAt' | 'updatedAt'>>;
}
