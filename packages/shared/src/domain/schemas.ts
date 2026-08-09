import { z } from 'zod';
import { ConversationSource } from './models';
import { Platform, PostDraftStatus } from '../types/post';

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

export const PlatformSchema = z.nativeEnum(Platform, {
  errorMap: (_issue, ctx) => {
    return { message: `Invalid platform "${ctx.data}". Supported platforms: ${Object.values(Platform).join(', ')}.` };
  }
});

export const PostDraftStatusSchema = z.nativeEnum(PostDraftStatus, {
  errorMap: (_issue, ctx) => {
    return { message: `Invalid post status "${ctx.data}". Supported statuses: ${Object.values(PostDraftStatus).join(', ')}.` };
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
  timestamp: z.string().datetime({ message: 'Timestamp must be a valid ISO 8601 string.' }).optional(),
  orderIndex: z.number().int().nonnegative(),
  metadata: z.record(z.unknown()).optional()
});

export const ConversationMetadataSchema = z.object({
  source: ConversationSourceSchema.optional(),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  sourceThreadId: z.string().optional(),
  capturedAt: z.string().datetime().optional(),
  characterCount: z.number().int().nonnegative().optional(),
  wordCount: z.number().int().nonnegative().optional(),
  userMessageCount: z.number().int().nonnegative().optional(),
  assistantMessageCount: z.number().int().nonnegative().optional(),
  contentFingerprint: z.string().min(1).optional(),
  extra: z.record(z.unknown()).optional()
});

export const ConversationSchema = z.object({
  id: z.string().min(1),
  userId: z.string().optional(),
  title: z.string().nullable().optional(),
  source: z.string().default('chatgpt'),
  url: z.string().nullable().optional(),
  messages: z.array(ConversationMessageSchema).min(1),
  totalMessages: z.number().int().nonnegative().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  capturedAt: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

/* ==========================================================================
   API Request Validation Schemas
   ========================================================================== */

export const CreateConversationMessageInputSchema = z.object({
  id: z.string().optional(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1, 'Message content cannot be empty'),
  orderIndex: z.number().int().nonnegative().optional(),
  metadata: z.record(z.unknown()).optional(),
  timestamp: z.string().optional()
});

export const CreateConversationSchema = z.object({
  title: z.string().max(255).optional(),
  source: z.string().max(50).default('chatgpt'),
  url: z.string().url().max(1000).optional().or(z.literal('')),
  messages: z.array(CreateConversationMessageInputSchema).min(1, 'Conversation must have at least one message'),
  metadata: z.record(z.unknown()).optional()
});

export const ListConversationsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
  source: z.string().optional()
});

export const CreateInsightSchema = z.object({
  conversationId: z.string().min(1, 'conversationId is required'),
  title: z.string().max(255).optional(),
  coreIdea: z.string().min(1, 'coreIdea is required'),
  keyTakeaways: z.union([z.array(z.unknown()), z.record(z.unknown())]).optional(),
  practicalApplications: z.union([z.array(z.unknown()), z.record(z.unknown())]).optional(),
  suggestedHooks: z.union([z.array(z.unknown()), z.record(z.unknown())]).optional(),
  tags: z.array(z.string()).default([]),
  suggestedTone: z.string().optional(),
  metadata: z.record(z.unknown()).optional()
});

export const ListInsightsQuerySchema = z.object({
  conversationId: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0)
});

export const CreatePostDraftSchema = z.object({
  insightId: z.string().min(1, 'insightId is required'),
  platform: PlatformSchema.default(Platform.LINKEDIN),
  content: z.string().min(1, 'content is required'),
  status: PostDraftStatusSchema.default(PostDraftStatus.DRAFT)
});

export const UpdatePostDraftSchema = z.object({
  content: z.string().min(1, 'content cannot be empty').optional(),
  status: PostDraftStatusSchema.optional(),
  platform: PlatformSchema.optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field (content, status, platform) must be provided for update'
});

export const ListPostDraftsQuerySchema = z.object({
  insightId: z.string().optional(),
  platform: PlatformSchema.optional(),
  status: PostDraftStatusSchema.optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0)
});
