import { prisma, Prisma } from '../client';
import type { Conversation as PrismaConversation, ConversationMessage as PrismaMessage } from '@prisma/client';
import type { Conversation, ConversationMessage, ConversationMetadata, ConversationSource, MessageRole } from '@mindpost/shared';

export interface CreateConversationInput {
  id?: string;
  userId: string;
  title?: string;
  source?: string;
  url?: string;
  metadata?: Record<string, unknown> | null;
  messages: Array<{
    id?: string;
    role: string;
    content: string;
    orderIndex?: number;
    metadata?: Record<string, unknown> | null;
    timestamp?: string;
  }>;
}

export interface ListConversationsInput {
  userId?: string;
  source?: string;
  limit?: number;
  offset?: number;
}

export class ConversationRepository {
  /**
   * Create a conversation with all associated messages in a transaction.
   */
  static async create(data: CreateConversationInput): Promise<Conversation> {
    const totalMessages = data.messages.length;

    const record = await prisma.conversation.create({
      data: {
        id: data.id,
        userId: data.userId,
        title: data.title ?? 'Untitled Conversation',
        source: data.source ?? 'chatgpt',
        url: data.url,
        totalMessages,
        metadata: (data.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        messages: {
          create: data.messages.map((msg, index) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            orderIndex: msg.orderIndex ?? index,
            metadata: (msg.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull
          }))
        }
      },
      include: {
        messages: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    return ConversationRepository.toDomain(record);
  }

  /**
   * Find a conversation by ID with its messages.
   */
  static async findById(id: string, userId?: string): Promise<Conversation | null> {
    const record = await prisma.conversation.findFirst({
      where: {
        id,
        ...(userId ? { userId } : {})
      },
      include: {
        messages: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    return record ? ConversationRepository.toDomain(record) : null;
  }

  /**
   * List conversations with pagination and optional filters.
   */
  static async list(params: ListConversationsInput): Promise<{ conversations: Conversation[]; total: number }> {
    const where: Prisma.ConversationWhereInput = {
      ...(params.userId ? { userId: params.userId } : {}),
      ...(params.source ? { source: params.source } : {})
    };

    const [total, records] = await prisma.$transaction([
      prisma.conversation.count({ where }),
      prisma.conversation.findMany({
        where,
        include: {
          messages: {
            orderBy: { orderIndex: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: params.limit ?? 20,
        skip: params.offset ?? 0
      })
    ]);

    return {
      conversations: records.map(ConversationRepository.toDomain),
      total
    };
  }

  /**
   * Delete a conversation by ID.
   */
  static async delete(id: string, userId?: string): Promise<boolean> {
    const count = await prisma.conversation.deleteMany({
      where: {
        id,
        ...(userId ? { userId } : {})
      }
    });

    return count.count > 0;
  }

  /**
   * Transform Prisma record to domain Conversation entity.
   */
  public static toDomain(
    record: PrismaConversation & { messages?: PrismaMessage[] }
  ): Conversation {
    const messages: ConversationMessage[] = (record.messages || []).map((msg) => ({
      id: msg.id,
      conversationId: msg.conversationId,
      role: msg.role as MessageRole,
      content: msg.content,
      orderIndex: msg.orderIndex,
      timestamp: msg.createdAt.toISOString(),
      metadata: (msg.metadata as Record<string, unknown>) ?? undefined,
      createdAt: msg.createdAt.toISOString()
    }));

    const metadata: ConversationMetadata = (record.metadata as unknown as ConversationMetadata) || {
      source: record.source as ConversationSource,
      sourceUrl: record.url ?? undefined,
      capturedAt: record.createdAt.toISOString(),
      characterCount: 0,
      wordCount: 0,
      userMessageCount: messages.filter((m) => m.role === 'user').length,
      assistantMessageCount: messages.filter((m) => m.role === 'assistant').length,
      contentFingerprint: record.id
    };

    return {
      id: record.id,
      userId: record.userId,
      title: record.title ?? 'Untitled Conversation',
      source: record.source as ConversationSource,
      url: record.url ?? undefined,
      totalMessages: record.totalMessages,
      messages,
      metadata,
      capturedAt: record.createdAt.toISOString(),
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    };
  }
}
