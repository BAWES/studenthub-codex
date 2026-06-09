"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";

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

const listChatMessagesSchema = z.object({
  chatUuid: z.string().min(1, "Chat UUID is required"),
  lastIndex: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ChatItem = {
  chat_uuid: string;
  company_id: number;
  store_id: number;
  staff_id: number | null;
  created_at: string | null;
};

export type ChatMessageItem = {
  chat_message_uuid: string;
  chat_uuid: string;
  from: string | null;
  message: string;
  message_index: number | null;
  status: boolean | null;
  created_at: string | null;
};

export type ListChatsResult = {
  chats: ChatItem[];
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
// List chats for the current candidate
// Mirrors legacy CandidateChatController::actionList()
// ---------------------------------------------------------------------------

export async function listChats(
  params: z.input<typeof listChatsSchema> = {},
): Promise<ListChatsResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = listChatsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { page = 1, limit = 20, companyId, storeId, staffId } = parsed.data;

  const where: Record<string, unknown> = { candidate_id: candidateId };
  if (companyId !== undefined) where.company_id = companyId;
  if (storeId !== undefined) where.store_id = storeId;
  if (staffId !== undefined) where.staff_id = staffId;

  const [chats, total] = await Promise.all([
    prisma.chat.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        chat_uuid: true,
        company_id: true,
        store_id: true,
        staff_id: true,
        created_at: true,
      },
    }),
    prisma.chat.count({ where: where as any }),
  ]);

  return {
    chats: chats.map((c) => ({
      ...c,
      created_at: c.created_at?.toISOString() ?? null,
    })) as ChatItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// List messages for a chat
// Mirrors legacy CandidateChatController::actionMessages()
// ---------------------------------------------------------------------------

export async function listChatMessages(
  params: z.input<typeof listChatMessagesSchema>,
): Promise<ListChatMessagesResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = listChatMessagesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid parameters");
  }

  const { chatUuid, lastIndex, limit = 50 } = parsed.data;

  // Verify the chat belongs to this candidate
  const chat = await prisma.chat.findFirst({
    where: { chat_uuid: chatUuid, candidate_id: candidateId },
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  const where: Record<string, unknown> = { chat_uuid: chatUuid };
  if (lastIndex !== undefined) {
    where.message_index = { lt: lastIndex };
  }

  const [messages, total] = await Promise.all([
    prisma.chat_message.findMany({
      where: where as any,
      orderBy: { message_index: "desc" },
      take: limit,
      select: {
        chat_message_uuid: true,
        chat_uuid: true,
        from: true,
        message: true,
        message_index: true,
        status: true,
        created_at: true,
      },
    }),
    prisma.chat_message.count({
      where: { chat_uuid: chatUuid } as any,
    }),
  ]);

  // Sort messages ascending for display
  messages.reverse();

  return {
    messages: messages.map((m) => ({
      ...m,
      created_at: m.created_at?.toISOString() ?? null,
    })) as ChatMessageItem[],
    total,
    page: 1,
    limit,
    totalPages: 1,
  };
}
