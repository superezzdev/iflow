import {
  ConversationSource,
  type Conversation,
  type ConversationMessage,
  type ConversationMetadata,
  type MessageRole
} from './models';
import type { RawConversation, RawMessage } from './raw';
import {
  RawConversationSchema,
  ConversationSchema
} from './schemas';
import {
  deterministicHash,
  extractThreadIdFromUrl,
  generateStableConversationId,
  generateStableMessageId
} from './id-generator';

export type NormalizationErrorCode =
  | 'EMPTY_CONVERSATION'
  | 'INVALID_ROLE'
  | 'INVALID_SOURCE'
  | 'SCHEMA_VALIDATION_FAILED'
  | 'NORMALIZATION_FAILED';

export class NormalizationError extends Error {
  readonly code: NormalizationErrorCode;
  readonly details?: unknown;

  constructor(code: NormalizationErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'NormalizationError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Clean and normalize conversation title.
 */
export function normalizeTitle(rawTitle?: string): string {
  if (!rawTitle || typeof rawTitle !== 'string') {
    return 'Untitled Conversation';
  }

  const cleaned = rawTitle
    .replace(/\s*[-–—|]\s*(ChatGPT|OpenAI|Claude|Gemini).*$/i, '')
    .replace(/^(ChatGPT|OpenAI|Claude|Gemini)\s*[-–—|]\s*/i, '')
    .trim();

  return cleaned.length > 0 ? cleaned : 'Untitled Conversation';
}

/**
 * Normalize whitespace and remove invisible/control characters.
 */
export function normalizeContentWhitespace(content: string): string {
  if (!content || typeof content !== 'string') return '';

  return content
    // Strip zero-width and invisible formatting characters
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ')
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    // Trim individual lines
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    // Collapse 3 or more consecutive newlines to 2
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Normalize timestamp to ISO 8601 UTC string.
 */
export function normalizeTimestamp(raw?: string | number | Date): string {
  if (!raw) {
    return new Date().toISOString();
  }

  try {
    const date = new Date(raw);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch {
    // Fall through
  }

  return new Date().toISOString();
}

/**
 * Validate and normalize participant role.
 */
export function normalizeMessageRole(rawRole: string): MessageRole {
  const normalized = (rawRole || '').trim().toLowerCase();

  if (normalized === 'user' || normalized === 'human') {
    return 'user';
  }
  if (normalized === 'assistant' || normalized === 'ai' || normalized === 'bot') {
    return 'assistant';
  }
  if (normalized === 'system') {
    return 'system';
  }

  throw new NormalizationError(
    'INVALID_ROLE',
    `Invalid message role "${rawRole}". Expected 'user', 'assistant', or 'system'.`
  );
}

/**
 * Validate conversation source.
 */
export function normalizeSource(rawSource: string): ConversationSource {
  const normalized = (rawSource || '').trim().toLowerCase();

  if (normalized === ConversationSource.CHATGPT) {
    return ConversationSource.CHATGPT;
  }
  if (normalized === ConversationSource.CLAUDE) {
    return ConversationSource.CLAUDE;
  }
  if (normalized === ConversationSource.GEMINI) {
    return ConversationSource.GEMINI;
  }

  throw new NormalizationError(
    'INVALID_SOURCE',
    `Invalid conversation source "${rawSource}". Supported sources: ${Object.values(
      ConversationSource
    ).join(', ')}.`
  );
}

/**
 * Core Conversation Normalizer.
 * Transforms raw, platform-specific capture payloads into canonical Conversation domain models.
 */
export class ConversationNormalizer {
  /**
   * Normalize and validate a raw conversation payload.
   * Throws NormalizationError on validation failure.
   */
  static normalize(raw: RawConversation): Conversation {
    // 1. Schema-level pre-validation
    const parseResult = RawConversationSchema.safeParse(raw);
    if (!parseResult.success) {
      throw new NormalizationError(
        'SCHEMA_VALIDATION_FAILED',
        `Conversation validation failed: ${parseResult.error.errors[0]?.message || 'Invalid format'}`,
        parseResult.error.format()
      );
    }

    // 2. Normalize source
    const source = normalizeSource(raw.source);

    // 3. Normalize title & timestamp
    const title = normalizeTitle(raw.title);
    const capturedAt = normalizeTimestamp(raw.capturedAt);

    // 4. Normalize and filter messages
    const validMessages: ConversationMessage[] = [];
    let orderIndex = 0;
    let totalChars = 0;
    let totalWords = 0;
    let userCount = 0;
    let assistantCount = 0;

    for (let i = 0; i < raw.messages.length; i++) {
      const rawMsg: RawMessage = raw.messages[i]!;
      const role = normalizeMessageRole(rawMsg.role);
      const content = normalizeContentWhitespace(rawMsg.content);

      // Skip empty messages
      if (content.length === 0) {
        continue;
      }

      const timestamp = normalizeTimestamp(rawMsg.timestamp);

      // Count metrics
      totalChars += content.length;
      totalWords += content.split(/\s+/).filter(Boolean).length;
      if (role === 'user') userCount++;
      if (role === 'assistant') assistantCount++;

      const messageId = generateStableMessageId('temp', orderIndex, role, content);

      validMessages.push({
        id: messageId,
        role,
        content,
        timestamp,
        orderIndex,
        metadata: rawMsg.metadata
      });

      orderIndex++;
    }

    // 5. Reject empty conversations
    if (validMessages.length === 0) {
      throw new NormalizationError(
        'EMPTY_CONVERSATION',
        'Cannot normalize conversation: No non-empty messages found in raw transcript.'
      );
    }

    // 6. Compute content fingerprint
    const contentSeed = validMessages
      .map((m) => `${m.role}:${m.content}`)
      .join('|');
    const contentFingerprint = deterministicHash(contentSeed);

    // 7. Extract source thread ID from URL
    const sourceThreadId = extractThreadIdFromUrl(raw.url);

    // 8. Generate stable conversation ID
    const conversationId = generateStableConversationId({
      source,
      url: raw.url,
      title,
      contentFingerprint
    });

    // 9. Re-assign finalized message IDs with stable conversation anchor
    const finalizedMessages = validMessages.map((msg) => ({
      ...msg,
      id: generateStableMessageId(conversationId, msg.orderIndex, msg.role, msg.content)
    }));

    // 10. Construct canonical ConversationMetadata
    const metadata: ConversationMetadata = {
      source,
      sourceUrl: raw.url || undefined,
      sourceThreadId,
      capturedAt,
      characterCount: totalChars,
      wordCount: totalWords,
      userMessageCount: userCount,
      assistantMessageCount: assistantCount,
      contentFingerprint,
      extra: raw.metadata
    };

    // 11. Construct canonical Conversation
    const conversation: Conversation = {
      id: conversationId,
      title,
      source,
      url: raw.url || undefined,
      messages: finalizedMessages,
      totalMessages: finalizedMessages.length,
      metadata,
      capturedAt,
      updatedAt: capturedAt
    };

    // Final schema self-validation
    const domainValidation = ConversationSchema.safeParse(conversation);
    if (!domainValidation.success) {
      throw new NormalizationError(
        'NORMALIZATION_FAILED',
        `Internal normalization schema validation failed: ${
          domainValidation.error.errors[0]?.message || 'Invalid domain model'
        }`,
        domainValidation.error.format()
      );
    }

    return conversation;
  }

  /**
   * Safe normalization wrapper returning a typed result envelope without throwing.
   */
  static safeNormalize(
    raw: unknown
  ): { success: true; conversation: Conversation } | { success: false; error: NormalizationError } {
    try {
      const conv = ConversationNormalizer.normalize(raw as RawConversation);
      return { success: true, conversation: conv };
    } catch (err) {
      if (err instanceof NormalizationError) {
        return { success: false, error: err };
      }
      return {
        success: false,
        error: new NormalizationError(
          'NORMALIZATION_FAILED',
          err instanceof Error ? err.message : 'Unknown normalization error'
        )
      };
    }
  }

  /**
   * Check if a conversation is a duplicate of an existing captured conversation.
   * Compares stable conversation IDs and content fingerprints.
   */
  static isDuplicateConversation(
    existingConversations: Conversation[],
    incoming: Conversation
  ): boolean {
    return existingConversations.some(
      (existing) =>
        existing.id === incoming.id ||
        (existing.source === incoming.source &&
          existing.metadata.contentFingerprint === incoming.metadata.contentFingerprint)
    );
  }
}
