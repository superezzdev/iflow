import { ConversationRepository, InsightRepository } from '@mindpost/database';
import type { Insight, KeyTakeaway } from '@mindpost/shared';
import { NotFoundError } from '../lib/errors';
import type { z } from 'zod';
import type { CreateInsightSchema, ListInsightsQuerySchema } from '@mindpost/shared';

export class InsightService {
  /**
   * Create an insight linked to a valid conversation.
   */
  static async createInsight(
    _userId: string,
    input: z.infer<typeof CreateInsightSchema>
  ): Promise<Insight> {
    const conversation = await ConversationRepository.findById(input.conversationId);
    if (!conversation) {
      throw new NotFoundError(
        `Cannot create insight: Conversation with ID "${input.conversationId}" was not found.`
      );
    }

    return InsightRepository.create({
      conversationId: input.conversationId,
      title: input.title,
      coreIdea: input.coreIdea,
      keyTakeaways: input.keyTakeaways as KeyTakeaway[] | undefined,
      practicalApplications: input.practicalApplications as string[] | undefined,
      suggestedHooks: input.suggestedHooks as string[] | undefined,
      tags: input.tags,
      suggestedTone: input.suggestedTone,
      metadata: input.metadata
    });
  }

  /**
   * Get an insight by ID.
   */
  static async getInsightById(id: string): Promise<Insight> {
    const insight = await InsightRepository.findById(id);
    if (!insight) {
      throw new NotFoundError(`Insight with ID "${id}" was not found.`);
    }
    return insight;
  }

  /**
   * List insights with optional conversation filter and pagination.
   */
  static async listInsights(
    _userId: string,
    query: z.infer<typeof ListInsightsQuerySchema>
  ): Promise<{ insights: Insight[]; total: number; limit: number; offset: number }> {
    const result = await InsightRepository.list({
      conversationId: query.conversationId,
      limit: query.limit,
      offset: query.offset
    });

    return {
      insights: result.insights,
      total: result.total,
      limit: query.limit,
      offset: query.offset
    };
  }
}
