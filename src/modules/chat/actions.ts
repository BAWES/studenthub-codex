"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listChatsSchema,
  getChatMessagesSchema,
  listChatsResultSchema,
  listChatMessagesResultSchema,
} from "./schemas";

import type {
  ListChatsParams,
  GetChatMessagesParams,
  ChatListItem,
  ChatMessageItem,
  ListChatsResult,
  ListChatMessagesResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Types (re-exported from schemas)
// ---------------------------------------------------------------------------

export type {
  ListChatsParams,
  GetChatMessagesParams,
  ChatListItem,
  ChatMessageItem,
  ListChatsResult,
  ListChatMessagesResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List chats for the current candidate, with optional filters.
 * Mirrors the legacy Yii2 ChatController::actionList().
 */
export async function listChats(
  params: ListChatsParams = {},
): Promise<ListChatsResult> {
  await requireCapability("candidate.read.own");

  const parsed = listChatsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { page = 1, limit = 20, companyId, storeId, staffId } = parsed.data;

  const where: Record<string, unknown> = {};
  if (companyId !== undefined) where.company_id = companyId;
  if (storeId !== undefined) where.store_id = storeId;
  if (staffId !== undefined) where.staff_id = staffId;

  const [chats, total] = await Promise.all([
    prisma.chat.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.chat.count({ where: where as any }),
  ]);

  const result = {
    chats: chats as ChatListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listChatsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    throw new Error(
      `Output validation failed for listChats: ${outputParsed.error.issues[0]?.message ?? "Unknown error"}`,
    );
  }

  return result;
}

/**
 * Get messages for a specific chat, with optional pagination by lastIndex.
 * Mirrors the legacy Yii2 ChatController::actionMessages().
 */
export async function getChatMessages(
  params: GetChatMessagesParams,
): Promise<ListChatMessagesResult> {
  await requireCapability("candidate.read.own");

  const parsed = getChatMessagesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid parameters");
  }

  const { chatUuid, lastIndex, limit = 50 } = parsed.data;

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

  const result = {
    messages: messages as ChatMessageItem[],
    total,
    page: 1,
    limit,
    totalPages: 1,
  };

  const outputParsed = listChatMessagesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    throw new Error(
      `Output validation failed for getChatMessages: ${outputParsed.error.issues[0]?.message ?? "Unknown error"}`,
    );
  }

  return result;
}
