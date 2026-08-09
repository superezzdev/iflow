/**
 * Individual key takeaway extracted from an AI conversation.
 */
export interface KeyTakeaway {
  point: string;
  explanation: string;
  quoteSnippet?: string;
}

/**
 * Structured insight extracted by the AI provider from a captured conversation.
 */
export interface ExtractedInsight {
  id: string;
  conversationId: string;
  title: string;
  coreIdea: string;
  keyTakeaways: KeyTakeaway[];
  practicalApplications: string[];
  suggestedHooks: string[];
  tags: string[];
  suggestedTone?: 'professional' | 'storytelling' | 'educational' | 'analytical';
  createdAt: string;
}

/**
 * Options to guide the insight extraction process.
 */
export interface InsightExtractionOptions {
  focusTopic?: string;
  targetAudience?: string;
  maxTakeaways?: number;
}
