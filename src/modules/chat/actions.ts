"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listChatsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  companyId: z.number().int().optional(),
  storeId: z.number().int().optional(),
  staffId: z.number().int().optional(),
});

const getChatMessagesSchema = z.object({
  chatUuid: z.string().min(1),
  lastIndex: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListChatsParams = z.input<typeof listChatsSchema>;

export type GetChatMessagesParams = z.input<typeof getChatMessagesSchema>;

export type ChatListItem = {
  chat_uuid: string;
  candidate_id: number;
  company_id: number;
  store_id: number;
  staff_id: number | null;
  created_at: Date | null;
};

export type ChatMessageItem = {
  chat_message_uuid: string;
  chat_uuid: string;
  message: string;
  message_index: number | null;
  from: string | null;
  status: boolean | null;
  created_at: Date | null;
};

export type ListChatsResult = {
  chats: ChatListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ListChatMessagesResult = {
  messages: ChatMessageItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

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

  return {
    chats: chats as ChatListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
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

  return {
    messages: messages as ChatMessageItem[],
    total,
    page: 1,
    limit,
    totalPages: 1,
  };
}
