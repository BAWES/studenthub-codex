import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listChatsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  companyId: z.number().int().optional(),
  storeId: z.number().int().optional(),
  staffId: z.number().int().optional(),
});

export const getChatMessagesSchema = z.object({
  chatUuid: z.string().min(1),
  lastIndex: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const sendChatMessageSchema = z.object({
  chatUuid: z.string().min(1, "Chat UUID is required"),
  message: z.string().min(1, "Message is required").max(1000, "Message is too long"),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single chat list item — enriched with participant names.
 */
export const chatListItemSchema = z.object({
  chat_uuid: z.string(),
  candidate_id: z.number().int(),
  company_id: z.number().int(),
  store_id: z.number().int(),
  staff_id: z.number().int().nullable(),
  created_at: z.string().nullable(),
  /** Enriched display name for the company this chat belongs to */
  company_name: z.string().nullable().optional(),
  /** Enriched display name for the store */
  store_name: z.string().nullable().optional(),
  /** Enriched display name for the staff member */
  staff_name: z.string().nullable().optional(),
});

/**
 * Schema for a single chat message item.
 */
export const chatMessageItemSchema = z.object({
  chat_message_uuid: z.string(),
  chat_uuid: z.string(),
  message: z.string(),
  message_index: z.number().int().nullable(),
  from: z.string().nullable(),
  status: z.boolean().nullable(),
  created_at: z.string().nullable(),
});

/**
 * Schema for the listChats response.
 */
export const listChatsResultSchema = z.object({
  chats: z.array(chatListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Schema for the getChatMessages response.
 */
export const listChatMessagesResultSchema = z.object({
  messages: z.array(chatMessageItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Schema for the sendChatMessage result.
 */
export const sendChatMessageResultSchema = z.object({
  message: chatMessageItemSchema,
});

// ---------------------------------------------------------------------------
// Types derived from schemas
// ---------------------------------------------------------------------------

export type ListChatsParams = z.input<typeof listChatsSchema>;
export type GetChatMessagesParams = z.input<typeof getChatMessagesSchema>;
export type SendChatMessageParams = z.input<typeof sendChatMessageSchema>;

export type ChatListItem = z.output<typeof chatListItemSchema>;
export type ChatMessageItem = z.output<typeof chatMessageItemSchema>;
export type ListChatsResult = z.output<typeof listChatsResultSchema>;
export type ListChatMessagesResult = z.output<typeof listChatMessagesResultSchema>;
export type SendChatMessageResult = z.output<typeof sendChatMessageResultSchema>;
