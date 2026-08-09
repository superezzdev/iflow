import { describe, it, expect } from 'vitest';
import { ChatGPTParser } from '../parser';
import { normalizeTitle, normalizeWhitespace } from '../normalizer';
import type { ChatMessage } from '@mindpost/shared';
import {
  STANDARD_CHATGPT_HTML,
  MULTI_TURN_CHATGPT_HTML,
  NOISY_CHATGPT_HTML,
  FALLBACK_SELECTORS_HTML,
  EMPTY_PAGE_HTML
} from './fixtures';

function createDocument(html: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(html, 'text/html');
}

describe('ChatGPTParser', () => {
  const parser = new ChatGPTParser();

  describe('canParse (URL Validation)', () => {
    it('returns true for official ChatGPT domains', () => {
      expect(parser.canParse('https://chatgpt.com')).toBe(true);
      expect(parser.canParse('https://chatgpt.com/c/6789-abcd-1234')).toBe(true);
      expect(parser.canParse('https://chat.openai.com')).toBe(true);
      expect(parser.canParse('https://chat.openai.com/c/xyz')).toBe(true);
    });

    it('returns false for non-ChatGPT domains', () => {
      expect(parser.canParse('https://google.com')).toBe(false);
      expect(parser.canParse('https://linkedin.com/feed')).toBe(false);
      expect(parser.canParse('https://claude.ai/chat')).toBe(false);
      expect(parser.canParse('')).toBe(false);
      expect(parser.canParse(undefined)).toBe(false);
    });
  });

  describe('parse (Standard Conversation Extraction)', () => {
    it('extracts messages in sequential order with correct roles', async () => {
      const doc = createDocument(STANDARD_CHATGPT_HTML);
      const result = await parser.parse(doc, 'https://chatgpt.com/c/123');

      expect(result.success).toBe(true);
      expect(result.conversation).toBeDefined();

      const conv = result.conversation!;
      expect(conv.source).toBe('chatgpt');
      expect(conv.title).toBe('PostgreSQL Connection Pooling in Next.js');
      expect(conv.totalMessages).toBe(2);
      expect(conv.messages).toHaveLength(2);

      // Verify User Message
      expect(conv.messages[0]?.role).toBe('user');
      expect(conv.messages[0]?.orderIndex).toBe(0);
      expect(conv.messages[0]?.content).toContain(
        'How do I properly configure connection pooling with Prisma'
      );
      // Ensure button text "Edit" was not included
      expect(conv.messages[0]?.content).not.toContain('Edit');

      // Verify Assistant Message
      expect(conv.messages[1]?.role).toBe('assistant');
      expect(conv.messages[1]?.orderIndex).toBe(1);
      expect(conv.messages[1]?.content).toContain('To configure Prisma connection pooling');
      expect(conv.messages[1]?.content).toContain('globalThis.prisma');
      // Ensure button text "Copy" and screen-reader noise were stripped
      expect(conv.messages[1]?.content).not.toContain('Copy');
      expect(conv.messages[1]?.content).not.toContain('Feedback submitted');
    });
  });

  describe('parse (Multi-Turn Conversations)', () => {
    it('preserves exact turn order across 4 alternating turns', async () => {
      const doc = createDocument(MULTI_TURN_CHATGPT_HTML);
      const result = await parser.parse(doc, 'https://chatgpt.com/c/generic-types');

      expect(result.success).toBe(true);
      const conv = result.conversation!;
      expect(conv.messages).toHaveLength(4);

      const roles = conv.messages.map((m: ChatMessage) => m.role);
      expect(roles).toEqual(['user', 'assistant', 'user', 'assistant']);

      const indices = conv.messages.map((m: ChatMessage) => m.orderIndex);
      expect(indices).toEqual([0, 1, 2, 3]);

      expect(conv.messages[0]?.content).toContain('type and interface');
      expect(conv.messages[1]?.content).toContain('Interfaces are extendable');
      expect(conv.messages[2]?.content).toContain('mapped type');
      expect(conv.messages[3]?.content).toContain('type Readonly<T>');
    });
  });

  describe('parse (UI Noise Removal)', () => {
    it('strips toolbars, buttons, svgs, and sr-only helper elements', async () => {
      const doc = createDocument(NOISY_CHATGPT_HTML);
      const result = await parser.parse(doc, 'https://chatgpt.com/c/microservices');

      expect(result.success).toBe(true);
      const conv = result.conversation!;
      expect(conv.messages).toHaveLength(2);

      const assistantMsg = conv.messages[1]?.content;
      expect(assistantMsg).toContain('Design around bounded contexts');
      expect(assistantMsg).not.toContain('Copy');
      expect(assistantMsg).not.toContain('Listen');
      expect(assistantMsg).not.toContain('Screen reader notice');
    });
  });

  describe('parse (Fallback Selector Resilience)', () => {
    it('parses older or alternate DOM representations cleanly', async () => {
      const doc = createDocument(FALLBACK_SELECTORS_HTML);
      const result = await parser.parse(doc, 'https://chatgpt.com/c/legacy');

      expect(result.success).toBe(true);
      const conv = result.conversation!;
      expect(conv.title).toBe('Legacy Structure');
      expect(conv.messages).toHaveLength(2);
      expect(conv.messages[0]?.role).toBe('user');
      expect(conv.messages[0]?.content).toBe('Tell me about event loops.');
      expect(conv.messages[1]?.role).toBe('assistant');
      expect(conv.messages[1]?.content).toContain('The event loop continuously monitors');
    });
  });

  describe('parse (Empty / Malformed Page Handling)', () => {
    it('fails gracefully without throwing an exception when no messages exist', async () => {
      const doc = createDocument(EMPTY_PAGE_HTML);
      const result = await parser.parse(doc, 'https://chatgpt.com');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('NO_MESSAGES_FOUND');
    });

    it('rejects unsupported domains with clear error code', async () => {
      const doc = createDocument('<html><body><div>Hello</div></body></html>');
      const result = await parser.parse(doc, 'https://unknown-website.com');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('UNSUPPORTED_PAGE');
    });
  });
});

describe('Normalizer Utilities', () => {
  it('normalizeTitle cleans ChatGPT and OpenAI branding suffixes', () => {
    expect(normalizeTitle('Building Data Apps - ChatGPT')).toBe('Building Data Apps');
    expect(normalizeTitle('Prisma Connection Pooling | OpenAI')).toBe('Prisma Connection Pooling');
    expect(normalizeTitle('ChatGPT - Architecture Guide')).toBe('Architecture Guide');
    expect(normalizeTitle('')).toBe('ChatGPT Conversation');
  });

  it('normalizeWhitespace collapses excessive newlines and trims whitespace', () => {
    const messy = '   Hello world   \n\n\n\n\nNew paragraph here.   \n\n   ';
    const cleaned = normalizeWhitespace(messy);
    expect(cleaned).toBe('Hello world\n\nNew paragraph here.');
  });
});
