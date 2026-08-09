import { prisma } from '../client';
import type { Prisma } from '@prisma/client';
import type { CapturedConversation, CaptureSource, ExtractedInsight } from '@mindpost/shared';

export class ConversationRepository {
  /**
   * Save a newly captured conversation.
   */
  static async create(conversation: CapturedConversation): Promise<CapturedConversation> {
    const record = await prisma.conversation.create({
      data: {
        id: conversation.id,
        source: conversation.source,
        title: conversation.title,
        url: conversation.url,
        totalMessages: conversation.totalMessages,
        messages: conversation.messages as unknown as Prisma.InputJsonValue,
        metadata: conversation.metadata ? (conversation.metadata as Prisma.InputJsonValue) : undefined
      }
    });

    return {
      id: record.id,
      source: record.source as CaptureSource,
      title: record.title,
      url: record.url ?? undefined,
      totalMessages: record.totalMessages,
      messages: record.messages as unknown as CapturedConversation['messages'],
      metadata: (record.metadata as Record<string, unknown>) ?? undefined,
      capturedAt: record.createdAt.toISOString()
    };
  }

  /**
   * Save extracted insight associated with a conversation.
   */
  static async saveInsight(insight: ExtractedInsight): Promise<ExtractedInsight> {
    const record = await prisma.insight.create({
      data: {
        id: insight.id,
        conversationId: insight.conversationId,
        title: insight.title,
        coreIdea: insight.coreIdea,
        keyTakeaways: insight.keyTakeaways as unknown as Prisma.InputJsonValue,
        practicalApplications: insight.practicalApplications as unknown as Prisma.InputJsonValue,
        suggestedHooks: insight.suggestedHooks as unknown as Prisma.InputJsonValue,
        tags: insight.tags,
        suggestedTone: insight.suggestedTone
      }
    });

    return {
      id: record.id,
      conversationId: record.conversationId,
      title: record.title,
      coreIdea: record.coreIdea,
      keyTakeaways: record.keyTakeaways as unknown as ExtractedInsight['keyTakeaways'],
      practicalApplications: record.practicalApplications as unknown as string[],
      suggestedHooks: record.suggestedHooks as unknown as string[],
      tags: record.tags,
      suggestedTone: (record.suggestedTone as ExtractedInsight['suggestedTone']) ?? undefined,
      createdAt: record.createdAt.toISOString()
    };
  }
}
