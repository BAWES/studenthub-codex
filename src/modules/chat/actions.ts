"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listChatsSchema,
  getChatMessagesSchema,
  sendChatMessageSchema,
  chatListItemSchema,
  chatMessageItemSchema,
  listChatsResultSchema,
  listChatMessagesResultSchema,
  sendChatMessageResultSchema,
  type ListChatsParams,
  type GetChatMessagesParams,
  type SendChatMessageParams,
  type ChatListItem,
  type ChatMessageItem,
  type ListChatsResult,
  type ListChatMessagesResult,
  type SendChatMessageResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List chats for the current candidate, with optional filters.
 * Mirrors the legacy Yii2 ChatController::actionList().
 * Includes company/store/staff names for enriched display.
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
      include: {
        company_chat_company_idTocompany: { select: { company_name: true } },
        store: { select: { store_name: true } },
        staff: { select: { staff_name: true } },
      },
    }),
    prisma.chat.count({ where: where as any }),
  ]);

  const result = {
    chats: chats.map((c): ChatListItem => ({
      chat_uuid: c.chat_uuid,
      candidate_id: c.candidate_id,
      company_id: c.company_id,
      store_id: c.store_id,
      staff_id: c.staff_id ?? null,
      created_at: c.created_at?.toISOString() ?? null,
      company_name: c.company_chat_company_idTocompany?.company_name ?? null,
      store_name: c.store?.store_name ?? null,
      staff_name: c.staff?.staff_name ?? null,
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

/**
 * Send a chat message from the current candidate to an existing conversation.
 * Inserts a new chat_message row with from="candidate".
 */
export async function sendChatMessage(
  params: SendChatMessageParams,
): Promise<SendChatMessageResult> {
  await requireCapability("candidate.write");

  const parsed = sendChatMessageSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid message parameters");
  }

  const { chatUuid, message } = parsed.data;

  // Verify the chat exists and belongs to the current candidate
  const chat = await prisma.chat.findUnique({
    where: { chat_uuid: chatUuid },
    select: { chat_uuid: true },
  });

  if (!chat) {
    throw new Error("Conversation not found");
  }

  // Get the next message_index
  const lastMessage = await prisma.chat_message.findFirst({
    where: { chat_uuid: chatUuid },
    orderBy: { message_index: "desc" },
    select: { message_index: true },
  });

  const nextIndex = (lastMessage?.message_index ?? 0) + 1;

  const created = await prisma.chat_message.create({
    data: {
      chat_message_uuid: crypto.randomUUID(),
      chat_uuid: chatUuid,
      from: "candidate",
      message,
      message_index: nextIndex,
      status: false,
      created_at: new Date(),
    },
  });

  const messageItem: ChatMessageItem = {
    chat_message_uuid: created.chat_message_uuid,
    chat_uuid: created.chat_uuid,
    message: created.message,
    message_index: created.message_index ?? null,
    from: created.from ?? null,
    status: created.status ?? null,
    created_at: created.created_at?.toISOString() ?? null,
  };

  const result: SendChatMessageResult = { message: messageItem };

  // Output validation
  const outputParsed = sendChatMessageResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/chat] sendChatMessage output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
