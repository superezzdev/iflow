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
  role: MessageRole;
  content: string;
  timestamp: string; // ISO 8601 UTC
  orderIndex: number;
  metadata?: Record<string, unknown>;
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
}

/**
 * Canonical Conversation Domain Model.
 * Represents a clean, validated, source-agnostic AI conversation.
 */
export interface Conversation {
  id: string; // Stable deterministic identifier (e.g. conv_chatgpt_a1b2c3...)
  title: string;
  source: ConversationSource;
  url?: string;
  messages: ConversationMessage[];
  totalMessages: number;
  metadata: ConversationMetadata;
  capturedAt: string; // ISO 8601 UTC
  updatedAt?: string;
}

/**
 * Lightweight conversation summary representation.
 */
export interface ConversationSummary {
  id: string;
  source: ConversationSource;
  title: string;
  capturedAt: string;
  messageCount: number;
  contentFingerprint: string;
}
