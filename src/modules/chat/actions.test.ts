import { describe, it, expect } from "vitest";
import {
  listChatsSchema,
  getChatMessagesSchema,
  chatListItemSchema,
  chatMessageItemSchema,
  listChatsResultSchema,
  listChatMessagesResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests
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
// Output schema tests — chatListItemSchema
// ---------------------------------------------------------------------------

describe("chatListItemSchema", () => {
  it("accepts a valid chat list item", () => {
    const r = chatListItemSchema.safeParse({
      chat_uuid: "chat_abc123",
      candidate_id: 1,
      company_id: 2,
      store_id: 3,
      staff_id: 5,
      created_at: new Date("2026-06-09T00:00:00.000Z"),
    });
    expect(r.success).toBe(true);
  });

  it("accepts nullable staff_id and created_at", () => {
    const r = chatListItemSchema.safeParse({
      chat_uuid: "chat_def456",
      candidate_id: 2,
      company_id: 3,
      store_id: 4,
      staff_id: null,
      created_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    expect(chatListItemSchema.safeParse({ chat_uuid: "chat_abc" }).success).toBe(false);
  });

  it("rejects string where number expected", () => {
    const r = chatListItemSchema.safeParse({
      chat_uuid: "chat_abc",
      candidate_id: "not-a-number",
      company_id: 2,
      store_id: 3,
      staff_id: null,
      created_at: null,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — chatMessageItemSchema
// ---------------------------------------------------------------------------

describe("chatMessageItemSchema", () => {
  it("accepts a valid chat message item", () => {
    const r = chatMessageItemSchema.safeParse({
      chat_message_uuid: "msg_abc123",
      chat_uuid: "chat_abc123",
      message: "Hello, I have a question",
      message_index: 1,
      from: "candidate",
      status: false,
      created_at: new Date("2026-06-09T00:00:00.000Z"),
    });
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields", () => {
    const r = chatMessageItemSchema.safeParse({
      chat_message_uuid: "msg_def456",
      chat_uuid: "chat_abc123",
      message: "Test message",
      message_index: null,
      from: null,
      status: null,
      created_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing chat_uuid", () => {
    const r = chatMessageItemSchema.safeParse({
      chat_message_uuid: "msg_abc",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — listChatsResultSchema
// ---------------------------------------------------------------------------

describe("listChatsResultSchema", () => {
  it("accepts a valid empty result", () => {
    const r = listChatsResultSchema.safeParse({
      chats: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("accepts a result with items", () => {
    const r = listChatsResultSchema.safeParse({
      chats: [
        {
          chat_uuid: "chat_abc",
          candidate_id: 1,
          company_id: 2,
          store_id: 3,
          staff_id: null,
          created_at: new Date(),
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("rejects non-integer total", () => {
    const r = listChatsResultSchema.safeParse({
      chats: [],
      total: 0.5,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — listChatMessagesResultSchema
// ---------------------------------------------------------------------------

describe("listChatMessagesResultSchema", () => {
  it("accepts a valid empty result", () => {
    const r = listChatMessagesResultSchema.safeParse({
      messages: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative page", () => {
    const r = listChatMessagesResultSchema.safeParse({
      messages: [],
      total: 0,
      page: -1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests (using Zod-inferred types)
// ---------------------------------------------------------------------------

import type {
  ChatListItem,
  ChatMessageItem,
  ListChatsResult,
  ListChatMessagesResult,
} from "./schemas";

describe("ChatListItem shape", () => {
  it("defines expected fields", () => {
    const mock: ChatListItem = {
      chat_uuid: "chat_abc123",
      candidate_id: 1,
      company_id: 1,
      store_id: 3,
      staff_id: 5,
      created_at: new Date("2026-06-09T00:00:00.000Z"),
    };
    expect(mock.chat_uuid).toBe("chat_abc123");
  });
});

describe("ChatMessageItem shape", () => {
  it("defines expected fields", () => {
    const mock: ChatMessageItem = {
      chat_message_uuid: "msg_abc123",
      chat_uuid: "chat_abc123",
      from: "candidate",
      message: "Hello, I have a question",
      message_index: 1,
      status: false,
      created_at: new Date("2026-06-09T00:00:00.000Z"),
    };
    expect(mock.message).toBe("Hello, I have a question");
  });
});

describe("ListChatsResult shape", () => {
  it("accepts empty result", () => {
    const r: ListChatsResult = { chats: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    expect(r.total).toBe(0);
  });
});

describe("ListChatMessagesResult shape", () => {
  it("accepts empty result", () => {
    const r: ListChatMessagesResult = { messages: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    expect(r.total).toBe(0);
  });
});
