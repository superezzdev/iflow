import { apiSuccess, handleApiError, handleOptionsResponse } from '../../../../lib/errors';
import { getCurrentUser } from '../../../../lib/session';
import { ConversationService } from '../../../../services/conversation.service';

export async function OPTIONS() {
  return handleOptionsResponse();
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(req);

    const conversation = await ConversationService.getConversationById(id, user.id);
    return apiSuccess(conversation);
  } catch (error) {
    return handleApiError(error);
  }
}
