import { ConversationRepository } from '@mindpost/database';
import type { Conversation } from '@mindpost/shared';
import { NotFoundError } from '../lib/errors';
import type { z } from 'zod';
import type { CreateConversationSchema, ListConversationsQuerySchema } from '@mindpost/shared';

export class ConversationService {
  /**
   * Create a new conversation and its associated messages for a user.
   */
  static async createConversation(
    userId: string,
    input: z.infer<typeof CreateConversationSchema>
  ): Promise<Conversation> {
    const formattedMessages = input.messages.map((msg, index) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      orderIndex: msg.orderIndex ?? index,
      metadata: msg.metadata,
      timestamp: msg.timestamp ?? new Date().toISOString()
    }));

    return ConversationRepository.create({
      userId,
      title: input.title,
      source: input.source,
      url: input.url,
      metadata: input.metadata,
      messages: formattedMessages
    });
  }

  /**
   * Get a conversation by ID with messages, scoped to the user.
   */
  static async getConversationById(id: string, userId?: string): Promise<Conversation> {
    const conversation = await ConversationRepository.findById(id, userId);

    if (!conversation) {
      throw new NotFoundError(`Conversation with ID "${id}" was not found.`);
    }

    return conversation;
  }

  /**
   * List conversations for a user with pagination.
   */
  static async listConversations(
    userId: string,
    query: z.infer<typeof ListConversationsQuerySchema>
  ): Promise<{ conversations: Conversation[]; total: number; limit: number; offset: number }> {
    const result = await ConversationRepository.list({
      userId,
      source: query.source,
      limit: query.limit,
      offset: query.offset
    });

    return {
      conversations: result.conversations,
      total: result.total,
      limit: query.limit,
      offset: query.offset
    };
  }
}
