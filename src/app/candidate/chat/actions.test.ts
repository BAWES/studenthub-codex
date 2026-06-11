import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — delegate to module actions (these now contain the real logic)
// ---------------------------------------------------------------------------

const mockModuleListChats = vi.fn();
const mockModuleGetChatMessages = vi.fn();

vi.mock("@/modules/chat/actions", () => ({
  listChats: mockModuleListChats,
  getChatMessages: mockModuleGetChatMessages,
}));

vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn().mockResolvedValue(undefined),
}));

// Must import after mocks are set up
const { listConversations, getConversationMessages } = await import("./actions");
const { listConversationsSchema, getConversationMessagesSchema } = await import("./schemas");

// ---------------------------------------------------------------------------
// Schema tests (pure — no mock dependency)
// ---------------------------------------------------------------------------

describe("listConversationsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listConversationsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const result = listConversationsSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("accepts optional filters (companyId, storeId, staffId)", () => {
    const result = listConversationsSchema.safeParse({
      companyId: 1,
      storeId: 5,
      staffId: 10,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(1);
      expect(result.data.storeId).toBe(5);
      expect(result.data.staffId).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    const result = listConversationsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listConversationsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Action tests — verify delegation to module
// ---------------------------------------------------------------------------

describe("listConversations (delegation)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to module listChats with pagination params", async () => {
    mockModuleListChats.mockResolvedValue({
      chats: [
        {
          chat_uuid: "chat-1",
          candidate_id: 1,
          company_id: 10,
          store_id: 100,
          staff_id: null,
          created_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });

    const result = await listConversations({ page: 1, limit: 20 });

    expect(mockModuleListChats).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      companyId: undefined,
      storeId: undefined,
      staffId: undefined,
    });
    expect(result.conversations).toHaveLength(1);
    expect(result.conversations[0].chat_uuid).toBe("chat-1");
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("maps module { chats } → app router { conversations }", async () => {
    mockModuleListChats.mockResolvedValue({
      chats: [
        {
          chat_uuid: "chat-2",
          candidate_id: 2,
          company_id: 20,
          store_id: 200,
          staff_id: 5,
          created_at: null,
        },
      ],
      total: 1,
      page: 2,
      limit: 10,
      totalPages: 1,
    });

    const result = await listConversations({ page: 2, limit: 10 });

    expect(result.conversations[0].staff_id).toBe(5);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
  });

  it("filters by companyId/storeId/staffId when provided", async () => {
    mockModuleListChats.mockResolvedValue({ chats: [], total: 0, page: 1, limit: 20, totalPages: 0 });

    await listConversations({ companyId: 5, storeId: 10, staffId: 15 });

    expect(mockModuleListChats).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      companyId: 5,
      storeId: 10,
      staffId: 15,
    });
  });

  it("returns empty list when module returns empty", async () => {
    mockModuleListChats.mockResolvedValue({ chats: [], total: 0, page: 1, limit: 20, totalPages: 0 });

    const result = await listConversations({});

    expect(result.conversations).toEqual([]);
    expect(result.total).toBe(0);
  });
});

describe("getConversationMessages (delegation)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to module getChatMessages with chatUuid", async () => {
    mockModuleGetChatMessages.mockResolvedValue({
      messages: [
        {
          chat_message_uuid: "msg-1",
          chat_uuid: "chat-1",
          message: "Hello",
          message_index: 1,
          from: "candidate",
          status: true,
          created_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    });

    const result = await getConversationMessages({ chatUuid: "chat-1" });

    expect(mockModuleGetChatMessages).toHaveBeenCalledWith({
      chatUuid: "chat-1",
      lastIndex: undefined,
      limit: 50,
    });
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].message).toBe("Hello");
  });

  it("passes lastIndex when provided", async () => {
    mockModuleGetChatMessages.mockResolvedValue({ messages: [], total: 0, page: 1, limit: 30, totalPages: 0 });

    await getConversationMessages({ chatUuid: "chat-1", lastIndex: 50, limit: 30 });

    expect(mockModuleGetChatMessages).toHaveBeenCalledWith({
      chatUuid: "chat-1",
      lastIndex: 50,
      limit: 30,
    });
  });

  it("returns empty messages when module returns empty", async () => {
    mockModuleGetChatMessages.mockResolvedValue({ messages: [], total: 0, page: 1, limit: 50, totalPages: 0 });

    const result = await getConversationMessages({ chatUuid: "nonexistent" });

    expect(result.messages).toEqual([]);
    expect(result.total).toBe(0);
  });
});
