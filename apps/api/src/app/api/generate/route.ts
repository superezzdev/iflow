import { NextResponse } from 'next/server';
import { AIProviderFactory } from '@mindpost/ai';
import { PostRepository } from '@mindpost/database';
import type {
  GeneratePostRequest,
  ApiErrorResponse,
  ApiSuccessResponse,
  SocialPost,
  ExtractedInsight
} from '@mindpost/shared';

export async function POST(req: Request) {
  try {
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

    if (process.env.DATABASE_URL) {
      try {
        savedPost = await PostRepository.create({
          conversationId: body.conversation.id,
          insightId: insight.id,
          platform: generatedDraft.platform,
          hook: generatedDraft.hook,
          body: generatedDraft.body,
          callToAction: generatedDraft.callToAction,
          hashtags: generatedDraft.hashtags,
          formattedContent: generatedDraft.formattedContent,
          status: 'draft',
          metadata: generatedDraft.metadata
        });
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
