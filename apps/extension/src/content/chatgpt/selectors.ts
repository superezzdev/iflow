/**
 * ChatGPT DOM Selectors and Matchers.
 *
 * Isolated selector matrix to prevent leaking DOM structures across the application.
 * Utilizes multi-tier fallback arrays to ensure resilience against ChatGPT UI changes.
 */

export const CHATGPT_DOMAINS = [
  'chatgpt.com',
  'chat.openai.com'
] as const;

export const CHATGPT_SELECTORS = {
  /**
   * Conversation container element selectors (ordered by specificity).
   */
  containers: [
    '[data-testid="conversation-turn-list"]',
    'main div.flex-1',
    'div[role="presentation"]',
    'div.flex-1.overflow-hidden',
    'main'
  ],

  /**
   * Conversation turn wrappers (each turn represents a user question or assistant response).
   */
  turns: [
    'article[data-testid^="conversation-turn-"]',
    'div[data-message-author-role]',
    'article',
    'div[data-testid="conversation-turn"]',
    'div[class*="conversation-turn"]',
    'div[class*="text-base"]'
  ],

  /**
   * Selectors indicating a user message turn.
   */
  userRole: [
    '[data-message-author-role="user"]',
    '[data-testid="user-message"]',
    'div[class*="user"]',
    'div[data-testid*="user"]'
  ],

  /**
   * Selectors indicating an assistant / AI message turn.
   */
  assistantRole: [
    '[data-message-author-role="assistant"]',
    '[data-testid="assistant-message"]',
    'div[class*="agent"]',
    'div[class*="assistant"]',
    '.markdown'
  ],

  /**
   * Inner content container selectors.
   */
  contentBodies: [
    '.markdown',
    'div[class*="markdown"]',
    '.whitespace-pre-wrap',
    'div[class*="whitespace-pre-wrap"]',
    'div[class*="text-message"]',
    'div[class*="min-h-[20px]"]'
  ],

  /**
   * Title elements within document or sidebar.
   */
  titles: [
    'h1',
    'nav li a[class*="active"]',
    'nav a[class*="bg-token-surface-secondary"]',
    'nav div.truncate',
    'title'
  ],

  /**
   * UI noise elements to exclude/strip during text extraction.
   */
  noiseElements: [
    'button',
    'svg',
    '[role="toolbar"]',
    '[data-testid*="action-button"]',
    '[data-testid*="copy"]',
    '[data-testid*="regenerate"]',
    '[data-testid*="voice"]',
    '[aria-label*="Copy"]',
    '[aria-label*="Read aloud"]',
    '[aria-label*="Good response"]',
    '[aria-label*="Bad response"]',
    '.sr-only',
    '.select-none',
    'form',
    'footer',
    'nav',
    '[class*="action-bar"]',
    '[class*="toolbar"]'
  ]
} as const;
