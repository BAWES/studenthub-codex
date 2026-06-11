"use server";

// ---------------------------------------------------------------------------
// Candidate Chat — server actions for /candidate/chat
// ---------------------------------------------------------------------------
// Route-level wrappers that delegate to modules/chat for listing conversations
// and fetching messages for the current candidate.
// ---------------------------------------------------------------------------

import { requireCapability } from "@/modules/auth/session";
import {
  listChats as moduleListChats,
  getChatMessages as moduleGetChatMessages,
} from "@/modules/chat/actions";
import {
  listConversationsSchema,
  getConversationMessagesSchema,
} from "./schemas";
import type {
  ListConversationsParams,
  GetConversationMessagesParams,
  ListConversationsResult,
  GetConversationMessagesResult,
} from "./schemas";

// Re-export types for client components
export type { ConversationItem, ConversationMessageItem, ListConversationsResult, GetConversationMessagesResult } from "./schemas";

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

  const { page, limit, companyId, storeId, staffId } = listConversationsSchema.parse(params);

  const result = await moduleListChats({
    page,
    limit,
    companyId,
    storeId,
    staffId,
  });

  // Map module shape { chats } → app router shape { conversations }
  return {
    conversations: result.chats,
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };
}

/**
 * Get messages for a specific chat conversation, with cursor-based pagination.
 * Delegates to modules/chat/getChatMessages.
 */
export async function getConversationMessages(
  params: GetConversationMessagesParams,
): Promise<GetConversationMessagesResult> {
  await requireCapability("candidate.read.own");

  const { chatUuid, lastIndex, limit } = getConversationMessagesSchema.parse(params);

  const result = await moduleGetChatMessages({
    chatUuid,
    lastIndex,
    limit,
  });

  // Module returns { messages } — pass through directly
  return {
    messages: result.messages,
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };
}
