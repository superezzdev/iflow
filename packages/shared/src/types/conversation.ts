import type {
  Conversation,
  ConversationMessage,
  ConversationMetadata,
  ConversationSource,
  ConversationSummary,
  MessageRole
} from '../domain/models';

export {
  ConversationSource,
  type Conversation,
  type ConversationMessage,
  type ConversationMetadata,
  type ConversationSummary,
  type MessageRole
};

/**
 * Backward compatibility type aliases for Phase 1.
 */
export type CaptureSource = ConversationSource;
export type ChatMessage = ConversationMessage;
export type CapturedConversation = Conversation;
