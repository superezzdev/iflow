import { prisma } from '../client';
import type { User as PrismaUser } from '@prisma/client';
import type { User } from '@mindpost/shared';

export const DEFAULT_DEV_USER = {
  id: 'dev-user-001',
  email: 'dev@mindpost.local',
  name: 'Development User'
} as const;

export class UserRepository {
  /**
   * Find or automatically initialize a development user record in local environment.
   */
  static async findOrCreateDevUser(userData?: Partial<User>): Promise<User> {
    const userId = userData?.id || DEFAULT_DEV_USER.id;
    const email = userData?.email || DEFAULT_DEV_USER.email;
    const name = userData?.name || DEFAULT_DEV_USER.name;

    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        name: name ?? undefined,
        email: email ?? undefined
      },
      create: {
        id: userId,
        email,
        name
      }
    });

    return UserRepository.toDomain(user);
  }

  /**
   * Find a user by their unique ID.
   */
  static async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id }
    });

    return user ? UserRepository.toDomain(user) : null;
  }

  /**
   * Find a user by email.
   */
  static async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    return user ? UserRepository.toDomain(user) : null;
  }

  /**
   * Create a new user record.
   */
  static async create(userData: { id?: string; email?: string; name?: string }): Promise<User> {
    const user = await prisma.user.create({
      data: {
        id: userData.id,
        email: userData.email,
        name: userData.name
      }
    });

    return UserRepository.toDomain(user);
  }

  /**
   * Transform Prisma User record to domain User entity.
   */
  private static toDomain(user: PrismaUser): User {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
  }
}
