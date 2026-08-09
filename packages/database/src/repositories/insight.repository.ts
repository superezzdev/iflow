import { prisma, Prisma } from '../client';
import type { Insight as PrismaInsight } from '@prisma/client';
import type { Insight, KeyTakeaway } from '@mindpost/shared';

export interface CreateInsightInput {
  id?: string;
  conversationId: string;
  title?: string;
  coreIdea: string;
  keyTakeaways?: unknown;
  practicalApplications?: unknown;
  suggestedHooks?: unknown;
  tags?: string[];
  suggestedTone?: string;
  metadata?: Record<string, unknown> | null;
}

export interface ListInsightsInput {
  conversationId?: string;
  limit?: number;
  offset?: number;
}

export class InsightRepository {
  /**
   * Save a newly extracted or created insight linked to a conversation.
   */
  static async create(data: CreateInsightInput): Promise<Insight> {
    const record = await prisma.insight.create({
      data: {
        id: data.id,
        conversationId: data.conversationId,
        title: data.title,
        coreIdea: data.coreIdea,
        keyTakeaways: (data.keyTakeaways as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        practicalApplications: (data.practicalApplications as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        suggestedHooks: (data.suggestedHooks as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        tags: data.tags ?? [],
        suggestedTone: data.suggestedTone,
        metadata: (data.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull
      }
    });

    return InsightRepository.toDomain(record);
  }

  /**
   * Find an insight by ID.
   */
  static async findById(id: string): Promise<Insight | null> {
    const record = await prisma.insight.findUnique({
      where: { id }
    });

    return record ? InsightRepository.toDomain(record) : null;
  }

  /**
   * List insights with pagination and optional conversation filter.
   */
  static async list(params: ListInsightsInput): Promise<{ insights: Insight[]; total: number }> {
    const where: Prisma.InsightWhereInput = {
      ...(params.conversationId ? { conversationId: params.conversationId } : {})
    };

    const [total, records] = await prisma.$transaction([
      prisma.insight.count({ where }),
      prisma.insight.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: params.limit ?? 20,
        skip: params.offset ?? 0
      })
    ]);

    return {
      insights: records.map(InsightRepository.toDomain),
      total
    };
  }

  /**
   * Delete an insight by ID.
   */
  static async delete(id: string): Promise<boolean> {
    const record = await prisma.insight.delete({
      where: { id }
    });

    return Boolean(record);
  }

  /**
   * Transform Prisma Insight record to domain Insight entity.
   */
  public static toDomain(record: PrismaInsight): Insight {
    return {
      id: record.id,
      conversationId: record.conversationId,
      title: record.title,
      coreIdea: record.coreIdea,
      keyTakeaways: (record.keyTakeaways as KeyTakeaway[] | null) ?? undefined,
      practicalApplications: (record.practicalApplications as string[] | null) ?? undefined,
      suggestedHooks: (record.suggestedHooks as string[] | null) ?? undefined,
      tags: record.tags,
      suggestedTone: record.suggestedTone,
      metadata: (record.metadata as Record<string, unknown> | null) ?? undefined,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    };
  }
}
