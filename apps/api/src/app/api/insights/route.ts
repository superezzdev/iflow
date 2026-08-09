import {
  CreateInsightSchema,
  ListInsightsQuerySchema
} from '@mindpost/shared';
import { apiSuccess, handleApiError, handleOptionsResponse } from '../../../lib/errors';
import { getCurrentUser } from '../../../lib/session';
import { InsightService } from '../../../services/insight.service';

export async function OPTIONS() {
  return handleOptionsResponse();
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req);
    const { searchParams } = new URL(req.url);
    const rawQuery = Object.fromEntries(searchParams.entries());
    const query = ListInsightsQuerySchema.parse(rawQuery);

    const result = await InsightService.listInsights(user.id, query);
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    const rawBody = await req.json();
    const validatedData = CreateInsightSchema.parse(rawBody);

    const insight = await InsightService.createInsight(user.id, validatedData);
    return apiSuccess(insight, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
