import { describe, it, expect } from "vitest";

import {
  listChatsSchema,
  getChatMessagesSchema,
  chatListItemSchema,
  chatMessageItemSchema,
  listChatsResultSchema,
  listChatMessagesResultSchema,
  type ChatListItem,
  type ChatMessageItem,
  type ListChatsResult,
  type ListChatMessagesResult,
} from "./schemas";

describe("listChatsSchema", () => {
  it("accepts empty params", () => {
    expect(listChatsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts pagination params", () => {
    const r = listChatsSchema.safeParse({ page: 1, limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts filter params", () => {
    const r = listChatsSchema.safeParse({ companyId: 5, storeId: 3, staffId: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyId).toBe(5);
      expect(r.data.storeId).toBe(3);
      expect(r.data.staffId).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    expect(listChatsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listChatsSchema.safeParse({ page: -1 }).success).toBe(false);
  });
});

describe("getChatMessagesSchema", () => {
  it("accepts only chatUuid", () => {
    const r = getChatMessagesSchema.safeParse({ chatUuid: "chat_abc" });
    expect(r.success).toBe(true);
  });

  it("accepts lastIndex pagination", () => {
    const r = getChatMessagesSchema.safeParse({ chatUuid: "chat_abc", lastIndex: 50 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.lastIndex).toBe(50);
    }
  });

  it("rejects empty chatUuid", () => {
    expect(getChatMessagesSchema.safeParse({ chatUuid: "" }).success).toBe(false);
  });

  it("rejects missing chatUuid", () => {
    expect(getChatMessagesSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: chatListItemSchema
// ---------------------------------------------------------------------------

const validChatListItem: ChatListItem = {
  chat_uuid: "chat_abc123",
  candidate_id: 1,
  company_id: 5,
  store_id: 3,
  staff_id: null,
  created_at: null,
};

describe("chatListItemSchema", () => {
  it("accepts a valid chat item", () => {
    const result = chatListItemSchema.parse(validChatListItem);
    expect(result.chat_uuid).toBe("chat_abc123");
  });

  it("rejects missing required candidate_id", () => {
    const { candidate_id, ...rest } = validChatListItem;
    expect(() => chatListItemSchema.parse(rest)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: chatMessageItemSchema
// ---------------------------------------------------------------------------

const validChatMessageItem: ChatMessageItem = {
  chat_message_uuid: "msg_abc123",
  chat_uuid: "chat_abc123",
  message: "Hello, I have a question",
  message_index: 1,
  from: "candidate",
  status: false,
  created_at: null,
};

describe("chatMessageItemSchema", () => {
  it("accepts a valid message item", () => {
    const result = chatMessageItemSchema.parse(validChatMessageItem);
    expect(result.message).toBe("Hello, I have a question");
  });

  it("rejects wrong type for status", () => {
    expect(() =>
      chatMessageItemSchema.parse({ ...validChatMessageItem, status: "true" }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: listChatsResultSchema
// ---------------------------------------------------------------------------

describe("listChatsResultSchema", () => {
  it("accepts a valid result", () => {
    const r = listChatsResultSchema.parse({
      chats: [validChatListItem],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.chats).toHaveLength(1);
  });

  it("accepts empty result", () => {
    const r = listChatsResultSchema.parse({
      chats: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.total).toBe(0);
  });

  it("rejects negative total", () => {
    expect(() =>
      listChatsResultSchema.parse({
        chats: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
      }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: listChatMessagesResultSchema
// ---------------------------------------------------------------------------

describe("listChatMessagesResultSchema", () => {
  it("accepts a valid result", () => {
    const r = listChatMessagesResultSchema.parse({
      messages: [validChatMessageItem],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.messages).toHaveLength(1);
  });

  it("accepts empty result", () => {
    const r = listChatMessagesResultSchema.parse({
      messages: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.total).toBe(0);
  });
});
