import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
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
// Types
// ---------------------------------------------------------------------------

export type ListConversationsParams = z.input<typeof listConversationsSchema>;

export type GetConversationMessagesParams = z.input<typeof getConversationMessagesSchema>;

export type ConversationItem = {
  chat_uuid: string;
  candidate_id: number;
  company_id: number;
  store_id: number;
  staff_id: number | null;
  created_at: Date | null;
};

export type ConversationMessageItem = {
  chat_message_uuid: string;
  chat_uuid: string;
  message: string;
  message_index: number | null;
  from: string | null;
  status: boolean | null;
  created_at: Date | null;
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
