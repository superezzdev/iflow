import { InsightRepository, PostDraftRepository } from '@mindpost/database';
import type { PostDraft } from '@mindpost/shared';
import { NotFoundError } from '../lib/errors';
import type { z } from 'zod';
import type {
  CreatePostDraftSchema,
  ListPostDraftsQuerySchema,
  UpdatePostDraftSchema
} from '@mindpost/shared';

export class PostService {
  /**
   * Create a new post draft linked to an existing insight.
   */
  static async createPostDraft(
    userId: string,
    input: z.infer<typeof CreatePostDraftSchema>
  ): Promise<PostDraft> {
    const insight = await InsightRepository.findById(input.insightId);
    if (!insight) {
      throw new NotFoundError(
        `Cannot create post: Insight with ID "${input.insightId}" was not found.`
      );
    }

    return PostDraftRepository.create({
      userId,
      insightId: input.insightId,
      platform: input.platform,
      content: input.content,
      status: input.status
    });
  }

  /**
   * Get a post draft by ID.
   */
  static async getPostDraftById(id: string, userId?: string): Promise<PostDraft> {
    const post = await PostDraftRepository.findById(id, userId);
    if (!post) {
      throw new NotFoundError(`Post draft with ID "${id}" was not found.`);
    }
    return post;
  }

  /**
   * List post drafts for a user with optional filters (insightId, status, platform).
   */
  static async listPostDrafts(
    userId: string,
    query: z.infer<typeof ListPostDraftsQuerySchema>
  ): Promise<{ posts: PostDraft[]; total: number; limit: number; offset: number }> {
    const result = await PostDraftRepository.list({
      userId,
      insightId: query.insightId,
      platform: query.platform,
      status: query.status,
      limit: query.limit,
      offset: query.offset
    });

    return {
      posts: result.posts,
      total: result.total,
      limit: query.limit,
      offset: query.offset
    };
  }

  /**
   * Update a post draft (content, status, platform).
   */
  static async updatePostDraft(
    id: string,
    userId: string,
    input: z.infer<typeof UpdatePostDraftSchema>
  ): Promise<PostDraft> {
    const existing = await PostDraftRepository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError(`Post draft with ID "${id}" was not found.`);
    }

    return PostDraftRepository.update(id, input, userId);
  }
}
