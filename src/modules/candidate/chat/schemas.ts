import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas for candidate/chat actions
// ---------------------------------------------------------------------------

export const listConversationsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  companyId: z.coerce.number().int().optional(),
  storeId: z.coerce.number().int().optional(),
  staffId: z.coerce.number().int().optional(),
});

export const getConversationMessagesSchema = z.object({
  chatUuid: z.string().min(1, "Chat UUID is required"),
  lastIndex: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export const sendConversationMessageSchema = z.object({
  chatUuid: z.string().min(1, "Chat UUID is required"),
  message: z.string().min(1, "Message is required").max(1000, "Message is too long"),
});

// ---------------------------------------------------------------------------
// Output validation — Zod schemas for server action return types
// ---------------------------------------------------------------------------

export const conversationItemOutputSchema = z.object({
  chat_uuid: z.string(),
  candidate_id: z.number().int(),
  company_id: z.number().int(),
  store_id: z.number().int(),
  staff_id: z.number().int().nullable(),
  created_at: z.string().nullable(),
  company_name: z.string().nullable().optional(),
  store_name: z.string().nullable().optional(),
  staff_name: z.string().nullable().optional(),
});

export const conversationMessageItemOutputSchema = z.object({
  chat_message_uuid: z.string(),
  chat_uuid: z.string(),
  message: z.string(),
  message_index: z.number().int().nullable(),
  from: z.string().nullable(),
  status: z.boolean().nullable(),
  created_at: z.string().nullable(),
});

export const listConversationsResultOutputSchema = z.object({
  conversations: z.array(conversationItemOutputSchema),
  total: z.number().nonnegative(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const getConversationMessagesResultOutputSchema = z.object({
  messages: z.array(conversationMessageItemOutputSchema),
  total: z.number().nonnegative(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const sendConversationMessageResultOutputSchema = z.object({
  message: conversationMessageItemOutputSchema,
});

// ---------------------------------------------------------------------------
// Types derived from schemas
// ---------------------------------------------------------------------------

export type ListConversationsParams = z.input<typeof listConversationsSchema>;

export type GetConversationMessagesParams = z.input<typeof getConversationMessagesSchema>;

export type SendConversationMessageParams = z.input<typeof sendConversationMessageSchema>;

export type ConversationItem = {
  chat_uuid: string;
  candidate_id: number;
  company_id: number;
  store_id: number;
  staff_id: number | null;
  created_at: string | null;
  company_name?: string | null;
  store_name?: string | null;
  staff_name?: string | null;
};

export type ConversationMessageItem = {
  chat_message_uuid: string;
  chat_uuid: string;
  message: string;
  message_index: number | null;
  from: string | null;
  status: boolean | null;
  created_at: string | null;
};

export type ListConversationsResult = {
  conversations: ConversationItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type GetConversationMessagesResult = {
  messages: ConversationMessageItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type SendConversationMessageResult = {
  message: ConversationMessageItem;
};
