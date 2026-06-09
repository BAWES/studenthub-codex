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
  companyId: z.number().int().positive().optional(),
  storeId: z.number().int().positive().optional(),
  staffId: z.number().int().positive().optional(),
});

const getChatSchema = z.object({
  chatUuid: z.string().min(1, "Chat UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListChatsParams = z.input<typeof listChatsSchema>;

export type ChatListItem = {
  chat_uuid: string;
  candidate_id: number;
  company_id: number;
  store_id: number;
  staff_id: number | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export type ListChatsResult = {
  chats: ChatListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ChatDetail = ChatListItem & {
  contact_uuid: string | null;
  parent_company_id: number | null;
};

export type GetChatResult = {
  chat: ChatDetail;
};

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List chats for the current candidate, with optional filters.
 * Mirrors legacy CandidateChatController::actionList().
 */
export async function listChats(
  params: ListChatsParams = {},
): Promise<ListChatsResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = listChatsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { page = 1, limit = 20, companyId, storeId, staffId } = parsed.data;

  // Build where clause — always scoped to current candidate
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
        candidate_id: true,
        company_id: true,
        store_id: true,
        staff_id: true,
        created_at: true,
        updated_at: true,
      },
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
 * Get a single chat by UUID for the current candidate.
 * Mirrors legacy CandidateChatController::actionView().
 */
export async function getChat(
  params: z.input<typeof getChatSchema>,
): Promise<GetChatResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = getChatSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid chat UUID");
  }

  const { chatUuid } = parsed.data;

  const chat = await prisma.chat.findFirst({
    where: {
      chat_uuid: chatUuid,
      candidate_id: candidateId,
    },
    select: {
      chat_uuid: true,
      candidate_id: true,
      company_id: true,
      parent_company_id: true,
      store_id: true,
      staff_id: true,
      contact_uuid: true,
      created_at: true,
      updated_at: true,
    },
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  return { chat: chat as ChatDetail };
}
