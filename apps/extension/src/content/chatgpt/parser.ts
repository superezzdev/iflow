import type { IChatParser, MessageRole, ChatMessage, CapturedConversation, ParserResult } from '@mindpost/shared';
import { CHATGPT_DOMAINS, CHATGPT_SELECTORS } from './selectors';
import { normalizeTitle, extractCleanElementText, generateId } from './normalizer';
import type { ChatGPTParseOptions } from './types';

/**
 * Isolated ChatGPT DOM Parser for MindPost.
 *
 * Implements the IChatParser contract. Decouples the rest of the application
 * from ChatGPT DOM changes and guarantees no exceptions crash the extension.
 */
export class ChatGPTParser implements IChatParser {
  readonly source = 'chatgpt' as const;

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
   * Parse the active DOM document into a normalized CapturedConversation object.
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

      // 4. Extract conversation title
      const title = options?.customTitle || this.extractTitle(doc);

      // 5. Extract and normalize messages in sequential order
      const messages: ChatMessage[] = [];
      let orderIndex = 0;

      for (const turnEl of turnElements) {
        const role = this.detectTurnRole(turnEl);
        const content = extractCleanElementText(turnEl);

        // Ignore empty messages
        if (content.length > 0) {
          messages.push({
            id: generateId('msg'),
            role,
            content,
            timestamp: new Date().toISOString(),
            orderIndex
          });
          orderIndex++;

          if (options?.maxMessages && messages.length >= options.maxMessages) {
            break;
          }
        }
      }

      // 6. Ensure at least one valid message was extracted
      if (messages.length === 0) {
        return {
          success: false,
          error: {
            code: 'DOM_STRUCTURE_CHANGED',
            message: 'Found message containers but failed to extract text. ChatGPT DOM structure may have updated.'
          }
        };
      }

      const conversation: CapturedConversation = {
        id: generateId('conv'),
        source: this.source,
        title,
        url: currentUrl || undefined,
        capturedAt: new Date().toISOString(),
        totalMessages: messages.length,
        messages
      };

      return {
        success: true,
        conversation
      };
    } catch (err) {
      // Rule 8: Never crash the extension because a selector or DOM operation failed
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
  private detectTurnRole(element: Element): MessageRole {
    // Priority 1: Check standard data-message-author-role attribute
    const authorAttr = element.getAttribute('data-message-author-role');
    if (authorAttr === 'user') return 'user';
    if (authorAttr === 'assistant') return 'assistant';

    // Priority 2: Check user role selectors
    for (const userSel of CHATGPT_SELECTORS.userRole) {
      try {
        if (element.matches(userSel) || element.querySelector(userSel)) {
          return 'user';
        }
      } catch {
        // Fall through
      }
    }

    // Priority 3: Check assistant role selectors
    for (const assistantSel of CHATGPT_SELECTORS.assistantRole) {
      try {
        if (element.matches(assistantSel) || element.querySelector(assistantSel)) {
          return 'assistant';
        }
      } catch {
        // Fall through
      }
    }

    // Default fallback based on presence of user-specific styling or fallback to assistant
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
