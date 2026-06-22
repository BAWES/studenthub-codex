// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level schemas
// ---------------------------------------------------------------------------

export {
  listConversationsSchema,
  getConversationMessagesSchema,
  sendConversationMessageSchema,
  conversationItemOutputSchema,
  conversationMessageItemOutputSchema,
  listConversationsResultOutputSchema,
  getConversationMessagesResultOutputSchema,
  sendConversationMessageResultOutputSchema,
} from "@/modules/candidate/chat/schemas";

export type {
  ListConversationsParams,
  GetConversationMessagesParams,
  SendConversationMessageParams,
  ConversationItem,
  ConversationMessageItem,
  ListConversationsResult,
  GetConversationMessagesResult,
  SendConversationMessageResult,
} from "@/modules/candidate/chat/schemas";
