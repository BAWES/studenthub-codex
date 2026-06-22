import { describe, it, expect } from "vitest";
import {
  listChatsSchema,
  getChatMessagesSchema,
  sendChatMessageSchema,
  chatListItemSchema,
  chatMessageItemSchema,
  listChatsResultSchema,
  listChatMessagesResultSchema,
  sendChatMessageResultSchema,
  type ChatListItem,
  type ChatMessageItem,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validChatListItem = (): ChatListItem => ({
  chat_uuid: "chat_abc123",
  candidate_id: 42,
  company_id: 10,
  store_id: 5,
  staff_id: 7,
  created_at: "2026-01-15T10:00:00Z",
});

const nullableChatListItem = (): ChatListItem => ({
  chat_uuid: "chat_def456",
  candidate_id: 99,
  company_id: 20,
  store_id: 8,
  staff_id: null,
  created_at: null,
});

const validChatMessageItem = (): ChatMessageItem => ({
  chat_message_uuid: "msg_abc123",
  chat_uuid: "chat_abc123",
  message: "Hello, how can I help you?",
  message_index: 1,
  from: "candidate",
  status: true,
  created_at: "2026-01-15T10:00:00Z",
});

const nullableChatMessageItem = (): ChatMessageItem => ({
  chat_message_uuid: "msg_def456",
  chat_uuid: "chat_def456",
  message: "I need assistance",
  message_index: null,
  from: null,
  status: null,
  created_at: null,
});

// ---------------------------------------------------------------------------
// Input: listChatsSchema
// ---------------------------------------------------------------------------

describe("listChatsSchema (input)", () => {
  it("accepts empty params (all fields optional)", () => {
    const r = listChatsSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("accepts valid page and limit", () => {
    const r = listChatsSchema.safeParse({ page: 2, limit: 50 });
    expect(r.success).toBe(true);
  });

  it("accepts all filter fields", () => {
    const r = listChatsSchema.safeParse({
      page: 1,
      limit: 20,
      companyId: 10,
      storeId: 5,
      staffId: 7,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative page", () => {
    expect(listChatsSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listChatsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(listChatsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listChatsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects non-integer page", () => {
    expect(listChatsSchema.safeParse({ page: 1.5 }).success).toBe(false);
  });

  it("rejects non-integer limit", () => {
    expect(listChatsSchema.safeParse({ limit: 20.5 }).success).toBe(false);
  });

  it("rejects non-number companyId", () => {
    expect(listChatsSchema.safeParse({ companyId: "abc" }).success).toBe(false);
  });

  it("rejects non-number storeId", () => {
    expect(listChatsSchema.safeParse({ storeId: "abc" }).success).toBe(false);
  });

  it("rejects non-number staffId", () => {
    expect(listChatsSchema.safeParse({ staffId: "abc" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input: getChatMessagesSchema
// ---------------------------------------------------------------------------

describe("getChatMessagesSchema (input)", () => {
  it("accepts valid params with all fields", () => {
    const r = getChatMessagesSchema.safeParse({
      chatUuid: "chat_abc123",
      lastIndex: 5,
      limit: 50,
    });
    expect(r.success).toBe(true);
  });

  it("accepts valid params with only chatUuid", () => {
    const r = getChatMessagesSchema.safeParse({ chatUuid: "chat_abc123" });
    expect(r.success).toBe(true);
  });

  it("rejects missing chatUuid", () => {
    expect(getChatMessagesSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty string chatUuid", () => {
    expect(getChatMessagesSchema.safeParse({ chatUuid: "" }).success).toBe(false);
  });

  it("rejects non-string chatUuid", () => {
    expect(getChatMessagesSchema.safeParse({ chatUuid: 123 }).success).toBe(false);
  });

  it("rejects negative lastIndex", () => {
    expect(
      getChatMessagesSchema.safeParse({ chatUuid: "abc", lastIndex: -1 }).success,
    ).toBe(false);
  });

  it("rejects zero lastIndex", () => {
    expect(
      getChatMessagesSchema.safeParse({ chatUuid: "abc", lastIndex: 0 }).success,
    ).toBe(false);
  });

  it("rejects non-integer lastIndex", () => {
    expect(
      getChatMessagesSchema.safeParse({ chatUuid: "abc", lastIndex: 1.5 }).success,
    ).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(
      getChatMessagesSchema.safeParse({ chatUuid: "abc", limit: 0 }).success,
    ).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(
      getChatMessagesSchema.safeParse({ chatUuid: "abc", limit: 101 }).success,
    ).toBe(false);
  });

  it("rejects non-integer limit", () => {
    expect(
      getChatMessagesSchema.safeParse({ chatUuid: "abc", limit: 20.5 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output: chatListItemSchema
// ---------------------------------------------------------------------------

describe("chatListItemSchema", () => {
  it("accepts a full chat list item with all fields populated", () => {
    const r = chatListItemSchema.safeParse(validChatListItem());
    expect(r.success).toBe(true);
  });

  it("accepts a chat list item with nullable fields set to null", () => {
    const r = chatListItemSchema.safeParse(nullableChatListItem());
    expect(r.success).toBe(true);
  });

  it("rejects missing required field 'chat_uuid'", () => {
    const { chat_uuid: _, ...rest } = validChatListItem();
    expect(chatListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing required field 'candidate_id'", () => {
    const { candidate_id: _, ...rest } = validChatListItem();
    expect(chatListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing required field 'company_id'", () => {
    const { company_id: _, ...rest } = validChatListItem();
    expect(chatListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing required field 'store_id'", () => {
    const { store_id: _, ...rest } = validChatListItem();
    expect(chatListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-string chat_uuid", () => {
    expect(
      chatListItemSchema.safeParse({ ...validChatListItem(), chat_uuid: 123 }).success,
    ).toBe(false);
  });

  it("rejects non-number candidate_id", () => {
    expect(
      chatListItemSchema.safeParse({ ...validChatListItem(), candidate_id: "abc" }).success,
    ).toBe(false);
  });

  it("rejects non-number company_id", () => {
    expect(
      chatListItemSchema.safeParse({ ...validChatListItem(), company_id: "abc" }).success,
    ).toBe(false);
  });

  it("rejects non-number store_id", () => {
    expect(
      chatListItemSchema.safeParse({ ...validChatListItem(), store_id: "abc" }).success,
    ).toBe(false);
  });

  it("rejects non-integer candidate_id", () => {
    expect(
      chatListItemSchema.safeParse({ ...validChatListItem(), candidate_id: 1.5 }).success,
    ).toBe(false);
  });

  it("rejects completely empty object", () => {
    expect(chatListItemSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output: chatMessageItemSchema
// ---------------------------------------------------------------------------

describe("chatMessageItemSchema", () => {
  it("accepts a full chat message item with all fields populated", () => {
    const r = chatMessageItemSchema.safeParse(validChatMessageItem());
    expect(r.success).toBe(true);
  });

  it("accepts a chat message item with nullable fields set to null", () => {
    const r = chatMessageItemSchema.safeParse(nullableChatMessageItem());
    expect(r.success).toBe(true);
  });

  it("rejects missing required field 'chat_message_uuid'", () => {
    const { chat_message_uuid: _, ...rest } = validChatMessageItem();
    expect(chatMessageItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing required field 'chat_uuid'", () => {
    const { chat_uuid: _, ...rest } = validChatMessageItem();
    expect(chatMessageItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing required field 'message'", () => {
    const { message: _, ...rest } = validChatMessageItem();
    expect(chatMessageItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-string chat_message_uuid", () => {
    expect(
      chatMessageItemSchema.safeParse({
        ...validChatMessageItem(),
        chat_message_uuid: 123,
      }).success,
    ).toBe(false);
  });

  it("rejects non-string chat_uuid", () => {
    expect(
      chatMessageItemSchema.safeParse({ ...validChatMessageItem(), chat_uuid: 123 }).success,
    ).toBe(false);
  });

  it("rejects non-string message", () => {
    expect(
      chatMessageItemSchema.safeParse({ ...validChatMessageItem(), message: 123 }).success,
    ).toBe(false);
  });

  it("rejects non-integer message_index", () => {
    expect(
      chatMessageItemSchema.safeParse({
        ...validChatMessageItem(),
        message_index: "abc",
      }).success,
    ).toBe(false);
  });

  it("rejects non-boolean status", () => {
    expect(
      chatMessageItemSchema.safeParse({ ...validChatMessageItem(), status: "yes" }).success,
    ).toBe(false);
  });

  it("rejects non-number message_index (float)", () => {
    expect(
      chatMessageItemSchema.safeParse({
        ...validChatMessageItem(),
        message_index: 1.5,
      }).success,
    ).toBe(false);
  });

  it("rejects non-number from field", () => {
    expect(
      chatMessageItemSchema.safeParse({ ...validChatMessageItem(), from: 123 }).success,
    ).toBe(false);
  });

  it("rejects completely empty object", () => {
    expect(chatMessageItemSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output: listChatsResultSchema
// ---------------------------------------------------------------------------

describe("listChatsResultSchema", () => {
  it("accepts a full paginated result", () => {
    const r = listChatsResultSchema.safeParse({
      chats: [validChatListItem(), nullableChatListItem()],
      total: 42,
      page: 1,
      limit: 20,
      totalPages: 3,
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty chats array", () => {
    const r = listChatsResultSchema.safeParse({
      chats: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listChatsResultSchema.safeParse({
        chats: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listChatsResultSchema.safeParse({
        chats: [],
        total: 0,
        page: 0,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(
      listChatsResultSchema.safeParse({
        chats: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects missing required fields", () => {
    expect(listChatsResultSchema.safeParse({ chats: [] }).success).toBe(false);
  });

  it("rejects non-array chats", () => {
    expect(
      listChatsResultSchema.safeParse({
        chats: "not-an-array",
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects non-integer total", () => {
    expect(
      listChatsResultSchema.safeParse({
        chats: [],
        total: 1.5,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects non-integer page", () => {
    expect(
      listChatsResultSchema.safeParse({
        chats: [],
        total: 0,
        page: 1.5,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects non-integer limit", () => {
    expect(
      listChatsResultSchema.safeParse({
        chats: [],
        total: 0,
        page: 1,
        limit: 1.5,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects non-integer totalPages", () => {
    expect(
      listChatsResultSchema.safeParse({
        chats: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1.5,
      }).success,
    ).toBe(false);
  });

  it("rejects completely empty object", () => {
    expect(listChatsResultSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output: listChatMessagesResultSchema
// ---------------------------------------------------------------------------

describe("listChatMessagesResultSchema", () => {
  it("accepts a full paginated result", () => {
    const r = listChatMessagesResultSchema.safeParse({
      messages: [validChatMessageItem(), nullableChatMessageItem()],
      total: 42,
      page: 1,
      limit: 20,
      totalPages: 3,
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty messages array", () => {
    const r = listChatMessagesResultSchema.safeParse({
      messages: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listChatMessagesResultSchema.safeParse({
        messages: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listChatMessagesResultSchema.safeParse({
        messages: [],
        total: 0,
        page: 0,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(
      listChatMessagesResultSchema.safeParse({
        messages: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects missing required fields", () => {
    expect(listChatMessagesResultSchema.safeParse({ messages: [] }).success).toBe(false);
  });

  it("rejects non-array messages", () => {
    expect(
      listChatMessagesResultSchema.safeParse({
        messages: "not-an-array",
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects non-integer total", () => {
    expect(
      listChatMessagesResultSchema.safeParse({
        messages: [],
        total: 1.5,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects non-integer page", () => {
    expect(
      listChatMessagesResultSchema.safeParse({
        messages: [],
        total: 0,
        page: 1.5,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects non-integer limit", () => {
    expect(
      listChatMessagesResultSchema.safeParse({
        messages: [],
        total: 0,
        page: 1,
        limit: 1.5,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects non-integer totalPages", () => {
    expect(
      listChatMessagesResultSchema.safeParse({
        messages: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1.5,
      }).success,
    ).toBe(false);
  });

  it("rejects completely empty object", () => {
    expect(listChatMessagesResultSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input: sendChatMessageSchema
// ---------------------------------------------------------------------------

describe("sendChatMessageSchema (input)", () => {
  it("accepts valid params", () => {
    const r = sendChatMessageSchema.safeParse({
      chatUuid: "chat_abc123",
      message: "Hello, I need help",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing chatUuid", () => {
    expect(
      sendChatMessageSchema.safeParse({ message: "Hello" }).success,
    ).toBe(false);
  });

  it("rejects empty chatUuid", () => {
    expect(
      sendChatMessageSchema.safeParse({ chatUuid: "", message: "Hello" }).success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(
      sendChatMessageSchema.safeParse({ chatUuid: "abc" }).success,
    ).toBe(false);
  });

  it("rejects empty message", () => {
    expect(
      sendChatMessageSchema.safeParse({ chatUuid: "abc", message: "" }).success,
    ).toBe(false);
  });

  it("rejects message over 1000 chars", () => {
    expect(
      sendChatMessageSchema.safeParse({ chatUuid: "abc", message: "x".repeat(1001) }).success,
    ).toBe(false);
  });

  it("accepts message at 1000 chars", () => {
    expect(
      sendChatMessageSchema.safeParse({ chatUuid: "abc", message: "x".repeat(1000) }).success,
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Output: sendChatMessageResultSchema
// ---------------------------------------------------------------------------

describe("sendChatMessageResultSchema", () => {
  it("accepts a valid send result", () => {
    const r = sendChatMessageResultSchema.safeParse({
      message: {
        chat_message_uuid: "msg_abc123",
        chat_uuid: "chat_abc123",
        message: "Hello!",
        message_index: 5,
        from: "candidate",
        status: false,
        created_at: "2026-01-15T10:00:00Z",
      },
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing message field", () => {
    expect(sendChatMessageResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects invalid message shape", () => {
    expect(
      sendChatMessageResultSchema.safeParse({ message: "not-an-object" }).success,
    ).toBe(false);
  });
});
