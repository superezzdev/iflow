import type { AIProviderConfig, AIProviderType, IAIProvider } from '@mindpost/shared';
import { OpenAIProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { ClaudeProvider } from './providers/claude.provider';

export class AIProviderFactory {
  /**
   * Create an instance of an AI provider based on specified type.
   */
  static create(type: AIProviderType, config: AIProviderConfig): IAIProvider {
    switch (type) {
      case 'openai':
        return new OpenAIProvider(config);
      case 'gemini':
        return new GeminiProvider(config);
      case 'claude':
        return new ClaudeProvider(config);
      default: {
        const exhaustiveCheck: never = type;
        throw new Error(`[AIProviderFactory] Unsupported provider type: ${exhaustiveCheck}`);
      }
    }
  }

  /**
   * Create provider instance from process environment variables.
   */
  static fromEnv(): IAIProvider {
    const providerType = (process.env.AI_PROVIDER || 'openai') as AIProviderType;

    let apiKey = '';
    let model: string | undefined;
    let baseUrl: string | undefined;

    if (providerType === 'openai') {
      apiKey = process.env.OPENAI_API_KEY || '';
      model = process.env.OPENAI_MODEL;
      baseUrl = process.env.OPENAI_BASE_URL;
    } else if (providerType === 'gemini') {
      apiKey = process.env.GEMINI_API_KEY || '';
      model = process.env.GEMINI_MODEL;
    } else if (providerType === 'claude') {
      apiKey = process.env.ANTHROPIC_API_KEY || '';
      model = process.env.ANTHROPIC_MODEL;
    }

    if (!apiKey) {
      throw new Error(
        `[MindPost AI] Missing API key for active provider "${providerType}". Please set the appropriate environment variable in .env.`
      );
    }

    return AIProviderFactory.create(providerType, {
      apiKey,
      model,
      baseUrl
    });
  }
}
