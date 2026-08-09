import { NextResponse } from 'next/server';
import { AIProviderFactory } from '@mindpost/ai';
import { ConversationRepository } from '@mindpost/database';
import type { ExtractInsightsRequest, ApiErrorResponse, ApiSuccessResponse, ExtractedInsight } from '@mindpost/shared';

export async function POST(req: Request) {
  try {
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
        await ConversationRepository.create(body.conversation);
        await ConversationRepository.saveInsight(insight);
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
