/**
 * Deterministic hash function (FNV-1a 64-bit implementation in pure TypeScript).
 * Fast, high-entropy, and works consistently across Node, Browser, and Web Workers without native dependencies.
 */
export function deterministicHash(input: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;

  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hash48 = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return hash48.toString(36).padStart(10, '0');
}

/**
 * Extract canonical thread ID from URL (e.g., chatgpt.com/c/6789-abcd -> 6789-abcd).
 */
export function extractThreadIdFromUrl(url?: string): string | undefined {
  if (!url || typeof url !== 'string') return undefined;

  try {
    const parsed = new URL(url);
    // Matches /c/{threadId} or /g/{gptId}/c/{threadId}
    const match = parsed.pathname.match(/\/c\/([a-zA-Z0-9_-]+)/i);
    if (match && match[1]) {
      return match[1];
    }
  } catch {
    // Non-standard URL string
    const match = url.match(/\/c\/([a-zA-Z0-9_-]+)/i);
    if (match && match[1]) {
      return match[1];
    }
  }

  return undefined;
}

/**
 * Generate a stable, deterministic conversation ID based on source, thread identity, and content fingerprint.
 * Re-capturing the same conversation yields the exact same ID.
 */
export function generateStableConversationId(params: {
  source: string;
  url?: string;
  title: string;
  contentFingerprint: string;
}): string {
  const source = params.source.toLowerCase();
  const threadId = extractThreadIdFromUrl(params.url);

  // If a thread ID is present, use it as primary anchor
  let seed: string;
  if (threadId) {
    seed = `${source}:${threadId}:${params.contentFingerprint}`;
  } else if (params.url && params.url.trim().length > 0) {
    seed = `${source}:${params.url.trim()}:${params.contentFingerprint}`;
  } else {
    seed = `${source}:${params.title.trim()}:${params.contentFingerprint}`;
  }

  const hash = deterministicHash(seed);
  return `conv_${source}_${hash}`;
}

/**
 * Generate a deterministic message ID within a conversation.
 */
export function generateStableMessageId(
  conversationId: string,
  orderIndex: number,
  role: string,
  contentSnippet: string
): string {
  const hash = deterministicHash(`${conversationId}:${role}:${orderIndex}:${contentSnippet.slice(0, 60)}`);
  return `msg_${orderIndex}_${hash}`;
}
