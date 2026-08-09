import { prisma } from '../client';
import type { Prisma, PostDraft as PrismaPostDraft } from '@prisma/client';
import { Platform, PostDraftStatus, type PostDraft } from '@mindpost/shared';

export interface CreatePostDraftInput {
  id?: string;
  userId: string;
  insightId: string;
  platform?: Platform;
  content: string;
  status?: PostDraftStatus;
}

export interface UpdatePostDraftInput {
  content?: string;
  status?: PostDraftStatus;
  platform?: Platform;
}

export interface ListPostDraftsInput {
  userId?: string;
  insightId?: string;
  platform?: Platform;
  status?: PostDraftStatus;
  limit?: number;
  offset?: number;
}

export class PostDraftRepository {
  /**
   * Save a newly created post draft.
   */
  static async create(data: CreatePostDraftInput): Promise<PostDraft> {
    const post = await prisma.postDraft.create({
      data: {
        id: data.id,
        userId: data.userId,
        insightId: data.insightId,
        platform: data.platform ?? Platform.LINKEDIN,
        content: data.content,
        status: data.status ?? PostDraftStatus.DRAFT
      }
    });

    return PostDraftRepository.toDomain(post);
  }

  /**
   * Get a post draft by ID.
   */
  static async findById(id: string, userId?: string): Promise<PostDraft | null> {
    const post = await prisma.postDraft.findFirst({
      where: {
        id,
        ...(userId ? { userId } : {})
      }
    });

    return post ? PostDraftRepository.toDomain(post) : null;
  }

  /**
   * List post drafts with optional filters and pagination.
   */
  static async list(params: ListPostDraftsInput): Promise<{ posts: PostDraft[]; total: number }> {
    const where: Prisma.PostDraftWhereInput = {
      ...(params.userId ? { userId: params.userId } : {}),
      ...(params.insightId ? { insightId: params.insightId } : {}),
      ...(params.platform ? { platform: params.platform } : {}),
      ...(params.status ? { status: params.status } : {})
    };

    const [total, records] = await prisma.$transaction([
      prisma.postDraft.count({ where }),
      prisma.postDraft.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: params.limit ?? 20,
        skip: params.offset ?? 0
      })
    ]);

    return {
      posts: records.map(PostDraftRepository.toDomain),
      total
    };
  }

  /**
   * Update post draft content, status, or platform.
   */
  static async update(
    id: string,
    data: UpdatePostDraftInput,
    userId?: string
  ): Promise<PostDraft> {
    if (userId) {
      const existing = await prisma.postDraft.findFirst({
        where: { id, userId }
      });
      if (!existing) {
        throw new Error(`Post draft with ID "${id}" not found for user "${userId}"`);
      }
    }

    const post = await prisma.postDraft.update({
      where: {
        id
      },
      data: {
        ...(data.content !== undefined ? { content: data.content } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.platform !== undefined ? { platform: data.platform } : {})
      }
    });

    return PostDraftRepository.toDomain(post);
  }

  /**
   * Delete post draft.
   */
  static async delete(id: string, userId?: string): Promise<boolean> {
    const res = await prisma.postDraft.deleteMany({
      where: {
        id,
        ...(userId ? { userId } : {})
      }
    });

    return res.count > 0;
  }

  /**
   * Transform Prisma PostDraft record to domain PostDraft entity.
   */
  public static toDomain(post: PrismaPostDraft): PostDraft {
    return {
      id: post.id,
      userId: post.userId,
      insightId: post.insightId,
      platform: post.platform as Platform,
      content: post.content,
      status: post.status as PostDraftStatus,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    };
  }
}
