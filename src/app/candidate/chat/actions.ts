"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listConversationsSchema,
  getConversationMessagesSchema,
  type ListConversationsParams,
  type GetConversationMessagesParams,
  type ListConversationsResult,
  type GetConversationMessagesResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// listConversations
// ---------------------------------------------------------------------------

/**
 * List chat conversations accessible to the current candidate.
 * Supports pagination and optional filters (companyId, storeId, staffId).
 *
 * Maps to the legacy ChatController::actionList().
 */
export async function listConversations(
  params: FormData | ListConversationsParams = {},
): Promise<ListConversationsResult> {
  await requireCapability("candidate.read.own");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
          companyId: params.get("companyId"),
          storeId: params.get("storeId"),
          staffId: params.get("staffId"),
        }
      : params;

  const parsed = listConversationsSchema.safeParse(raw);
  if (!parsed.success) {
    return { conversations: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, companyId, storeId, staffId } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (companyId !== undefined) where.company_id = companyId;
  if (storeId !== undefined) where.store_id = storeId;
  if (staffId !== undefined) where.staff_id = staffId;

  const [chats, total] = await Promise.all([
    prisma.chat.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.chat.count({ where: where as any }),
  ]);

  return {
    conversations: chats as any[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// getConversationMessages
// ---------------------------------------------------------------------------

/**
 * Get messages for a specific chat conversation, with cursor-based pagination.
 *
 * Maps to the legacy ChatController::actionMessages().
 */
export async function getConversationMessages(
  params: FormData | GetConversationMessagesParams,
): Promise<GetConversationMessagesResult> {
  await requireCapability("candidate.read.own");

  const raw =
    params instanceof FormData
      ? {
          chatUuid: params.get("chatUuid"),
          lastIndex: params.get("lastIndex"),
          limit: params.get("limit"),
        }
      : params;

  const parsed = getConversationMessagesSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid parameters");
  }

  const { chatUuid, lastIndex, limit } = parsed.data;

  const where: Record<string, unknown> = { chat_uuid: chatUuid };
  if (lastIndex !== undefined) {
    where.message_index = { lt: lastIndex };
  }

  const [messages, total] = await Promise.all([
    prisma.chat_message.findMany({
      where: where as any,
      orderBy: { message_index: "desc" },
      take: limit,
    }),
    prisma.chat_message.count({ where: where as any }),
  ]);

  return {
    messages: messages as any[],
    total,
    page: 1,
    limit,
    totalPages: 1,
  };
}
