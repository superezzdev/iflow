import { NextResponse } from 'next/server';
import { AIProviderFactory } from '@mindpost/ai';
import { PostDraftRepository } from '@mindpost/database';
import {
  Platform,
  PostDraftStatus,
  type GeneratePostRequest,
  type ApiErrorResponse,
  type ApiSuccessResponse,
  type SocialPost,
  type ExtractedInsight
} from '@mindpost/shared';
import { getCurrentUser } from '../../../lib/session';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    const body = (await req.json()) as GeneratePostRequest;

    if (!body.conversation || !body.conversation.messages || body.conversation.messages.length === 0) {
      const errorResp: ApiErrorResponse = {
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Conversation transcript is required for post generation.'
        }
      };
      return NextResponse.json(errorResp, { status: 400 });
    }

    const provider = AIProviderFactory.fromEnv();

    // If insights were not pre-extracted, extract them first
    const insight: ExtractedInsight =
      body.insight ?? (await provider.extractInsights(body.conversation));

    // Generate targeted post
    const generatedDraft = await provider.generatePost(
      body.conversation,
      insight,
      body.options ?? { platform: 'linkedin', tone: 'thought_leadership' }
    );

    let savedPost: SocialPost;

    if (process.env.DATABASE_URL && insight.id) {
      try {
        const postDraft = await PostDraftRepository.create({
          userId: user.id,
          insightId: insight.id,
          platform: Platform.LINKEDIN,
          content: generatedDraft.formattedContent,
          status: PostDraftStatus.DRAFT
        });

        savedPost = {
          ...generatedDraft,
          id: postDraft.id,
          createdAt: postDraft.createdAt,
          updatedAt: postDraft.updatedAt
        };
      } catch (dbErr) {
        console.warn('[MindPost API] Database persistence fallback to in-memory response:', dbErr);
        savedPost = {
          ...generatedDraft,
          id: `post_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
    } else {
      savedPost = {
        ...generatedDraft,
        id: `post_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    const response: ApiSuccessResponse<{ post: SocialPost; insight: ExtractedInsight }> = {
      success: true,
      data: {
        post: savedPost,
        insight
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[MindPost API] Error generating post:', error);

    const errorResp: ApiErrorResponse = {
      success: false,
      error: {
        code: 'GENERATION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error during post generation'
      }
    };

    return NextResponse.json(errorResp, { status: 500 });
  }
}
