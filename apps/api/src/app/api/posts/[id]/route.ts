import { NextResponse } from 'next/server';
import { PostRepository } from '@mindpost/database';
import type {
  UpdatePostPayload,
  ApiSuccessResponse,
  ApiErrorResponse,
  SocialPost
} from '@mindpost/shared';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_DATABASE', message: 'Database not connected' } },
        { status: 503 }
      );
    }

    const post = await PostRepository.findById(id);
    if (!post) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: `Post with ID "${id}" not found` } },
        { status: 404 }
      );
    }

    const response: ApiSuccessResponse<{ post: SocialPost }> = {
      success: true,
      data: { post }
    };
    return NextResponse.json(response);
  } catch (error) {
    const errorResp: ApiErrorResponse = {
      success: false,
      error: {
        code: 'GET_POST_FAILED',
        message: error instanceof Error ? error.message : 'Failed to retrieve post'
      }
    };
    return NextResponse.json(errorResp, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as UpdatePostPayload;

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_DATABASE', message: 'Database not connected' } },
        { status: 503 }
      );
    }

    const updatedPost = await PostRepository.update(id, body);

    const response: ApiSuccessResponse<{ post: SocialPost }> = {
      success: true,
      data: { post: updatedPost }
    };
    return NextResponse.json(response);
  } catch (error) {
    const errorResp: ApiErrorResponse = {
      success: false,
      error: {
        code: 'UPDATE_POST_FAILED',
        message: error instanceof Error ? error.message : 'Failed to update post'
      }
    };
    return NextResponse.json(errorResp, { status: 500 });
  }
}
