import type { CapturedConversation, ChatMessage, MessageRole, ParserResult } from '@mindpost/shared';

export interface ChatGPTParseOptions {
  maxMessages?: number;
  customTitle?: string;
  stripUiNoise?: boolean;
}

export type ChatGPTParserResult = ParserResult;

export interface ExtractedTurn {
  role: MessageRole;
  content: string;
  rawHtml?: string;
}

export interface ChatGPTPageStatus {
  isChatGPT: boolean;
  canCapture: boolean;
  url: string;
  title: string;
  turnCount: number;
}

export type { CapturedConversation, ChatMessage, MessageRole, ParserResult };
