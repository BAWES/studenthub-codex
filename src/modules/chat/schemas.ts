import { z } from "zod";

// ---------------------------------------------------------------------------
// Input Schemas
// ---------------------------------------------------------------------------

export const listChatsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  companyId: z.number().int().optional(),
  storeId: z.number().int().optional(),
  staffId: z.number().int().optional(),
});

export const getChatMessagesSchema = z.object({
  chatUuid: z.string().min(1, "Chat UUID is required"),
  lastIndex: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

// ---------------------------------------------------------------------------
// Output Schemas
// ---------------------------------------------------------------------------

export const chatListItemSchema = z.object({
  chat_uuid: z.string(),
  candidate_id: z.number().int(),
  company_id: z.number().int(),
  store_id: z.number().int(),
  staff_id: z.number().int().nullable(),
  created_at: z.date().nullable(),
});

export const chatMessageItemSchema = z.object({
  chat_message_uuid: z.string(),
  chat_uuid: z.string(),
  message: z.string(),
  message_index: z.number().int().nullable(),
  from: z.string().nullable(),
  status: z.boolean().nullable(),
  created_at: z.date().nullable(),
});

export const listChatsResultSchema = z.object({
  chats: z.array(chatListItemSchema),
  total: z.number().int(),
  page: z.number().int().nonnegative(),
  limit: z.number().int(),
  totalPages: z.number().int(),
});

export const listChatMessagesResultSchema = z.object({
  messages: z.array(chatMessageItemSchema),
  total: z.number().int(),
  page: z.number().int().nonnegative(),
  limit: z.number().int(),
  totalPages: z.number().int(),
});

// ---------------------------------------------------------------------------
// Inferred Types
// ---------------------------------------------------------------------------

export type ListChatsParams = z.input<typeof listChatsSchema>;
export type GetChatMessagesParams = z.input<typeof getChatMessagesSchema>;
export type ChatListItem = z.infer<typeof chatListItemSchema>;
export type ChatMessageItem = z.infer<typeof chatMessageItemSchema>;
export type ListChatsResult = z.infer<typeof listChatsResultSchema>;
export type ListChatMessagesResult = z.infer<typeof listChatMessagesResultSchema>;
