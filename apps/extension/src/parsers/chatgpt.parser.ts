import type {
  IChatParser,
  ParserResult,
  ParserSelectorConfig,
  ChatMessage,
  CapturedConversation
} from '@mindpost/shared';

/**
 * Isolated ChatGPT DOM Parser.
 *
 * Designed according to Rule 9 & 10:
 * - Completely decoupled from the rest of the application.
 * - Uses fallback selector arrays to tolerate ChatGPT DOM updates.
 * - Extracts clean text without leaking DOM-specific attributes.
 */
export class ChatGPTParser implements IChatParser {
  readonly source = 'chatgpt' as const;

  /**
   * Configurable selectors with multiple fallback strategies for ChatGPT DOM structures.
   */
  private readonly config: ParserSelectorConfig = {
    source: 'chatgpt',
    containerSelectors: [
      'main div.flex-1',
      'div[role="presentation"]',
      'main'
    ],
    messageTurnSelectors: [
      'article[data-testid^="conversation-turn-"]',
      'div[data-message-author-role]',
      'article'
    ],
    userMessageSelectors: [
      'div[data-message-author-role="user"]',
      'div[class*="user"]',
      '[data-testid="user-message"]'
    ],
    assistantMessageSelectors: [
      'div[data-message-author-role="assistant"]',
      'div[class*="agent"]',
      '[data-testid="assistant-message"]',
      'div.markdown'
    ],
    titleSelectors: [
      'title',
      'h1',
      'nav li a[class*="active"]'
    ]
  };

  /**
   * Check if current page is ChatGPT.
   */
  canParse(url: string, _document: Document): boolean {
    try {
      const parsedUrl = new URL(url);
      return (
        parsedUrl.hostname === 'chatgpt.com' ||
        parsedUrl.hostname === 'chat.openai.com'
      );
    } catch {
      return false;
    }
  }

  /**
   * Parse ChatGPT DOM into normalized CapturedConversation.
   */
  async parse(doc: Document, _context?: Record<string, unknown>): Promise<ParserResult> {
    try {
      const messages: ChatMessage[] = [];
      const title = this.extractTitle(doc);

      // Locate turn elements using configured fallback selectors
      let turnElements: Element[] = [];
      for (const selector of this.config.messageTurnSelectors) {
        const found = Array.from(doc.querySelectorAll(selector));
        if (found.length > 0) {
          turnElements = found;
          break;
        }
      }

      if (turnElements.length === 0) {
        return {
          success: false,
          error: {
            code: 'NO_MESSAGES_FOUND',
            message: 'No conversation messages found in current ChatGPT page view. Please ensure a chat is open.'
          }
        };
      }

      let orderIndex = 0;
      for (const turn of turnElements) {
        const role = this.detectRole(turn);
        const content = this.extractContent(turn);

        if (content.trim().length > 0) {
          messages.push({
            id: `msg_${orderIndex}_${Date.now()}`,
            role,
            content,
            timestamp: new Date().toISOString(),
            orderIndex
          });
          orderIndex++;
        }
      }

      if (messages.length === 0) {
        return {
          success: false,
          error: {
            code: 'DOM_STRUCTURE_CHANGED',
            message: 'Detected conversation turns but could not extract message content. The ChatGPT layout may have changed.'
          }
        };
      }

      const conversation: CapturedConversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        source: 'chatgpt',
        title,
        messages,
        url: doc.location?.href,
        capturedAt: new Date().toISOString(),
        totalMessages: messages.length
      };

      return {
        success: true,
        conversation
      };
    } catch (err) {
      return {
        success: false,
        error: {
          code: 'PARSER_FAILED',
          message: err instanceof Error ? err.message : 'Unknown parser error occurred while reading DOM'
        }
      };
    }
  }

  private extractTitle(doc: Document): string {
    const rawTitle = doc.title || 'ChatGPT Conversation';
    // Remove " - ChatGPT" or "ChatGPT" suffix
    return rawTitle.replace(/\s*-\s*ChatGPT$/i, '').trim() || 'ChatGPT Conversation';
  }

  private detectRole(element: Element): 'user' | 'assistant' {
    const authorRole = element.getAttribute('data-message-author-role');
    if (authorRole === 'user') return 'user';
    if (authorRole === 'assistant') return 'assistant';

    // Check inner user selectors
    for (const userSel of this.config.userMessageSelectors) {
      if (element.querySelector(userSel) || element.matches(userSel)) {
        return 'user';
      }
    }
    return 'assistant';
  }

  private extractContent(element: Element): string {
    // Prefer markdown body or inner message content
    const markdownBody = element.querySelector('.markdown, div[class*="markdown"], .whitespace-pre-wrap');
    if (markdownBody && markdownBody.textContent) {
      return markdownBody.textContent.trim();
    }
    return element.textContent?.trim() || '';
  }
}
