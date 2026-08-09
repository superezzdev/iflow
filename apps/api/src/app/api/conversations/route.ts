import {
  CreateConversationSchema,
  ListConversationsQuerySchema
} from '@mindpost/shared';
import { apiSuccess, handleApiError, handleOptionsResponse } from '../../../lib/errors';
import { getCurrentUser } from '../../../lib/session';
import { ConversationService } from '../../../services/conversation.service';

export async function OPTIONS() {
  return handleOptionsResponse();
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req);
    const { searchParams } = new URL(req.url);
    const rawQuery = Object.fromEntries(searchParams.entries());
    const query = ListConversationsQuerySchema.parse(rawQuery);

    const result = await ConversationService.listConversations(user.id, query);
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    const rawBody = await req.json();
    const validatedData = CreateConversationSchema.parse(rawBody);

    const conversation = await ConversationService.createConversation(user.id, validatedData);
    return apiSuccess(conversation, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
