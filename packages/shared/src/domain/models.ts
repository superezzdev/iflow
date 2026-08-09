/**
 * Supported conversation sources across the MindPost ecosystem.
 * Phase 1 implements CHATGPT.
 * Prepared for future integration: CLAUDE, GEMINI.
 */
export const ConversationSource = {
  CHATGPT: 'chatgpt',
  CLAUDE: 'claude',
  GEMINI: 'gemini'
} as const;

export type ConversationSource = (typeof ConversationSource)[keyof typeof ConversationSource];

/**
 * Validated participant roles in a conversation thread.
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Normalized individual message in a conversation.
 * Completely decoupled from ChatGPT or DOM concepts.
 */
export interface ConversationMessage {
  id: string;
  conversationId?: string;
  role: MessageRole;
  content: string;
  timestamp: string; // ISO 8601 UTC
  orderIndex: number;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

/**
 * Enriched conversation metadata.
 */
export interface ConversationMetadata {
  source: ConversationSource;
  sourceUrl?: string;
  sourceThreadId?: string;
  capturedAt: string; // ISO 8601 UTC
  characterCount: number;
  wordCount: number;
  userMessageCount: number;
  assistantMessageCount: number;
  contentFingerprint: string;
  extra?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Canonical Conversation Domain Model.
 * Represents a clean, validated, source-agnostic AI conversation.
 */
export interface Conversation {
  id: string;
  userId?: string;
  title: string;
  source: ConversationSource;
  url?: string;
  messages: ConversationMessage[];
  totalMessages: number;
  metadata: ConversationMetadata;
  capturedAt: string; // ISO 8601 UTC
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Lightweight conversation summary representation.
 */
export interface ConversationSummary {
  id: string;
  userId?: string;
  source: ConversationSource;
  title: string;
  capturedAt: string;
  createdAt?: string;
  messageCount: number;
  totalMessages?: number;
  contentFingerprint: string;
}

/**
 * Payload for creating a conversation.
 */
export interface CreateConversationPayload {
  title?: string;
  source?: string;
  url?: string;
  messages: Array<{
    id?: string;
    role: MessageRole | string;
    content: string;
    orderIndex?: number;
    metadata?: Record<string, unknown>;
    timestamp?: string;
  }>;
  metadata?: Record<string, unknown>;
}

/**
 * Query parameters for listing conversations.
 */
export interface ListConversationsQuery {
  limit?: number;
  offset?: number;
  source?: string;
}
