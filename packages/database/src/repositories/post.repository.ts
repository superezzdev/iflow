import { prisma } from '../client';
import type { Prisma } from '@prisma/client';
import type { SocialPost, TargetPlatform, PostStatus } from '@mindpost/shared';

export interface CreatePostDto {
  conversationId: string;
  insightId?: string;
  platform: TargetPlatform;
  hook: string;
  body: string;
  callToAction?: string;
  hashtags: string[];
  formattedContent: string;
  status?: PostStatus;
  metadata?: Record<string, unknown>;
}

export class PostRepository {
  /**
   * Save a newly generated post.
   */
  static async create(data: CreatePostDto): Promise<SocialPost> {
    const post = await prisma.socialPost.create({
      data: {
        conversationId: data.conversationId,
        insightId: data.insightId,
        platform: data.platform,
        hook: data.hook,
        body: data.body,
        callToAction: data.callToAction,
        hashtags: data.hashtags,
        formattedContent: data.formattedContent,
        status: data.status ?? 'draft',
        characterCount: data.formattedContent.length,
        metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : undefined
      }
    });

    return PostRepository.toDomain(post);
  }

  /**
   * Get post by ID.
   */
  static async findById(id: string): Promise<SocialPost | null> {
    const post = await prisma.socialPost.findUnique({
      where: { id }
    });

    return post ? PostRepository.toDomain(post) : null;
  }

  /**
   * List posts with optional status and platform filters.
   */
  static async list(params?: {
    platform?: TargetPlatform;
    status?: PostStatus;
    limit?: number;
    offset?: number;
  }): Promise<SocialPost[]> {
    const posts = await prisma.socialPost.findMany({
      where: {
        ...(params?.platform ? { platform: params.platform } : {}),
        ...(params?.status ? { status: params.status } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: params?.limit ?? 50,
      skip: params?.offset ?? 0
    });

    return posts.map(PostRepository.toDomain);
  }

  /**
   * Update post content or status (e.g. approve post).
   */
  static async update(
    id: string,
    data: {
      hook?: string;
      body?: string;
      callToAction?: string;
      hashtags?: string[];
      formattedContent?: string;
      status?: PostStatus;
    }
  ): Promise<SocialPost> {
    const isApproved = data.status === 'approved';

    const post = await prisma.socialPost.update({
      where: { id },
      data: {
        ...(data.hook !== undefined ? { hook: data.hook } : {}),
        ...(data.body !== undefined ? { body: data.body } : {}),
        ...(data.callToAction !== undefined ? { callToAction: data.callToAction } : {}),
        ...(data.hashtags !== undefined ? { hashtags: data.hashtags } : {}),
        ...(data.formattedContent !== undefined
          ? {
              formattedContent: data.formattedContent,
              characterCount: data.formattedContent.length
            }
          : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(isApproved ? { approvedAt: new Date() } : {})
      }
    });

    return PostRepository.toDomain(post);
  }

  /**
   * Transform Prisma record to domain SocialPost entity.
   */
  private static toDomain(post: {
    id: string;
    conversationId: string;
    insightId: string | null;
    platform: string;
    hook: string;
    body: string;
    callToAction: string | null;
    hashtags: string[];
    formattedContent: string;
    status: string;
    characterCount: number;
    metadata: Prisma.JsonValue | null;
    approvedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): SocialPost {
    return {
      id: post.id,
      conversationId: post.conversationId,
      insightId: post.insightId ?? undefined,
      platform: post.platform as TargetPlatform,
      hook: post.hook,
      body: post.body,
      callToAction: post.callToAction ?? undefined,
      hashtags: post.hashtags,
      formattedContent: post.formattedContent,
      status: post.status as PostStatus,
      characterCount: post.characterCount,
      metadata: (post.metadata as Record<string, unknown>) ?? undefined,
      approvedAt: post.approvedAt ? post.approvedAt.toISOString() : undefined,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    };
  }
}
