import { describe, it, expect } from 'vitest';
import {
  ConversationNormalizer,
  NormalizationError,
  normalizeContentWhitespace,
  normalizeMessageRole,
  normalizeSource,
  normalizeTimestamp
} from '../normalizer';
import { ConversationSource } from '../models';
import type { RawConversation } from '../raw';

describe('ConversationNormalizer', () => {
  const validRawChatGPT: RawConversation = {
    source: 'chatgpt',
    title: 'PostgreSQL Connection Pooling in Serverless Next.js - ChatGPT',
    url: 'https://chatgpt.com/c/67890-abcd-ef01',
    capturedAt: '2026-08-09T18:00:00.000Z',
    messages: [
      {
        role: 'user',
        content: '  How do I configure connection pooling with Prisma in Next.js?  \n\n\n\nExplain pgBouncer too.  ',
        timestamp: '2026-08-09T18:00:01.000Z'
      },
      {
        role: 'assistant',
        content: 'To configure connection pooling:\n\n1. Use a global singleton.\n2. Add pgBouncer connection string.',
        timestamp: '2026-08-09T18:00:05.000Z'
      }
    ]
  };

  describe('Successful Normalization', () => {
    it('transforms raw conversation into a canonical Conversation domain model', () => {
      const conv = ConversationNormalizer.normalize(validRawChatGPT);

      expect(conv.id).toMatch(/^conv_chatgpt_[a-z0-9]+$/);
      expect(conv.source).toBe(ConversationSource.CHATGPT);
      expect(conv.title).toBe('PostgreSQL Connection Pooling in Serverless Next.js');
      expect(conv.totalMessages).toBe(2);
      expect(conv.messages).toHaveLength(2);

      // Verify user message
      expect(conv.messages[0]?.role).toBe('user');
      expect(conv.messages[0]?.orderIndex).toBe(0);
      expect(conv.messages[0]?.content).toBe(
        'How do I configure connection pooling with Prisma in Next.js?\n\nExplain pgBouncer too.'
      );
      expect(conv.messages[0]?.timestamp).toBe('2026-08-09T18:00:01.000Z');

      // Verify assistant message
      expect(conv.messages[1]?.role).toBe('assistant');
      expect(conv.messages[1]?.orderIndex).toBe(1);

      // Verify metadata
      expect(conv.metadata.source).toBe('chatgpt');
      expect(conv.metadata.sourceUrl).toBe('https://chatgpt.com/c/67890-abcd-ef01');
      expect(conv.metadata.sourceThreadId).toBe('67890-abcd-ef01');
      expect(conv.metadata.userMessageCount).toBe(1);
      expect(conv.metadata.assistantMessageCount).toBe(1);
      expect(conv.metadata.characterCount).toBeGreaterThan(0);
      expect(conv.metadata.wordCount).toBeGreaterThan(0);
      expect(conv.metadata.contentFingerprint).toBeDefined();
    });

    it('returns a safe result envelope via safeNormalize without throwing', () => {
      const result = ConversationNormalizer.safeNormalize(validRawChatGPT);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.conversation.id).toBeDefined();
      }
    });
  });

  describe('Stable ID Generation & Deduplication', () => {
    it('generates identical stable IDs for identical captures', () => {
      const conv1 = ConversationNormalizer.normalize(validRawChatGPT);
      const conv2 = ConversationNormalizer.normalize(validRawChatGPT);

      expect(conv1.id).toBe(conv2.id);
      expect(conv1.metadata.contentFingerprint).toBe(conv2.metadata.contentFingerprint);
    });

    it('detects duplicate conversations accurately', () => {
      const conv1 = ConversationNormalizer.normalize(validRawChatGPT);
      const conv2 = ConversationNormalizer.normalize(validRawChatGPT);

      expect(ConversationNormalizer.isDuplicateConversation([conv1], conv2)).toBe(true);

      const distinctRaw: RawConversation = {
        ...validRawChatGPT,
        url: 'https://chatgpt.com/c/distinct-thread-id-999',
        messages: [{ role: 'user', content: 'What is WebSockets?' }]
      };
      const convDistinct = ConversationNormalizer.normalize(distinctRaw);
      expect(ConversationNormalizer.isDuplicateConversation([conv1], convDistinct)).toBe(false);
    });
  });

  describe('Validation & Error Handling', () => {
    it('rejects empty conversations with 0 messages', () => {
      const emptyRaw: RawConversation = {
        source: 'chatgpt',
        title: 'Empty',
        messages: []
      };

      expect(() => ConversationNormalizer.normalize(emptyRaw)).toThrow(NormalizationError);
      const safe = ConversationNormalizer.safeNormalize(emptyRaw);
      expect(safe.success).toBe(false);
    });

    it('rejects conversations where all messages contain only whitespace', () => {
      const blankRaw: RawConversation = {
        source: 'chatgpt',
        title: 'Blank',
        messages: [
          { role: 'user', content: '    \n\n\t   ' },
          { role: 'assistant', content: '\u200B\uFEFF' } // Zero-width spaces
        ]
      };

      expect(() => ConversationNormalizer.normalize(blankRaw)).toThrow(NormalizationError);
    });

    it('rejects invalid message roles', () => {
      const invalidRoleRaw: RawConversation = {
        source: 'chatgpt',
        title: 'Invalid Role Test',
        messages: [{ role: 'moderator_admin', content: 'Hello' }]
      };

      expect(() => ConversationNormalizer.normalize(invalidRoleRaw)).toThrowError(
        /Invalid message role/
      );
    });

    it('rejects unsupported sources', () => {
      const invalidSourceRaw: RawConversation = {
        source: 'unsupported_platform',
        title: 'Test',
        messages: [{ role: 'user', content: 'Hello' }]
      };

      expect(() => ConversationNormalizer.normalize(invalidSourceRaw)).toThrowError(
        /Invalid conversation source/
      );
    });
  });

  describe('Source Expansion Preparation (Claude & Gemini)', () => {
    it('supports future sources enum values', () => {
      expect(ConversationSource.CHATGPT).toBe('chatgpt');
      expect(ConversationSource.CLAUDE).toBe('claude');
      expect(ConversationSource.GEMINI).toBe('gemini');

      expect(normalizeSource('CHATGPT')).toBe('chatgpt');
      expect(normalizeSource('claude')).toBe('claude');
      expect(normalizeSource('GEMINI')).toBe('gemini');
    });
  });

  describe('Helper Normalizers', () => {
    it('normalizeContentWhitespace strips zero-width chars and collapses newlines', () => {
      const dirty = '\uFEFF  Line 1   \n\n\n\n\n  Line 2   \u200B';
      expect(normalizeContentWhitespace(dirty)).toBe('Line 1\n\nLine 2');
    });

    it('normalizeMessageRole accepts human and ai aliases', () => {
      expect(normalizeMessageRole('human')).toBe('user');
      expect(normalizeMessageRole('ai')).toBe('assistant');
      expect(normalizeMessageRole('bot')).toBe('assistant');
      expect(normalizeMessageRole('system')).toBe('system');
    });

    it('normalizeTimestamp parses various input formats into valid ISO string', () => {
      const iso = normalizeTimestamp('2026-08-09T12:00:00Z');
      expect(iso).toBe('2026-08-09T12:00:00.000Z');

      const fromNumber = normalizeTimestamp(1700000000000);
      expect(fromNumber).toMatch(/^\d{4}-\d{2}-\d{2}T/);

      const fallback = normalizeTimestamp('invalid-date-string');
      expect(fallback).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });
});
