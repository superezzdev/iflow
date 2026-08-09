import { PostDraftRepository } from './post-draft.repository';
import type { Platform, PostDraft, PostDraftStatus } from '@mindpost/shared';

export { PostDraftRepository } from './post-draft.repository';
export * from './post-draft.repository';

export interface CreatePostDto {
  userId?: string;
  insightId: string;
  platform?: Platform;
  content: string;
  status?: PostDraftStatus;
}

export class PostRepository {
  static async create(data: CreatePostDto): Promise<PostDraft> {
    return PostDraftRepository.create({
      userId: data.userId ?? 'dev-user-001',
      insightId: data.insightId,
      platform: data.platform,
      content: data.content,
      status: data.status
    });
  }

  static async findById(id: string, userId?: string): Promise<PostDraft | null> {
    return PostDraftRepository.findById(id, userId);
  }

  static async list(params?: {
    userId?: string;
    insightId?: string;
    platform?: Platform;
    status?: PostDraftStatus;
    limit?: number;
    offset?: number;
  }): Promise<PostDraft[]> {
    const result = await PostDraftRepository.list(params ?? {});
    return result.posts;
  }

  static async update(
    id: string,
    data: {
      content?: string;
      status?: PostDraftStatus;
      platform?: Platform;
    },
    userId?: string
  ): Promise<PostDraft> {
    return PostDraftRepository.update(id, data, userId);
  }

  static async delete(id: string, userId?: string): Promise<boolean> {
    return PostDraftRepository.delete(id, userId);
  }
}
