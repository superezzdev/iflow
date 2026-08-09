import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as createConversation, GET as listConversations } from '../app/api/conversations/route';
import { GET as getConversation } from '../app/api/conversations/[id]/route';
import { POST as createInsight, GET as listInsights } from '../app/api/insights/route';
import { POST as createPost, GET as listPosts } from '../app/api/posts/route';
import { GET as getPost, PATCH as updatePost } from '../app/api/posts/[id]/route';
import { ConversationService } from '../services/conversation.service';
import { InsightService } from '../services/insight.service';
import { PostService } from '../services/post.service';
import { NotFoundError } from '../lib/errors';
import { Platform, PostDraftStatus } from '@mindpost/shared';

vi.mock('../lib/session', () => ({
  getCurrentUser: vi.fn().mockResolvedValue({
    id: 'dev-user-001',
    email: 'dev@mindpost.local',
    name: 'Development User'
  })
}));

vi.mock('../services/conversation.service');
vi.mock('../services/insight.service');
vi.mock('../services/post.service');

describe('API Route Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Conversations API', () => {
    it('POST /api/conversations returns 201 with created conversation', async () => {
      const mockResult = {
        id: 'conv_123',
        userId: 'dev-user-001',
        title: 'AI Dev Chat',
        source: 'chatgpt',
        messages: [{ id: 'm1', role: 'user', content: 'Help me debug' }],
        totalMessages: 1,
        metadata: { capturedAt: new Date().toISOString() },
        capturedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      vi.mocked(ConversationService.createConversation).mockResolvedValue(mockResult as any);

      const req = new Request('http://localhost:3001/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'AI Dev Chat',
          source: 'chatgpt',
          messages: [{ role: 'user', content: 'Help me debug' }]
        })
      });

      const res = await createConversation(req);
      const json = (await res.json()) as any;

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.id).toBe('conv_123');
    });

    it('POST /api/conversations returns 400 for invalid body', async () => {
      const req = new Request('http://localhost:3001/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Empty conversation',
          messages: [] // empty messages should fail validation
        })
      });

      const res = await createConversation(req);
      const json = (await res.json()) as any;

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('GET /api/conversations returns 200 with list', async () => {
      vi.mocked(ConversationService.listConversations).mockResolvedValue({
        conversations: [],
        total: 0,
        limit: 20,
        offset: 0
      });

      const req = new Request('http://localhost:3001/api/conversations?limit=10&offset=0');
      const res = await listConversations(req);
      const json = (await res.json()) as any;

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.total).toBe(0);
    });

    it('GET /api/conversations/:id returns 404 when not found', async () => {
      vi.mocked(ConversationService.getConversationById).mockRejectedValue(
        new NotFoundError('Conversation not found')
      );

      const req = new Request('http://localhost:3001/api/conversations/conv_not_found');
      const res = await getConversation(req, {
        params: Promise.resolve({ id: 'conv_not_found' })
      });
      const json = (await res.json()) as any;

      expect(res.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('NOT_FOUND');
    });
  });

  describe('Insights API', () => {
    it('POST /api/insights returns 201 with created insight', async () => {
      const mockInsight = {
        id: 'ins_123',
        conversationId: 'conv_123',
        title: 'Core Insight',
        coreIdea: 'Essential learnings from coding task',
        tags: ['typescript', 'backend'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      vi.mocked(InsightService.createInsight).mockResolvedValue(mockInsight);

      const req = new Request('http://localhost:3001/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: 'conv_123',
          title: 'Core Insight',
          coreIdea: 'Essential learnings from coding task',
          tags: ['typescript', 'backend']
        })
      });

      const res = await createInsight(req);
      const json = (await res.json()) as any;

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.id).toBe('ins_123');
    });

    it('GET /api/insights returns 200 with list', async () => {
      vi.mocked(InsightService.listInsights).mockResolvedValue({
        insights: [],
        total: 0,
        limit: 20,
        offset: 0
      });

      const req = new Request('http://localhost:3001/api/insights?conversationId=conv_123');
      const res = await listInsights(req);
      const json = (await res.json()) as any;

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
    });
  });

  describe('Posts API', () => {
    it('POST /api/posts returns 201 with created PostDraft', async () => {
      const mockPost = {
        id: 'post_123',
        userId: 'dev-user-001',
        insightId: 'ins_123',
        platform: Platform.LINKEDIN,
        content: 'Excited to share insights on TypeScript architecture!',
        status: PostDraftStatus.DRAFT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      vi.mocked(PostService.createPostDraft).mockResolvedValue(mockPost);

      const req = new Request('http://localhost:3001/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insightId: 'ins_123',
          platform: 'LINKEDIN',
          content: 'Excited to share insights on TypeScript architecture!',
          status: 'DRAFT'
        })
      });

      const res = await createPost(req);
      const json = (await res.json()) as any;

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.id).toBe('post_123');
      expect(json.data.status).toBe('DRAFT');
    });

    it('GET /api/posts returns 200 with filtered list', async () => {
      vi.mocked(PostService.listPostDrafts).mockResolvedValue({
        posts: [],
        total: 0,
        limit: 20,
        offset: 0
      });

      const req = new Request('http://localhost:3001/api/posts?status=DRAFT&platform=LINKEDIN');
      const res = await listPosts(req);
      const json = (await res.json()) as any;

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
    });

    it('GET /api/posts/:id returns 200 with single post', async () => {
      const mockPost = {
        id: 'post_123',
        userId: 'dev-user-001',
        insightId: 'ins_123',
        platform: Platform.LINKEDIN,
        content: 'Excited to share insights!',
        status: PostDraftStatus.DRAFT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      vi.mocked(PostService.getPostDraftById).mockResolvedValue(mockPost);

      const req = new Request('http://localhost:3001/api/posts/post_123');
      const res = await getPost(req, {
        params: Promise.resolve({ id: 'post_123' })
      });
      const json = (await res.json()) as any;

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.id).toBe('post_123');
    });

    it('PATCH /api/posts/:id updates post status to APPROVED', async () => {
      const mockUpdated = {
        id: 'post_123',
        userId: 'dev-user-001',
        insightId: 'ins_123',
        platform: Platform.LINKEDIN,
        content: 'Refined post content',
        status: PostDraftStatus.APPROVED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      vi.mocked(PostService.updatePostDraft).mockResolvedValue(mockUpdated);

      const req = new Request('http://localhost:3001/api/posts/post_123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'APPROVED',
          content: 'Refined post content'
        })
      });

      const res = await updatePost(req, {
        params: Promise.resolve({ id: 'post_123' })
      });
      const json = (await res.json()) as any;

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.status).toBe('APPROVED');
    });
  });
});
