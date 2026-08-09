import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConversationService } from '../services/conversation.service';
import { ConversationRepository } from '@mindpost/database';
import { NotFoundError } from '../lib/errors';

vi.mock('@mindpost/database', () => ({
  ConversationRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    list: vi.fn(),
    delete: vi.fn()
  }
}));

describe('ConversationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a new conversation with formatted messages', async () => {
    const mockCreated = {
      id: 'conv_123',
      userId: 'dev-user-001',
      title: 'Test Discussion',
      source: 'chatgpt' as const,
      messages: [
        {
          id: 'msg_1',
          role: 'user' as const,
          content: 'Hello AI',
          orderIndex: 0,
          timestamp: new Date().toISOString()
        }
      ],
      totalMessages: 1,
      metadata: {
        source: 'chatgpt' as const,
        capturedAt: new Date().toISOString(),
        characterCount: 8,
        wordCount: 2,
        userMessageCount: 1,
        assistantMessageCount: 0,
        contentFingerprint: 'conv_123'
      },
      capturedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    vi.mocked(ConversationRepository.create).mockResolvedValue(mockCreated);

    const result = await ConversationService.createConversation('dev-user-001', {
      title: 'Test Discussion',
      source: 'chatgpt',
      messages: [{ role: 'user', content: 'Hello AI' }]
    });

    expect(ConversationRepository.create).toHaveBeenCalledTimes(1);
    expect(result.id).toBe('conv_123');
    expect(result.title).toBe('Test Discussion');
  });

  it('retrieves conversation by ID or throws NotFoundError', async () => {
    vi.mocked(ConversationRepository.findById).mockResolvedValueOnce(null);

    await expect(
      ConversationService.getConversationById('non_existent', 'dev-user-001')
    ).rejects.toThrow(NotFoundError);

    const mockConv = {
      id: 'conv_123',
      userId: 'dev-user-001',
      title: 'Found',
      source: 'chatgpt' as const,
      messages: [],
      totalMessages: 0,
      metadata: {
        source: 'chatgpt' as const,
        capturedAt: new Date().toISOString(),
        characterCount: 0,
        wordCount: 0,
        userMessageCount: 0,
        assistantMessageCount: 0,
        contentFingerprint: 'conv_123'
      },
      capturedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    vi.mocked(ConversationRepository.findById).mockResolvedValueOnce(mockConv);

    const result = await ConversationService.getConversationById('conv_123', 'dev-user-001');
    expect(result.id).toBe('conv_123');
  });

  it('lists conversations with pagination', async () => {
    vi.mocked(ConversationRepository.list).mockResolvedValue({
      conversations: [],
      total: 0
    });

    const result = await ConversationService.listConversations('dev-user-001', {
      limit: 10,
      offset: 0
    });

    expect(result.limit).toBe(10);
    expect(result.offset).toBe(0);
    expect(result.total).toBe(0);
  });
});
