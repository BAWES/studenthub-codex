"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listChatsSchema,
  getChatMessagesSchema,
  chatListItemSchema,
  chatMessageItemSchema,
  listChatsResultSchema,
  listChatMessagesResultSchema,
  type ListChatsParams,
  type GetChatMessagesParams,
  type ChatListItem,
  type ChatMessageItem,
  type ListChatsResult,
  type ListChatMessagesResult,
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
    chats: chats.map((c) => ({
      chat_uuid: c.chat_uuid,
      candidate_id: c.candidate_id,
      company_id: c.company_id,
      store_id: c.store_id,
      staff_id: c.staff_id ?? null,
      created_at: c.created_at?.toISOString() ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Output validation — log mismatches without throwing
  const outputParsed = listChatsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/chat] listChats output validation failed:",
      outputParsed.error.issues,
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
    messages: messages.map((m) => ({
      chat_message_uuid: m.chat_message_uuid,
      chat_uuid: m.chat_uuid,
      message: m.message,
      message_index: m.message_index ?? null,
      from: m.from ?? null,
      status: m.status ?? null,
      created_at: m.created_at?.toISOString() ?? null,
    })),
    total,
    page: 1,
    limit,
    totalPages: 1,
  };

  // Output validation — log mismatches without throwing
  const outputParsed = listChatMessagesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/chat] getChatMessages output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
