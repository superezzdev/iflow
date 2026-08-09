import { NextResponse } from 'next/server';
import { AIProviderFactory } from '@mindpost/ai';
import { ConversationRepository, InsightRepository } from '@mindpost/database';
import type { ExtractInsightsRequest, ApiErrorResponse, ApiSuccessResponse, ExtractedInsight } from '@mindpost/shared';
import { getCurrentUser } from '../../../../lib/session';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    const body = (await req.json()) as ExtractInsightsRequest;

    if (!body.conversation || !body.conversation.messages || body.conversation.messages.length === 0) {
      const errorResp: ApiErrorResponse = {
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'A valid conversation with at least one message is required.'
        }
      };
      return NextResponse.json(errorResp, { status: 400 });
    }

    // Initialize configured AI Provider
    const provider = AIProviderFactory.fromEnv();

    // Extract insights using AI
    const insight = await provider.extractInsights(body.conversation, body.options);

    // Save conversation and insight if database is configured
    try {
      if (process.env.DATABASE_URL) {
        await ConversationRepository.create({
          userId: user.id,
          title: body.conversation.title,
          source: body.conversation.source,
          url: body.conversation.url,
          metadata: body.conversation.metadata,
          messages: body.conversation.messages
        });
        await InsightRepository.create({
          id: insight.id,
          conversationId: insight.conversationId,
          title: insight.title ?? undefined,
          coreIdea: insight.coreIdea,
          keyTakeaways: insight.keyTakeaways,
          practicalApplications: insight.practicalApplications,
          suggestedHooks: insight.suggestedHooks,
          tags: insight.tags,
          suggestedTone: insight.suggestedTone ?? undefined,
          metadata: insight.metadata ?? undefined
        });
      }
    } catch (dbErr) {
      console.warn('[MindPost API] Database persistence skipped or failed:', dbErr);
    }

    const response: ApiSuccessResponse<{ insight: ExtractedInsight }> = {
      success: true,
      data: { insight }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[MindPost API] Error extracting insights:', error);

    const errorResp: ApiErrorResponse = {
      success: false,
      error: {
        code: 'EXTRACTION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error during insight extraction'
      }
    };

    return NextResponse.json(errorResp, { status: 500 });
  }
}
