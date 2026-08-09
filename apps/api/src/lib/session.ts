import { UserRepository, DEFAULT_DEV_USER } from '@mindpost/database';
import type { User } from '@mindpost/shared';

/**
 * Resolves the authenticated user for the current request.
 * Phase 1 development session abstraction:
 * - Checks the optional `x-user-id` header (for testing/multi-user simulation)
 * - Defaults to `dev-user-001`
 * - Automatically ensures user record exists in PostgreSQL via UserRepository.findOrCreateDevUser
 */
export async function getCurrentUser(req?: Request): Promise<User> {
  const customUserId = req?.headers.get('x-user-id');
  const userId = customUserId || process.env.DEV_USER_ID || DEFAULT_DEV_USER.id;

  try {
    const user = await UserRepository.findOrCreateDevUser({
      id: userId,
      email: `${userId}@mindpost.local`,
      name: `Development User (${userId})`
    });
    return user;
  } catch (err) {
    console.warn('[Session] Database user upsert failed or DB unavailable, fallback to in-memory user:', err);
    return {
      id: userId,
      email: `${userId}@mindpost.local`,
      name: `Development User (${userId})`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}
