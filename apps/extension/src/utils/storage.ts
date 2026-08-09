import type { CapturedConversation } from '@mindpost/shared';

const STORAGE_KEYS = {
  CONVERSATIONS: 'mindpost_conversations',
  ACTIVE_ID: 'mindpost_active_conversation_id',
  CAPTURE_ENABLED: 'mindpost_capture_enabled'
} as const;

let inMemoryConversations: CapturedConversation[] = [];

function hasChromeStorage(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.storage?.local;
}

/**
 * Save a newly captured conversation to local extension storage.
 * Prepends the newest conversation to the front of the list.
 */
export async function saveCapturedConversation(conversation: CapturedConversation): Promise<void> {
  if (hasChromeStorage()) {
    const existing = await getCapturedConversations();
    // Filter out duplicates if ID matches
    const updated = [conversation, ...existing.filter((c) => c.id !== conversation.id)];
    await chrome.storage.local.set({
      [STORAGE_KEYS.CONVERSATIONS]: updated,
      [STORAGE_KEYS.ACTIVE_ID]: conversation.id
    });
  } else {
    inMemoryConversations = [
      conversation,
      ...inMemoryConversations.filter((c) => c.id !== conversation.id)
    ];
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(inMemoryConversations));
        localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, conversation.id);
      } catch {
        // Fallback to in-memory
      }
    }
  }
}

/**
 * Retrieve all captured conversations from local storage.
 */
export async function getCapturedConversations(): Promise<CapturedConversation[]> {
  if (hasChromeStorage()) {
    const result = await chrome.storage.local.get(STORAGE_KEYS.CONVERSATIONS);
    const list = result[STORAGE_KEYS.CONVERSATIONS];
    return Array.isArray(list) ? (list as CapturedConversation[]) : [];
  }

  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      if (raw) {
        return JSON.parse(raw) as CapturedConversation[];
      }
    } catch {
      // Fall through to in-memory
    }
  }

  return inMemoryConversations;
}

/**
 * Retrieve the most recently captured conversation.
 */
export async function getLatestCapturedConversation(): Promise<CapturedConversation | null> {
  const conversations = await getCapturedConversations();
  if (conversations.length > 0) {
    return conversations[0] ?? null;
  }
  return null;
}

/**
 * Retrieve a specific captured conversation by its unique ID.
 */
export async function getCapturedConversationById(id: string): Promise<CapturedConversation | null> {
  const conversations = await getCapturedConversations();
  return conversations.find((c) => c.id === id) ?? null;
}

/**
 * Delete a specific captured conversation by ID.
 */
export async function deleteCapturedConversation(id: string): Promise<void> {
  const current = await getCapturedConversations();
  const filtered = current.filter((c) => c.id !== id);

  if (hasChromeStorage()) {
    await chrome.storage.local.set({ [STORAGE_KEYS.CONVERSATIONS]: filtered });
  } else {
    inMemoryConversations = filtered;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(filtered));
    }
  }
}

/**
 * Clear all locally stored conversation data.
 */
export async function clearAllCapturedConversations(): Promise<void> {
  if (hasChromeStorage()) {
    await chrome.storage.local.remove([STORAGE_KEYS.CONVERSATIONS, STORAGE_KEYS.ACTIVE_ID]);
  } else {
    inMemoryConversations = [];
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ID);
    }
  }
}
