import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostService } from '../services/post.service';
import { InsightRepository, PostDraftRepository } from '@mindpost/database';
import { NotFoundError } from '../lib/errors';
import { Platform, PostDraftStatus } from '@mindpost/shared';

vi.mock('@mindpost/database', () => ({
  InsightRepository: {
    findById: vi.fn()
  },
  PostDraftRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}));

describe('PostService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws NotFoundError if parent insight does not exist', async () => {
    vi.mocked(InsightRepository.findById).mockResolvedValue(null);

    await expect(
      PostService.createPostDraft('dev-user-001', {
        insightId: 'missing_ins',
        platform: Platform.LINKEDIN,
        content: 'Post draft content',
        status: PostDraftStatus.DRAFT
      })
    ).rejects.toThrow(NotFoundError);
  });

  it('creates a post draft when insight exists', async () => {
    vi.mocked(InsightRepository.findById).mockResolvedValue({
      id: 'ins_123',
      conversationId: 'conv_123',
      title: 'Valid Insight',
      coreIdea: 'Idea',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const mockPost = {
      id: 'post_123',
      userId: 'dev-user-001',
      insightId: 'ins_123',
      platform: Platform.LINKEDIN,
      content: 'Here is what I learned about TypeScript today...',
      status: PostDraftStatus.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    vi.mocked(PostDraftRepository.create).mockResolvedValue(mockPost);

    const result = await PostService.createPostDraft('dev-user-001', {
      insightId: 'ins_123',
      platform: Platform.LINKEDIN,
      content: 'Here is what I learned about TypeScript today...',
      status: PostDraftStatus.DRAFT
    });

    expect(result.id).toBe('post_123');
    expect(result.platform).toBe(Platform.LINKEDIN);
    expect(result.status).toBe(PostDraftStatus.DRAFT);
  });

  it('updates post draft status and content', async () => {
    const existingPost = {
      id: 'post_123',
      userId: 'dev-user-001',
      insightId: 'ins_123',
      platform: Platform.LINKEDIN,
      content: 'Draft content',
      status: PostDraftStatus.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    vi.mocked(PostDraftRepository.findById).mockResolvedValue(existingPost);
    vi.mocked(PostDraftRepository.update).mockResolvedValue({
      ...existingPost,
      content: 'Approved and polished content',
      status: PostDraftStatus.APPROVED
    });

    const updated = await PostService.updatePostDraft('post_123', 'dev-user-001', {
      content: 'Approved and polished content',
      status: PostDraftStatus.APPROVED
    });

    expect(updated.status).toBe(PostDraftStatus.APPROVED);
    expect(updated.content).toBe('Approved and polished content');
  });
});
