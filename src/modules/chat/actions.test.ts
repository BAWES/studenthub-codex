import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// listChats schema validation
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
    const r = listChatsSchema.safeParse({ companyId: 5, storeId: 10, staffId: 3 });
    expect(r.success).toBe(true);
  });

  it("rejects limit over 100", () => {
    expect(listChatsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listChatsSchema.safeParse({ page: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getChatMessages schema validation
// ---------------------------------------------------------------------------

const getChatMessagesSchema = z.object({
  chatUuid: z.string().min(1),
  lastIndex: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

describe("getChatMessagesSchema", () => {
  it("accepts chatUuid only", () => {
    const r = getChatMessagesSchema.safeParse({ chatUuid: "chat_abc123" });
    expect(r.success).toBe(true);
  });

  it("accepts chatUuid with lastIndex", () => {
    const r = getChatMessagesSchema.safeParse({ chatUuid: "chat_abc123", lastIndex: 10, limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.lastIndex).toBe(10);
    }
  });

  it("rejects empty chatUuid", () => {
    expect(getChatMessagesSchema.safeParse({ chatUuid: "" }).success).toBe(false);
  });

  it("rejects missing chatUuid", () => {
    expect(getChatMessagesSchema.safeParse({}).success).toBe(false);
  });

  it("rejects negative lastIndex", () => {
    expect(getChatMessagesSchema.safeParse({ chatUuid: "chat_abc123", lastIndex: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shapes
// ---------------------------------------------------------------------------

type ChatListItem = {
  chat_uuid: string;
  candidate_id: number;
  company_id: number;
  store_id: number;
  staff_id: number | null;
  created_at: string | null;
};

type ChatMessageItem = {
  chat_message_uuid: string;
  chat_uuid: string;
  message: string;
  message_index: number | null;
  status: boolean | null;
  from: string | null;
  created_at: string | null;
};

type ListChatsResult = {
  chats: ChatListItem[];
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

describe("ChatListItem shape", () => {
  it("defines expected fields", () => {
    const mock: ChatListItem = {
      chat_uuid: "chat_abc123",
      candidate_id: 42,
      company_id: 1,
      store_id: 5,
      staff_id: 7,
      created_at: "2026-06-09T00:00:00Z",
    };
    expect(mock.chat_uuid).toBe("chat_abc123");
    expect(mock.candidate_id).toBe(42);
  });
});

describe("ChatMessageItem shape", () => {
  it("defines expected fields", () => {
    const mock: ChatMessageItem = {
      chat_message_uuid: "msg_abc123",
      chat_uuid: "chat_abc123",
      message: "Hello, I am interested in the position",
      message_index: 1,
      status: true,
      from: "candidate",
      created_at: "2026-06-09T00:00:00Z",
    };
    expect(mock.chat_message_uuid).toBe("msg_abc123");
    expect(mock.message).toBe("Hello, I am interested in the position");
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
