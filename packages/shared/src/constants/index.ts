/**
 * Global constants for the MindPost platform.
 */

export const APP_NAME = 'MindPost';
export const APP_DESCRIPTION = 'Turn useful AI conversations into impactful social media content';

export const PLATFORM_LIMITS = {
  LINKEDIN_MAX_CHARS: 3000,
  LINKEDIN_RECOMMENDED_CHARS: 1300,
  X_MAX_CHARS: 280,
  THREADS_MAX_CHARS: 500
} as const;

export const DEFAULT_AI_PROVIDER = 'openai';
export const DEFAULT_OPENAI_MODEL = 'gpt-4o';

export const SUPPORTED_CAPTURE_DOMAINS = [
  'chatgpt.com',
  'chat.openai.com'
] as const;
