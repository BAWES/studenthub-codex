import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema tests
// ---------------------------------------------------------------------------

const listChatsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  companyId: z.number().int().optional(),
  storeId: z.number().int().optional(),
  staffId: z.number().int().optional(),
});

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

const listChatMessagesSchema = z.object({
  chatUuid: z.string().min(1, "Chat UUID is required"),
  lastIndex: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

describe("listChatMessagesSchema", () => {
  it("accepts only chatUuid", () => {
    const r = listChatMessagesSchema.safeParse({ chatUuid: "chat_abc" });
    expect(r.success).toBe(true);
  });

  it("accepts lastIndex pagination", () => {
    const r = listChatMessagesSchema.safeParse({ chatUuid: "chat_abc", lastIndex: 50 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.lastIndex).toBe(50);
    }
  });

  it("rejects empty chatUuid", () => {
    expect(listChatMessagesSchema.safeParse({ chatUuid: "" }).success).toBe(false);
  });

  it("rejects missing chatUuid", () => {
    expect(listChatMessagesSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

type ChatItem = {
  chat_uuid: string;
  company_id: number;
  store_id: number;
  staff_id: number | null;
  created_at: string | null;
};

type ChatMessageItem = {
  chat_message_uuid: string;
  chat_uuid: string;
  from: string | null;
  message: string;
  message_index: number | null;
  status: boolean | null;
  created_at: string | null;
};

type ListChatsResult = {
  chats: ChatItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type ListChatMessagesResult = {
  messages: ChatMessageItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

describe("ChatItem shape", () => {
  it("defines expected fields", () => {
    const mock: ChatItem = {
      chat_uuid: "chat_abc123",
      company_id: 1,
      store_id: 3,
      staff_id: 5,
      created_at: "2026-06-09T00:00:00.000Z",
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
      created_at: "2026-06-09T00:00:00.000Z",
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
