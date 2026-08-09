import { z } from 'zod';
import { ConversationSource } from './models';

export const MessageRoleSchema = z.enum(['user', 'assistant', 'system'], {
  errorMap: (_issue, ctx) => {
    return { message: `Invalid message role "${ctx.data}". Expected 'user', 'assistant', or 'system'.` };
  }
});

export const ConversationSourceSchema = z.nativeEnum(ConversationSource, {
  errorMap: (_issue, ctx) => {
    return {
      message: `Invalid conversation source "${ctx.data}". Supported sources: ${Object.values(
        ConversationSource
      ).join(', ')}.`
    };
  }
});

export const RawMessageSchema = z.object({
  role: z.string().min(1, 'Message role is required'),
  content: z.string(),
  timestamp: z.union([z.string(), z.number(), z.date()]).optional(),
  orderIndex: z.number().int().nonnegative().optional(),
  id: z.string().optional(),
  metadata: z.record(z.unknown()).optional()
});

export const RawConversationSchema = z.object({
  source: z.string().min(1, 'Source is required'),
  title: z.string().optional(),
  url: z.string().optional(),
  capturedAt: z.union([z.string(), z.number(), z.date()]).optional(),
  messages: z
    .array(RawMessageSchema)
    .min(1, 'Conversation must contain at least one message.'),
  metadata: z.record(z.unknown()).optional()
});

export const ConversationMessageSchema = z.object({
  id: z.string().min(1),
  role: MessageRoleSchema,
  content: z.string().min(1, 'Message content cannot be empty.'),
  timestamp: z.string().datetime({ message: 'Timestamp must be a valid ISO 8601 string.' }),
  orderIndex: z.number().int().nonnegative(),
  metadata: z.record(z.unknown()).optional()
});

export const ConversationMetadataSchema = z.object({
  source: ConversationSourceSchema,
  sourceUrl: z.string().url().optional().or(z.literal('')),
  sourceThreadId: z.string().optional(),
  capturedAt: z.string().datetime(),
  characterCount: z.number().int().nonnegative(),
  wordCount: z.number().int().nonnegative(),
  userMessageCount: z.number().int().nonnegative(),
  assistantMessageCount: z.number().int().nonnegative(),
  contentFingerprint: z.string().min(1),
  extra: z.record(z.unknown()).optional()
});

export const ConversationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  source: ConversationSourceSchema,
  url: z.string().optional(),
  messages: z.array(ConversationMessageSchema).min(1),
  totalMessages: z.number().int().positive(),
  metadata: ConversationMetadataSchema,
  capturedAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional()
});
