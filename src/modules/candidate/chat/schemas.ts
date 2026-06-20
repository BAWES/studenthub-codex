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

// ---------------------------------------------------------------------------
// Types derived from schemas
// ---------------------------------------------------------------------------

export type ListConversationsParams = z.input<typeof listConversationsSchema>;

export type GetConversationMessagesParams = z.input<typeof getConversationMessagesSchema>;

export type ConversationItem = z.output<typeof conversationItemOutputSchema>;

export type ConversationMessageItem = z.output<typeof conversationMessageItemOutputSchema>;

export type ListConversationsResult = z.output<typeof listConversationsResultOutputSchema>;

export type GetConversationMessagesResult = z.output<typeof getConversationMessagesResultOutputSchema>;
