import OpenAI from 'openai';
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
import { INSIGHT_SYSTEM_PROMPT, buildInsightUserPrompt } from '../prompts/insight.prompt';
import { POST_SYSTEM_PROMPT, buildPostUserPrompt } from '../prompts/post.prompt';

export class OpenAIProvider extends BaseAIProvider {
  readonly providerType: AIProviderType = 'openai';
  readonly defaultModel: string = 'gpt-4o';

  private readonly client: OpenAI;

  constructor(config: AIProviderConfig) {
    super(config);
    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl,
      timeout: this.config.timeoutMs,
      maxRetries: this.config.maxRetries
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.models.list();
      return Array.isArray(response.data);
    } catch {
      return false;
    }
  }

  async extractInsights(
    conversation: CapturedConversation,
    options?: InsightExtractionOptions
  ): Promise<ExtractedInsight> {
    const model = this.config.model ?? this.defaultModel;
    const userPrompt = buildInsightUserPrompt(conversation, options);

    const completion = await this.client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: INSIGHT_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const content = completion.choices[0]?.message.content;
    if (!content) {
      throw new Error('[OpenAIProvider] Received empty response from OpenAI for insight extraction.');
    }

    const parsed = JSON.parse(content);

    return {
      id: `ins_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      conversationId: conversation.id,
      title: parsed.title || conversation.title,
      coreIdea: parsed.coreIdea || '',
      keyTakeaways: Array.isArray(parsed.keyTakeaways) ? parsed.keyTakeaways : [],
      practicalApplications: Array.isArray(parsed.practicalApplications) ? parsed.practicalApplications : [],
      suggestedHooks: Array.isArray(parsed.suggestedHooks) ? parsed.suggestedHooks : [],
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      suggestedTone: parsed.suggestedTone || 'professional',
      createdAt: new Date().toISOString()
    };
  }

  async generatePost(
    conversation: CapturedConversation,
    insight: ExtractedInsight,
    options: PostGenerationOptions
  ): Promise<Omit<SocialPost, 'id' | 'createdAt' | 'updatedAt'>> {
    const model = this.config.model ?? this.defaultModel;
    const userPrompt = buildPostUserPrompt(conversation, insight, options);

    const completion = await this.client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: POST_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    const content = completion.choices[0]?.message.content;
    if (!content) {
      throw new Error('[OpenAIProvider] Received empty response from OpenAI for post generation.');
    }

    const parsed = JSON.parse(content);
    const formattedContent = parsed.formattedContent || `${parsed.hook}\n\n${parsed.body}\n\n${parsed.callToAction || ''}\n\n${(parsed.hashtags || []).join(' ')}`.trim();

    return {
      conversationId: conversation.id,
      insightId: insight.id,
      platform: options.platform,
      hook: parsed.hook || '',
      body: parsed.body || '',
      callToAction: parsed.callToAction,
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
      formattedContent,
      status: 'draft',
      characterCount: formattedContent.length,
      metadata: {
        provider: this.providerType,
        model
      }
    };
  }
}
