import type { CaptureSource, CapturedConversation } from './conversation';

/**
 * Standardized result returned by any chat DOM parser.
 */
export interface ParserResult {
  success: boolean;
  conversation?: CapturedConversation;
  error?: {
    code: 'NO_MESSAGES_FOUND' | 'DOM_STRUCTURE_CHANGED' | 'UNSUPPORTED_PAGE' | 'PARSER_FAILED';
    message: string;
    detectedSelectors?: string[];
  };
}

/**
 * Generic configuration for DOM selectors used by chat parsers.
 * This allows selectors to be versioned or dynamically adjusted without rewriting logic.
 */
export interface ParserSelectorConfig {
  source: CaptureSource;
  containerSelectors: string[];
  messageTurnSelectors: string[];
  userMessageSelectors: string[];
  assistantMessageSelectors: string[];
  titleSelectors: string[];
}

/**
 * Abstract interface that every platform DOM parser must implement.
 * Ensures the extension core is completely decoupled from DOM extraction specifics.
 */
export interface IChatParser {
  readonly source: CaptureSource;
  canParse(url: string, document: Document): boolean;
  parse(document: Document, context?: Record<string, unknown>): Promise<ParserResult>;
}
