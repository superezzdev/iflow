/**
 * Source AI chat platform from which a conversation is captured.
 * In Phase 1: 'chatgpt' is the primary source.
 */
export type CaptureSource = 'chatgpt' | 'claude' | 'gemini';

/**
 * Message participant role in the chat thread.
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Individual chat message in a captured conversation.
 */
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  orderIndex: number;
  metadata?: Record<string, unknown>;
}

/**
 * Full normalized captured conversation payload.
 */
export interface CapturedConversation {
  id: string;
  source: CaptureSource;
  title: string;
  messages: ChatMessage[];
  url?: string;
  capturedAt: string;
  totalMessages: number;
  metadata?: Record<string, unknown>;
}

/**
 * Lightweight metadata summary of a captured conversation.
 */
export interface ConversationSummary {
  id: string;
  source: CaptureSource;
  title: string;
  capturedAt: string;
  messageCount: number;
}
