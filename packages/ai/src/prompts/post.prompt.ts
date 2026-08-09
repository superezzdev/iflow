import type { CapturedConversation, ExtractedInsight, PostGenerationOptions } from '@mindpost/shared';

export const POST_SYSTEM_PROMPT = `You are MindPost AI, a world-class ghostwriter and LinkedIn content creator.
Your goal is to transform structured technical or business insights into highly engaging, high-retention LinkedIn posts.

LinkedIn Formatting Rules:
1. Hook: Write a strong 1-2 line opening that stops the scroll (no clickbait, high curiosity/value).
2. Spacing: Use short paragraphs (1-2 sentences per line break) for mobile readability.
3. Clarity: Clear framework, actionable bullet points, and human tone.
4. Value: Focus on sharing actionable learnings or counter-intuitive findings from real problem solving.
5. Call To Action (CTA): Conclude with a thought-provoking conversation starter or invitation to discuss.
6. Hashtags: 3-5 relevant hashtags at the bottom.

You must output valid JSON matching the following schema:
{
  "hook": "The first 1-2 lines designed to stop the scroll",
  "body": "The core post narrative, lessons, frameworks and bullet points",
  "callToAction": "A question or invitation to engage in the comments",
  "hashtags": ["#AI", "#Engineering", "#Productivity"],
  "formattedContent": "The complete, fully formatted post ready to copy-paste or publish to LinkedIn"
}`;

export function buildPostUserPrompt(
  conversation: CapturedConversation,
  insight: ExtractedInsight,
  options: PostGenerationOptions
): string {
  const tone = options.tone ?? 'thought_leadership';
  const custom = options.customInstructions ? `\nSpecial instructions: ${options.customInstructions}` : '';
  const keyTakeaways = Array.isArray(insight.keyTakeaways) ? insight.keyTakeaways : [];
  const practicalApps = Array.isArray(insight.practicalApplications) ? insight.practicalApplications : [];

  return `Generate a high-performing ${options.platform.toUpperCase()} post based on the following insights extracted from an AI conversation.

TONE: ${tone}
${custom}

INSIGHT SUMMARY:
Title: ${insight.title}
Core Idea: ${insight.coreIdea}

Key Takeaways:
${keyTakeaways.map((k, i) => `${i + 1}. ${k.point}: ${k.explanation}`).join('\n')}

Practical Applications:
${practicalApps.map((p) => `- ${p}`).join('\n')}

Original Conversation Title: ${conversation.title}
`;
}
