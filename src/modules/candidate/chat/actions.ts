"use server";

// ---------------------------------------------------------------------------
// Candidate Chat — module-level server actions
// ---------------------------------------------------------------------------
// Route-level wrappers that delegate to modules/chat for listing conversations
// and fetching messages for the current candidate.
// ---------------------------------------------------------------------------

import { requireCapability } from "@/modules/auth/session";
import {
  listChats as moduleListChats,
  getChatMessages as moduleGetChatMessages,
  sendChatMessage as moduleSendChatMessage,
} from "@/modules/chat/actions";
import {
  listConversationsSchema,
  getConversationMessagesSchema,
  sendConversationMessageSchema,
  listConversationsResultOutputSchema,
  getConversationMessagesResultOutputSchema,
  sendConversationMessageResultOutputSchema,
} from "./schemas";
import type {
  ListConversationsParams,
  GetConversationMessagesParams,
  SendConversationMessageParams,
  ListConversationsResult,
  GetConversationMessagesResult,
  SendConversationMessageResult,
} from "./schemas";

// Re-export types for client components
export type {
  ConversationItem,
  ConversationMessageItem,
  ListConversationsResult,
  GetConversationMessagesResult,
  SendConversationMessageResult,
  SendConversationMessageParams,
} from "./schemas";

// ---------------------------------------------------------------------------
// Server actions — delegate to module-level implementations
// ---------------------------------------------------------------------------

/**
 * List chat conversations accessible to the current candidate.
 * Delegates to modules/chat/listChats with the candidate's session context.
 */
export async function listConversations(
  params: ListConversationsParams = {},
): Promise<ListConversationsResult> {
  await requireCapability("candidate.read.own");

  const parsed = listConversationsSchema.safeParse(params);
  if (!parsed.success) {
    return { conversations: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, companyId, storeId, staffId } = parsed.data;

  const result = await moduleListChats({
    page,
    limit,
    companyId,
    storeId,
    staffId,
  });

  // Map module shape { chats } → app router shape { conversations }
  const listResult = {
    conversations: result.chats,
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };

  // Validate output shape
  const listOutputParsed = listConversationsResultOutputSchema.safeParse(listResult);
  if (!listOutputParsed.success) {
    console.error(
      "[candidate/chat] listConversations output validation failed:",
      listOutputParsed.error.issues,
    );
  }

  return listResult;
}

/**
 * Get messages for a specific chat conversation, with cursor-based pagination.
 * Delegates to modules/chat/getChatMessages.
 */
export async function getConversationMessages(
  params: GetConversationMessagesParams,
): Promise<GetConversationMessagesResult> {
  await requireCapability("candidate.read.own");

  const parsed = getConversationMessagesSchema.safeParse(params);
  if (!parsed.success) {
    return { messages: [], total: 0, page: 1, limit: 50, totalPages: 0 };
  }

  const { chatUuid, lastIndex, limit } = parsed.data;

  const result = await moduleGetChatMessages({
    chatUuid,
    lastIndex,
    limit,
  });

  // Module returns { messages } — pass through directly
  const messagesResult = {
    messages: result.messages,
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };

  // Validate output shape
  const messagesOutputParsed = getConversationMessagesResultOutputSchema.safeParse(messagesResult);
  if (!messagesOutputParsed.success) {
    console.error(
      "[candidate/chat] getConversationMessages output validation failed:",
      messagesOutputParsed.error.issues,
    );
  }

  return messagesResult;
}

/**
 * Send a message to an existing conversation.
 * Delegates to modules/chat/sendChatMessage.
 */
export async function sendConversationMessage(
  params: SendConversationMessageParams,
): Promise<SendConversationMessageResult> {
  await requireCapability("candidate.write");

  const parsed = sendConversationMessageSchema.safeParse(params);
  if (!parsed.success) {
    return { message: {
      chat_message_uuid: "error",
      chat_uuid: "",
      message: parsed.error.issues[0]?.message ?? "Invalid params",
      message_index: null,
      from: null,
      status: null,
      created_at: null,
    }};
  }

  const { chatUuid, message } = parsed.data;

  const result = await moduleSendChatMessage({ chatUuid, message });

  // Output validation
  const outputParsed = sendConversationMessageResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/chat] sendConversationMessage output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
