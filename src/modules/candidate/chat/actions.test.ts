import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const { mockRequireCapability, mockListChats, mockGetChatMessages } =
  vi.hoisted(() => ({
    mockRequireCapability: vi.fn(),
    mockListChats: vi.fn(),
    mockGetChatMessages: vi.fn(),
  }));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

// ── Mock modules/chat actions ────────────────────────────────
vi.mock("@/modules/chat/actions", () => ({
  listChats: mockListChats,
  getChatMessages: mockGetChatMessages,
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import {
  listConversationsSchema,
  getConversationMessagesSchema,
  listConversationsResultOutputSchema,
  getConversationMessagesResultOutputSchema,
  type ConversationItem,
  type ConversationMessageItem,
  type ListConversationsResult,
  type GetConversationMessagesResult,
} from "@/app/candidate/chat/schemas";
import { listConversations, getConversationMessages } from "./actions";

// ===========================================================================
// Input schema validation
// ===========================================================================

describe("listConversationsSchema", () => {
  it("accepts empty params (defaults)", () => {
    const r = listConversationsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const r = listConversationsSchema.safeParse({ page: 2, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });

  it("coerces string values for page and limit", () => {
    const r = listConversationsSchema.safeParse({ page: "3", limit: "25" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(3);
      expect(r.data.limit).toBe(25);
    }
  });

  it("accepts optional filters", () => {
    const r = listConversationsSchema.safeParse({
      companyId: 1,
      storeId: 5,
      staffId: 10,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyId).toBe(1);
      expect(r.data.storeId).toBe(5);
      expect(r.data.staffId).toBe(10);
    }
  });

  it("rejects negative page", () => {
    const r = listConversationsSchema.safeParse({ page: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects page of 0", () => {
    const r = listConversationsSchema.safeParse({ page: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const r = listConversationsSchema.safeParse({ limit: 999 });
    expect(r.success).toBe(false);
  });

  it("rejects limit below 1", () => {
    const r = listConversationsSchema.safeParse({ limit: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects non-numeric strings for page", () => {
    const r = listConversationsSchema.safeParse({ page: "abc" });
    expect(r.success).toBe(false);
  });
});

describe("getConversationMessagesSchema", () => {
  it("requires chatUuid", () => {
    const r = getConversationMessagesSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("accepts chatUuid with defaults", () => {
    const r = getConversationMessagesSchema.safeParse({
      chatUuid: "chat-abc-123",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.chatUuid).toBe("chat-abc-123");
      expect(r.data.limit).toBe(50);
    }
  });

  it("accepts lastIndex for cursor pagination", () => {
    const r = getConversationMessagesSchema.safeParse({
      chatUuid: "chat-xyz",
      lastIndex: 10,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.lastIndex).toBe(10);
    }
  });

  it("coerces string lastIndex", () => {
    const r = getConversationMessagesSchema.safeParse({
      chatUuid: "chat-xyz",
      lastIndex: "15",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.lastIndex).toBe(15);
    }
  });

  it("rejects empty chatUuid", () => {
    const r = getConversationMessagesSchema.safeParse({ chatUuid: "" });
    expect(r.success).toBe(false);
  });

  it("rejects negative lastIndex", () => {
    const r = getConversationMessagesSchema.safeParse({
      chatUuid: "chat-xyz",
      lastIndex: -1,
    });
    expect(r.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const r = getConversationMessagesSchema.safeParse({
      chatUuid: "chat-xyz",
      limit: 999,
    });
    expect(r.success).toBe(false);
  });
});

// ===========================================================================
// Output schema validation — type shapes
// ===========================================================================

describe("listConversationsResultOutputSchema", () => {
  const validResult: ListConversationsResult = {
    conversations: [
      {
        chat_uuid: "chat-1",
        candidate_id: 42,
        company_id: 1,
        store_id: 5,
        staff_id: 10,
        created_at: "2026-01-15T10:00:00Z",
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts valid result", () => {
    const r = listConversationsResultOutputSchema.safeParse(validResult);
    expect(r.success).toBe(true);
  });

  it("accepts empty conversations array", () => {
    const r = listConversationsResultOutputSchema.safeParse({
      conversations: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("accepts nullable staff_id", () => {
    const r = listConversationsResultOutputSchema.safeParse({
      ...validResult,
      conversations: [
        { ...validResult.conversations[0], staff_id: null },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing conversations field", () => {
    const { conversations, ...rest } = validResult;
    const r = listConversationsResultOutputSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects negative total", () => {
    const r = listConversationsResultOutputSchema.safeParse({
      ...validResult,
      total: -1,
    });
    expect(r.success).toBe(false);
  });
});

describe("getConversationMessagesResultOutputSchema", () => {
  const validResult: GetConversationMessagesResult = {
    messages: [
      {
        chat_message_uuid: "msg-1",
        chat_uuid: "chat-1",
        message: "Hello!",
        message_index: 1,
        from: "candidate",
        status: true,
        created_at: "2026-01-15T10:00:00Z",
      },
    ],
    total: 1,
    page: 1,
    limit: 50,
    totalPages: 1,
  };

  it("accepts valid result", () => {
    const r = getConversationMessagesResultOutputSchema.safeParse(validResult);
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields in messages", () => {
    const r = getConversationMessagesResultOutputSchema.safeParse({
      ...validResult,
      messages: [
        {
          chat_message_uuid: "msg-2",
          chat_uuid: "chat-1",
          message: "How are you?",
          message_index: null,
          from: null,
          status: null,
          created_at: null,
        },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty messages array", () => {
    const r = getConversationMessagesResultOutputSchema.safeParse({
      messages: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing messages field", () => {
    const { messages, ...rest } = validResult;
    const r = getConversationMessagesResultOutputSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });
});

// ===========================================================================
// Action functions
// ===========================================================================

describe("listConversations", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: requireCapability resolves with a fake session
    mockRequireCapability.mockResolvedValue({ id: "42", role: "candidate" });

    // Default module result
    mockListChats.mockResolvedValue({
      chats: [
        {
          chat_uuid: "chat-1",
          candidate_id: 42,
          company_id: 1,
          store_id: 5,
          staff_id: 10,
          created_at: "2026-01-15T10:00:00Z",
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
  });

  it("checks candidate.read.own capability", async () => {
    await listConversations();
    expect(mockRequireCapability).toHaveBeenCalledWith("candidate.read.own");
  });

  it("delegates to modules/chat listChats with parsed params", async () => {
    await listConversations({ page: 2, limit: 10 });
    expect(mockListChats).toHaveBeenCalledWith({
      page: 2,
      limit: 10,
    });
  });

  it("passes optional filters with defaults to the module", async () => {
    await listConversations({ companyId: 1, storeId: 5, staffId: 10 });
    expect(mockListChats).toHaveBeenCalledWith({
      companyId: 1,
      storeId: 5,
      staffId: 10,
      page: 1,
      limit: 20,
    });
  });

  it("maps module chats to conversations in result", async () => {
    const result = await listConversations();
    expect(result.conversations).toHaveLength(1);
    expect(result.conversations[0].chat_uuid).toBe("chat-1");
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(1);
  });

  it("returns empty result on invalid input (zod failure)", async () => {
    const result = await listConversations({ page: -1 });
    expect(result).toEqual({
      conversations: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(mockListChats).not.toHaveBeenCalled();
  });

  it("handles empty results from module", async () => {
    mockListChats.mockResolvedValue({
      chats: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    });
    const result = await listConversations();
    expect(result.conversations).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("handles multiple conversations", async () => {
    mockListChats.mockResolvedValue({
      chats: [
        {
          chat_uuid: "chat-1",
          candidate_id: 42,
          company_id: 1,
          store_id: 5,
          staff_id: 10,
          created_at: "2026-01-15T10:00:00Z",
        },
        {
          chat_uuid: "chat-2",
          candidate_id: 42,
          company_id: 1,
          store_id: 3,
          staff_id: null,
          created_at: "2026-01-16T12:00:00Z",
        },
      ],
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    const result = await listConversations();
    expect(result.conversations).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it("does not throw when output validation fails (just logs error)", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockListChats.mockResolvedValue({
      chats: [{ chat_uuid: "chat-1" }], // Missing required fields
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    // Should not throw — output validation errors are logged, not thrown
    await expect(listConversations()).resolves.toBeDefined();
  });
});

describe("getConversationMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue({ id: "42", role: "candidate" });

    mockGetChatMessages.mockResolvedValue({
      messages: [
        {
          chat_message_uuid: "msg-1",
          chat_uuid: "chat-1",
          message: "Hello!",
          message_index: 1,
          from: "candidate",
          status: true,
          created_at: "2026-01-15T10:00:00Z",
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    });
  });

  it("checks candidate.read.own capability", async () => {
    await getConversationMessages({ chatUuid: "chat-1" });
    expect(mockRequireCapability).toHaveBeenCalledWith("candidate.read.own");
  });

  it("delegates to modules/chat getChatMessages with parsed params", async () => {
    await getConversationMessages({ chatUuid: "chat-1", lastIndex: 10, limit: 25 });
    expect(mockGetChatMessages).toHaveBeenCalledWith({
      chatUuid: "chat-1",
      lastIndex: 10,
      limit: 25,
    });
  });

  it("passes through messages in result", async () => {
    const result = await getConversationMessages({ chatUuid: "chat-1" });
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].message).toBe("Hello!");
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(50);
    expect(result.totalPages).toBe(1);
  });

  it("returns empty result on invalid input (missing chatUuid)", async () => {
    const result = await getConversationMessages({} as any);
    expect(result).toEqual({
      messages: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    });
    expect(mockGetChatMessages).not.toHaveBeenCalled();
  });

  it("handles empty messages from module", async () => {
    mockGetChatMessages.mockResolvedValue({
      messages: [],
      total: 0,
      page: 0,
      limit: 50,
      totalPages: 0,
    });
    const result = await getConversationMessages({ chatUuid: "chat-1" });
    expect(result.messages).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("handles cursor pagination with lastIndex", async () => {
    await getConversationMessages({ chatUuid: "chat-1", lastIndex: 20, limit: 10 });
    expect(mockGetChatMessages).toHaveBeenCalledWith({
      chatUuid: "chat-1",
      lastIndex: 20,
      limit: 10,
    });
  });

  it("uses default limit of 50 when not provided", async () => {
    await getConversationMessages({ chatUuid: "chat-1" });
    expect(mockGetChatMessages).toHaveBeenCalledWith({
      chatUuid: "chat-1",
      limit: 50,
    });
  });
});
