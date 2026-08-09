import { CHATGPT_SELECTORS } from './selectors';

/**
 * Clean and normalize conversation title from document or sidebar elements.
 */
export function normalizeTitle(rawTitle: string): string {
  if (!rawTitle || typeof rawTitle !== 'string') {
    return 'ChatGPT Conversation';
  }

  const cleaned = rawTitle
    .replace(/\s*[-–—|]\s*ChatGPT.*$/i, '')
    .replace(/^ChatGPT\s*[-–—|]\s*/i, '')
    .replace(/\s*[-–—|]\s*OpenAI.*$/i, '')
    .trim();

  return cleaned.length > 0 ? cleaned : 'ChatGPT Conversation';
}

/**
 * Normalize whitespace in message content:
 * - Collapses 3+ consecutive newlines to 2
 * - Removes trailing whitespace on individual lines
 * - Trims outer message whitespace
 */
export function normalizeWhitespace(content: string): string {
  if (!content) return '';

  return content
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+$/gm, '') // Trim trailing whitespace per line
    .replace(/\n{3,}/g, '\n\n') // Collapse excessive newlines
    .trim();
}

/**
 * Extract clean, noise-free text from a DOM element by removing buttons,
 * icons, toolbars, and screen-reader elements from a cloned node.
 */
export function extractCleanElementText(element: Element): string {
  try {
    const clone = element.cloneNode(true) as Element;

    // Remove all known UI noise elements from the cloned tree
    for (const noiseSelector of CHATGPT_SELECTORS.noiseElements) {
      const noisyNodes = clone.querySelectorAll(noiseSelector);
      noisyNodes.forEach((node) => node.remove());
    }

    // Prefer inner content bodies if present
    for (const bodySelector of CHATGPT_SELECTORS.contentBodies) {
      const bodyNode = clone.querySelector(bodySelector);
      if (bodyNode && bodyNode.textContent && bodyNode.textContent.trim().length > 0) {
        return normalizeWhitespace(bodyNode.textContent);
      }
    }

    return normalizeWhitespace(clone.textContent || '');
  } catch {
    return normalizeWhitespace(element.textContent || '');
  }
}

/**
 * Generate a unique ID for captured conversations or messages.
 */
export function generateId(prefix: string): string {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${randomPart}`;
}
