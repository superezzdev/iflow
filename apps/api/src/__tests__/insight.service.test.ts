import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InsightService } from '../services/insight.service';
import { ConversationRepository, InsightRepository } from '@mindpost/database';
import { NotFoundError } from '../lib/errors';

vi.mock('@mindpost/database', () => ({
  ConversationRepository: {
    findById: vi.fn()
  },
  InsightRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    list: vi.fn()
  }
}));

describe('InsightService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws NotFoundError if parent conversation does not exist', async () => {
    vi.mocked(ConversationRepository.findById).mockResolvedValue(null);

    await expect(
      InsightService.createInsight('dev-user-001', {
        conversationId: 'missing_conv',
        coreIdea: 'Great ideas',
        tags: []
      })
    ).rejects.toThrow(NotFoundError);
  });

  it('creates an insight when conversation exists', async () => {
    vi.mocked(ConversationRepository.findById).mockResolvedValue({
      id: 'conv_123',
      userId: 'dev-user-001',
      title: 'Active Chat',
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
    });

    const mockInsight = {
      id: 'ins_123',
      conversationId: 'conv_123',
      title: 'Key Insights',
      coreIdea: 'Core takeaways from session',
      tags: ['ai', 'tech'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    vi.mocked(InsightRepository.create).mockResolvedValue(mockInsight);

    const result = await InsightService.createInsight('dev-user-001', {
      conversationId: 'conv_123',
      title: 'Key Insights',
      coreIdea: 'Core takeaways from session',
      tags: ['ai', 'tech']
    });

    expect(result.id).toBe('ins_123');
    expect(result.coreIdea).toBe('Core takeaways from session');
  });

  it('lists insights with pagination', async () => {
    vi.mocked(InsightRepository.list).mockResolvedValue({
      insights: [],
      total: 0
    });

    const result = await InsightService.listInsights('dev-user-001', {
      limit: 20,
      offset: 0
    });

    expect(result.insights).toEqual([]);
    expect(result.total).toBe(0);
  });
});
