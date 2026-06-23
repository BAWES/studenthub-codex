import { describe, it, expect } from "vitest";
import {
  conversationItemOutputSchema,
  conversationMessageItemOutputSchema,
  listConversationsResultOutputSchema,
  getConversationMessagesResultOutputSchema,
  sendConversationMessageResultOutputSchema,
} from "./schemas";

describe("candidate chat page — data contract", () => {
  it("conversationItemOutputSchema validates a valid conversation", () => {
    const r = conversationItemOutputSchema.safeParse({
      chat_uuid: "abc-123",
      candidate_id: 1,
      company_id: 2,
      store_id: 3,
      staff_id: null,
      created_at: "2024-01-01T00:00:00Z",
      company_name: "Test Company",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.chat_uuid).toBe("abc-123");
  });

  it("conversationItemOutputSchema rejects missing chat_uuid", () => {
    const r = conversationItemOutputSchema.safeParse({ candidate_id: 1, company_id: 2, store_id: 3 });
    expect(r.success).toBe(false);
  });

  it("conversationItemOutputSchema accepts optional enriched fields", () => {
    const r = conversationItemOutputSchema.safeParse({
      chat_uuid: "abc-123",
      candidate_id: 1,
      company_id: 2,
      store_id: 3,
      staff_id: 5,
      created_at: "2024-01-01T00:00:00Z",
      company_name: "Acme Corp",
      store_name: "Downtown Branch",
      staff_name: "John Staff",
    });
    expect(r.success).toBe(true);
  });

  it("conversationMessageItemOutputSchema validates a valid message", () => {
    const r = conversationMessageItemOutputSchema.safeParse({
      chat_message_uuid: "msg-1",
      chat_uuid: "abc-123",
      message: "Hello",
      message_index: 1,
      from: "candidate",
      status: true,
      created_at: "2024-01-01T00:00:00Z",
    });
    expect(r.success).toBe(true);
  });

  it("conversationMessageItemOutputSchema rejects missing message", () => {
    const r = conversationMessageItemOutputSchema.safeParse({ chat_message_uuid: "m1", chat_uuid: "c1" });
    expect(r.success).toBe(false);
  });

  it("listConversationsResultOutputSchema validates result", () => {
    const r = listConversationsResultOutputSchema.safeParse({
      conversations: [{
        chat_uuid: "c1", candidate_id: 1, company_id: 2, store_id: 3,
        staff_id: null, created_at: null,
      }],
      total: 1, page: 1, limit: 20, totalPages: 1,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.conversations.length).toBe(1);
  });

  it("getConversationMessagesResultOutputSchema validates messages result", () => {
    const r = getConversationMessagesResultOutputSchema.safeParse({
      messages: [{
        chat_message_uuid: "m1", chat_uuid: "c1", message: "Hi",
        message_index: 0, from: "candidate", status: true, created_at: null,
      }],
      total: 1, page: 1, limit: 50, totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("getConversationMessagesResultOutputSchema rejects non-array messages", () => {
    const r = getConversationMessagesResultOutputSchema.safeParse({ messages: "bad", total: 0, page: 0, limit: 0, totalPages: 0 });
    expect(r.success).toBe(false);
  });

  it("sendConversationMessageResultOutputSchema validates send result", () => {
    const r = sendConversationMessageResultOutputSchema.safeParse({
      message: {
        chat_message_uuid: "m1",
        chat_uuid: "c1",
        message: "Hello!",
        message_index: 5,
        from: "candidate",
        status: false,
        created_at: "2024-01-01T00:00:00Z",
      },
    });
    expect(r.success).toBe(true);
  });

  it("sendConversationMessageResultOutputSchema rejects missing message", () => {
    const r = sendConversationMessageResultOutputSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});
