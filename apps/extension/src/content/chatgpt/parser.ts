import {
  ConversationNormalizer,
  ConversationSource,
  type IChatParser,
  type ParserResult,
  type RawConversation,
  type RawMessage
} from '@mindpost/shared';
import { CHATGPT_DOMAINS, CHATGPT_SELECTORS } from './selectors';
import { extractCleanElementText, normalizeTitle } from './normalizer';
import type { ChatGPTParseOptions } from './types';

/**
 * Isolated ChatGPT DOM Parser for MindPost.
 *
 * Implements the IChatParser contract.
 * Pipeline:
 *   ChatGPT DOM -> ChatGPT Parser -> RawConversation -> Normalizer -> Conversation domain model
 */
export class ChatGPTParser implements IChatParser {
  readonly source = ConversationSource.CHATGPT;

  /**
   * Check if a given URL is a supported ChatGPT chat interface.
   */
  canParse(url?: string, _doc?: Document): boolean {
    if (!url || typeof url !== 'string') return false;

    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();
      return CHATGPT_DOMAINS.some(
        (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
      );
    } catch {
      return false;
    }
  }

  /**
   * Parse the active DOM document into a normalized Conversation domain model.
   */
  async parse(
    doc: Document,
    context?: Record<string, unknown> | string,
    options?: ChatGPTParseOptions
  ): Promise<ParserResult> {
    try {
      // 1. Verify document presence
      if (!doc || !doc.body) {
        return {
          success: false,
          error: {
            code: 'UNSUPPORTED_PAGE',
            message: 'Invalid DOM document provided to ChatGPT parser.'
          }
        };
      }

      // 2. Extract URL from context if provided
      let currentUrl = '';
      if (typeof context === 'string') {
        currentUrl = context;
      } else if (context && typeof context.url === 'string') {
        currentUrl = context.url;
      } else if (typeof window !== 'undefined' && window.location?.href) {
        currentUrl = window.location.href;
      }

      // Validate URL if present
      if (currentUrl && !this.canParse(currentUrl, doc)) {
        return {
          success: false,
          error: {
            code: 'UNSUPPORTED_PAGE',
            message: `Current page (${currentUrl}) is not a supported ChatGPT domain.`
          }
        };
      }

      // 3. Locate conversation turn nodes with multi-tier fallback selectors
      const turnElements = this.findTurnElements(doc);

      if (turnElements.length === 0) {
        return {
          success: false,
          error: {
            code: 'NO_MESSAGES_FOUND',
            message: 'No conversation messages found. Please open an active ChatGPT thread and try again.'
          }
        };
      }

      // 4. Extract conversation title from DOM
      const title = options?.customTitle || this.extractTitle(doc);

      // 5. Extract raw messages from DOM elements
      const rawMessages: RawMessage[] = [];
      let orderIndex = 0;

      for (const turnEl of turnElements) {
        const role = this.detectTurnRole(turnEl);
        const content = extractCleanElementText(turnEl);

        // Keep non-empty content
        if (content.length > 0) {
          rawMessages.push({
            role,
            content,
            orderIndex,
            timestamp: new Date().toISOString()
          });
          orderIndex++;

          if (options?.maxMessages && rawMessages.length >= options.maxMessages) {
            break;
          }
        }
      }

      // 6. Construct RawConversation payload
      const rawConversation: RawConversation = {
        source: this.source,
        title,
        url: currentUrl || undefined,
        capturedAt: new Date().toISOString(),
        messages: rawMessages
      };

      // 7. Pass RawConversation through Domain Normalizer
      const normalizationResult = ConversationNormalizer.safeNormalize(rawConversation);

      if (!normalizationResult.success) {
        return {
          success: false,
          error: {
            code:
              normalizationResult.error.code === 'EMPTY_CONVERSATION'
                ? 'NO_MESSAGES_FOUND'
                : 'DOM_STRUCTURE_CHANGED',
            message: normalizationResult.error.message
          }
        };
      }

      return {
        success: true,
        conversation: normalizationResult.conversation
      };
    } catch (err) {
      return {
        success: false,
        error: {
          code: 'PARSER_FAILED',
          message: err instanceof Error ? err.message : 'Unexpected parser error occurred.'
        }
      };
    }
  }

  /**
   * Find conversation turn elements using fallback selector priority.
   */
  private findTurnElements(doc: Document): Element[] {
    for (const selector of CHATGPT_SELECTORS.turns) {
      try {
        const elements = Array.from(doc.querySelectorAll(selector));
        if (elements.length > 0) {
          return elements;
        }
      } catch {
        // Continue to next selector fallback
      }
    }
    return [];
  }

  /**
   * Determine whether a turn element represents a 'user' or 'assistant' message.
   */
  private detectTurnRole(element: Element): 'user' | 'assistant' {
    const authorAttr = element.getAttribute('data-message-author-role');
    if (authorAttr === 'user') return 'user';
    if (authorAttr === 'assistant') return 'assistant';

    for (const userSel of CHATGPT_SELECTORS.userRole) {
      try {
        if (element.matches(userSel) || element.querySelector(userSel)) {
          return 'user';
        }
      } catch {
        // Fall through
      }
    }

    for (const assistantSel of CHATGPT_SELECTORS.assistantRole) {
      try {
        if (element.matches(assistantSel) || element.querySelector(assistantSel)) {
          return 'assistant';
        }
      } catch {
        // Fall through
      }
    }

    return 'assistant';
  }

  /**
   * Extract conversation title from document or navigation elements.
   */
  private extractTitle(doc: Document): string {
    for (const titleSelector of CHATGPT_SELECTORS.titles) {
      try {
        const el = doc.querySelector(titleSelector);
        if (el && el.textContent && el.textContent.trim().length > 0) {
          return normalizeTitle(el.textContent);
        }
      } catch {
        // Fall through
      }
    }

    return normalizeTitle(doc.title || 'ChatGPT Conversation');
  }
}
