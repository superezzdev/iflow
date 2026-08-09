/**
 * Raw unvalidated message emitted directly by platform parsers before normalization.
 */
export interface RawMessage {
  role: string;
  content: string;
  timestamp?: string | number | Date;
  orderIndex?: number;
  id?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Raw unvalidated conversation payload emitted directly by platform parsers.
 */
export interface RawConversation {
  source: string;
  title?: string;
  url?: string;
  capturedAt?: string | number | Date;
  messages: RawMessage[];
  metadata?: Record<string, unknown>;
}
