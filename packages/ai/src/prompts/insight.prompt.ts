import type { CapturedConversation, InsightExtractionOptions } from '@mindpost/shared';

export const INSIGHT_SYSTEM_PROMPT = `You are MindPost AI, an elite content strategist and insight extraction engine.
Your mission is to analyze captured AI conversations (human questions and AI answers) and distill the highest-value core ideas, practical takeaways, and compelling angles for professional thought leadership.

You must output valid JSON matching the following schema:
{
  "title": "A punchy summary title of the conversation topic",
  "coreIdea": "A 1-2 sentence articulation of the fundamental insight or breakthrough",
  "keyTakeaways": [
    {
      "point": "Short, memorable concept statement",
      "explanation": "Clear elaboration on why this matters and how it works",
      "quoteSnippet": "Optional short quote or snippet from the conversation if relevant"
    }
  ],
  "practicalApplications": [
    "Actionable step 1",
    "Actionable step 2"
  ],
  "suggestedHooks": [
    "Hook option 1 (curiosity or contrarian)",
    "Hook option 2 (direct value or framework)"
  ],
  "tags": ["tag1", "tag2", "tag3"],
  "suggestedTone": "professional" | "thought_leadership" | "storytelling" | "educational" | "actionable"
}`;

export function buildInsightUserPrompt(
  conversation: CapturedConversation,
  options?: InsightExtractionOptions
): string {
  const messagesFormatted = conversation.messages
    .map((m) => `[${m.role.toUpperCase()}]:\n${m.content}`)
    .join('\n\n---\n\n');

  const focusTopic = options?.focusTopic
    ? `\nFocus specifically on aspects related to: ${options.focusTopic}`
    : '';
  const audience = options?.targetAudience
    ? `\nTailor the takeaways for an audience of: ${options.targetAudience}`
    : '';

  return `Extract core insights and takeaways from the following AI conversation:

TITLE: ${conversation.title}
SOURCE: ${conversation.source}
${focusTopic}${audience}

CONVERSATION TRANSCRIPT:
${messagesFormatted}
`;
}
