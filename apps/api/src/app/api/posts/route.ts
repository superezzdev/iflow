import { NextResponse } from 'next/server';
import { PostRepository } from '@mindpost/database';
import type {
  SavePostRequest,
  ApiSuccessResponse,
  ApiErrorResponse,
  SocialPost,
  TargetPlatform,
  PostStatus
} from '@mindpost/shared';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform') as TargetPlatform | undefined;
    const status = searchParams.get('status') as PostStatus | undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

    let posts: SocialPost[] = [];

    if (process.env.DATABASE_URL) {
      try {
        posts = await PostRepository.list({ platform, status, limit, offset });
      } catch (dbErr) {
        console.warn('[MindPost API] Failed to query database for posts list:', dbErr);
      }
    }

    const response: ApiSuccessResponse<{ posts: SocialPost[]; count: number }> = {
      success: true,
      data: {
        posts,
        count: posts.length
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResp: ApiErrorResponse = {
      success: false,
      error: {
        code: 'LIST_POSTS_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error listing posts'
      }
    };
    return NextResponse.json(errorResp, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SavePostRequest;

    if (!body.formattedContent || !body.hook || !body.body) {
      const errorResp: ApiErrorResponse = {
        success: false,
        error: {
          code: 'INVALID_POST_DATA',
          message: 'Hook, body, and formattedContent are required to save a post.'
        }
      };
      return NextResponse.json(errorResp, { status: 400 });
    }

    let savedPost: SocialPost;

    if (process.env.DATABASE_URL) {
      savedPost = await PostRepository.create({
        conversationId: body.conversationId ?? `conv_${Date.now()}`,
        insightId: body.insightId,
        platform: body.platform ?? 'linkedin',
        hook: body.hook,
        body: body.body,
        callToAction: body.callToAction,
        hashtags: body.hashtags ?? [],
        formattedContent: body.formattedContent,
        status: body.status ?? 'approved',
        metadata: body.metadata
      });
    } else {
      savedPost = {
        id: `post_${Date.now()}`,
        conversationId: body.conversationId ?? `conv_${Date.now()}`,
        insightId: body.insightId,
        platform: body.platform ?? 'linkedin',
        hook: body.hook,
        body: body.body,
        callToAction: body.callToAction,
        hashtags: body.hashtags ?? [],
        formattedContent: body.formattedContent,
        status: body.status ?? 'approved',
        characterCount: body.formattedContent.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        approvedAt: body.status === 'approved' ? new Date().toISOString() : undefined,
        metadata: body.metadata
      };
    }

    const response: ApiSuccessResponse<{ post: SocialPost }> = {
      success: true,
      data: { post: savedPost }
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResp: ApiErrorResponse = {
      success: false,
      error: {
        code: 'SAVE_POST_FAILED',
        message: error instanceof Error ? error.message : 'Failed to save post'
      }
    };
    return NextResponse.json(errorResp, { status: 500 });
  }
}
