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

// ---------------------------------------------------------------------------
// Input schema: listChatsSchema
// ---------------------------------------------------------------------------

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

  it("rejects limit below 1", () => {
    expect(listChatsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listChatsSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listChatsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects non-integer page", () => {
    expect(listChatsSchema.safeParse({ page: 1.5 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema: getChatMessagesSchema
// ---------------------------------------------------------------------------

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

  it("accepts limit param", () => {
    const r = getChatMessagesSchema.safeParse({ chatUuid: "chat_abc", limit: 30 });
    expect(r.success).toBe(true);
  });

  it("rejects empty chatUuid", () => {
    expect(getChatMessagesSchema.safeParse({ chatUuid: "" }).success).toBe(false);
  });

  it("rejects missing chatUuid", () => {
    expect(getChatMessagesSchema.safeParse({}).success).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(
      getChatMessagesSchema.safeParse({ chatUuid: "chat_abc", limit: 0 }).success,
    ).toBe(false);
  });

  it("rejects limit over 100", () => {
    expect(
      getChatMessagesSchema.safeParse({ chatUuid: "chat_abc", limit: 101 }).success,
    ).toBe(false);
  });

  it("rejects non-positive lastIndex", () => {
    expect(
      getChatMessagesSchema.safeParse({ chatUuid: "chat_abc", lastIndex: 0 }).success,
    ).toBe(false);
  });

  it("rejects negative lastIndex", () => {
    expect(
      getChatMessagesSchema.safeParse({ chatUuid: "chat_abc", lastIndex: -1 }).success,
    ).toBe(false);
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

  it("accepts nullable fields as null", () => {
    const result = chatListItemSchema.parse({
      ...validChatListItem,
      staff_id: null,
      created_at: null,
    });
    expect(result.staff_id).toBeNull();
    expect(result.created_at).toBeNull();
  });

  it("rejects missing required candidate_id", () => {
    const { candidate_id, ...rest } = validChatListItem;
    expect(() => chatListItemSchema.parse(rest)).toThrow();
  });

  it("rejects missing required company_id", () => {
    const { company_id, ...rest } = validChatListItem;
    expect(() => chatListItemSchema.parse(rest)).toThrow();
  });

  it("rejects missing required store_id", () => {
    const { store_id, ...rest } = validChatListItem;
    expect(() => chatListItemSchema.parse(rest)).toThrow();
  });

  it("rejects non-integer candidate_id", () => {
    expect(() =>
      chatListItemSchema.parse({ ...validChatListItem, candidate_id: "abc" }),
    ).toThrow();
  });

  it("rejects missing chat_uuid", () => {
    const { chat_uuid, ...rest } = validChatListItem;
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

  it("accepts nullable fields as null", () => {
    const result = chatMessageItemSchema.parse({
      ...validChatMessageItem,
      message_index: null,
      from: null,
      status: null,
      created_at: null,
    });
    expect(result.message_index).toBeNull();
    expect(result.from).toBeNull();
  });

  it("rejects wrong type for status", () => {
    expect(() =>
      chatMessageItemSchema.parse({ ...validChatMessageItem, status: "true" }),
    ).toThrow();
  });

  it("rejects non-integer message_index", () => {
    expect(() =>
      chatMessageItemSchema.parse({ ...validChatMessageItem, message_index: "abc" }),
    ).toThrow();
  });

  it("rejects missing chat_uuid", () => {
    const { chat_uuid, ...rest } = validChatMessageItem;
    expect(() => chatMessageItemSchema.parse(rest)).toThrow();
  });

  it("rejects missing message", () => {
    const { message, ...rest } = validChatMessageItem;
    expect(() => chatMessageItemSchema.parse(rest)).toThrow();
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

  it("rejects zero limit", () => {
    expect(() =>
      listChatsResultSchema.parse({
        chats: [],
        total: 0,
        page: 1,
        limit: 0,
        totalPages: 0,
      }),
    ).toThrow();
  });

  it("rejects zero page", () => {
    expect(() =>
      listChatsResultSchema.parse({
        chats: [],
        total: 0,
        page: 0,
        limit: 20,
        totalPages: 0,
      }),
    ).toThrow();
  });

  it("rejects missing chats array", () => {
    expect(() =>
      listChatsResultSchema.parse({
        total: 0,
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

  it("rejects negative total", () => {
    expect(() =>
      listChatMessagesResultSchema.parse({
        messages: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
      }),
    ).toThrow();
  });

  it("rejects missing messages array", () => {
    expect(() =>
      listChatMessagesResultSchema.parse({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

describe("ChatListItem type shape", () => {
  it("defines expected fields", () => {
    const mock: ChatListItem = {
      chat_uuid: "uuid-1",
      candidate_id: 1,
      company_id: 5,
      store_id: 3,
      staff_id: 10,
      created_at: "2026-06-13T00:00:00Z",
    };
    expect(mock.chat_uuid).toBe("uuid-1");
    expect(mock.candidate_id).toBe(1);
    expect(mock.company_id).toBe(5);
  });
});

describe("ChatMessageItem type shape", () => {
  it("defines expected fields", () => {
    const mock: ChatMessageItem = {
      chat_message_uuid: "msg-1",
      chat_uuid: "chat-1",
      message: "Hello",
      message_index: 1,
      from: "candidate",
      status: true,
      created_at: "2026-06-13T00:00:00Z",
    };
    expect(mock.message).toBe("Hello");
    expect(mock.from).toBe("candidate");
    expect(mock.status).toBe(true);
  });
});

describe("ListChatsResult type shape", () => {
  it("defines expected fields", () => {
    const mock: ListChatsResult = {
      chats: [validChatListItem],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(mock.chats).toHaveLength(1);
    expect(mock.total).toBe(1);
    expect(mock.totalPages).toBe(1);
  });
});

describe("ListChatMessagesResult type shape", () => {
  it("defines expected fields", () => {
    const mock: ListChatMessagesResult = {
      messages: [validChatMessageItem],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(mock.messages).toHaveLength(1);
  });
});
