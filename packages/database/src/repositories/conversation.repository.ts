import { prisma } from '../client';
import type { Prisma } from '@prisma/client';
import type { Conversation, ConversationMetadata, ConversationSource, ExtractedInsight } from '@mindpost/shared';

export class ConversationRepository {
  /**
   * Save a newly captured conversation.
   */
  static async create(conversation: Conversation): Promise<Conversation> {
    const record = await prisma.conversation.create({
      data: {
        id: conversation.id,
        source: conversation.source,
        title: conversation.title,
        url: conversation.metadata.sourceUrl || conversation.url,
        totalMessages: conversation.totalMessages,
        messages: conversation.messages as unknown as Prisma.InputJsonValue,
        metadata: conversation.metadata as unknown as Prisma.InputJsonValue
      }
    });

    const metadata = (record.metadata as unknown as ConversationMetadata) || {
      source: record.source as ConversationSource,
      sourceUrl: record.url ?? undefined,
      capturedAt: record.createdAt.toISOString(),
      characterCount: 0,
      wordCount: 0,
      userMessageCount: 0,
      assistantMessageCount: 0,
      contentFingerprint: record.id
    };

    return {
      id: record.id,
      source: record.source as ConversationSource,
      title: record.title,
      totalMessages: record.totalMessages,
      messages: record.messages as unknown as Conversation['messages'],
      metadata,
      capturedAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
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
