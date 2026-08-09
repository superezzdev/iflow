import { UpdatePostDraftSchema } from '@mindpost/shared';
import { apiSuccess, handleApiError, handleOptionsResponse } from '../../../../lib/errors';
import { getCurrentUser } from '../../../../lib/session';
import { PostService } from '../../../../services/post.service';

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

    const post = await PostService.getPostDraftById(id, user.id);
    return apiSuccess(post);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(req);
    const rawBody = await req.json();
    const validatedData = UpdatePostDraftSchema.parse(rawBody);

    const updatedPost = await PostService.updatePostDraft(id, user.id, validatedData);
    return apiSuccess(updatedPost);
  } catch (error) {
    return handleApiError(error);
  }
}
