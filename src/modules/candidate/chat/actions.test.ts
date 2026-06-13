import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock modules/chat actions
vi.mock("@/modules/chat/actions", () => ({
  listChats: vi.fn(),
  getChatMessages: vi.fn(),
}));

// Mock session
vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn().mockResolvedValue(undefined),
}));

const { listChats: mockListChats, getChatMessages: mockGetChatMessages } =
  vi.mocked(await import("@/modules/chat/actions"));

const {
  listConversations,
  getConversationMessages,
} = await import("./actions");

describe("candidate/chat actions", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset requireCapability to the default resolved mock after any test
    // that may have set it to reject (e.g. "requires candidate.read.own capability")
    const { requireCapability } = await import("@/modules/auth/session");
    vi.mocked(requireCapability).mockResolvedValue(undefined);
  });

  // -----------------------------------------------------------------------
  // listConversations
  // -----------------------------------------------------------------------

  describe("listConversations", () => {
    it("returns paginated results from module with default params", async () => {
      mockListChats.mockResolvedValue({
        chats: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      const result = await listConversations({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
      expect(result.conversations).toEqual([]);
    });

    it("passes filter params to module listChats", async () => {
      mockListChats.mockResolvedValue({
        chats: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      await listConversations({ companyId: 5, storeId: 3, staffId: 10 });

      expect(mockListChats).toHaveBeenCalledWith(
        expect.objectContaining({ companyId: 5, storeId: 3, staffId: 10 }),
      );
    });

    it("maps module {chats} to result {conversations}", async () => {
      const mockChats = [
        {
          chat_uuid: "chat-1",
          candidate_id: 101,
          company_id: 5,
          store_id: 3,
          staff_id: 10,
          created_at: "2024-01-15T10:00:00.000Z",
        },
      ];

      mockListChats.mockResolvedValue({
        chats: mockChats,
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const result = await listConversations({});

      expect(result.conversations).toEqual(mockChats);
      expect(result.total).toBe(1);
    });

    it("returns empty result on invalid params", async () => {
      const result = await listConversations({ limit: -1 } as any);

      expect(result.conversations).toEqual([]);
      expect(result.total).toBe(0);
      expect(mockListChats).not.toHaveBeenCalled();
    });

    it("requires candidate.read.own capability", async () => {
      const { requireCapability } = await import("@/modules/auth/session");
      vi.mocked(requireCapability).mockRejectedValue(new Error("Unauthorized"));

      await expect(listConversations({})).rejects.toThrow("Unauthorized");
    });
  });

  // -----------------------------------------------------------------------
  // getConversationMessages
  // -----------------------------------------------------------------------

  describe("getConversationMessages", () => {
    it("fetches messages for a given chat UUID", async () => {
      mockGetChatMessages.mockResolvedValue({
        messages: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      });

      const result = await getConversationMessages({ chatUuid: "chat-1" });

      expect(result.messages).toEqual([]);
      expect(mockGetChatMessages).toHaveBeenCalledWith(
        expect.objectContaining({ chatUuid: "chat-1" }),
      );
    });

    it("passes pagination params to module", async () => {
      mockGetChatMessages.mockResolvedValue({
        messages: [],
        total: 0,
        page: 1,
        limit: 25,
        totalPages: 0,
      });

      await getConversationMessages({ chatUuid: "chat-1", lastIndex: 10, limit: 25 });

      expect(mockGetChatMessages).toHaveBeenCalledWith(
        expect.objectContaining({ chatUuid: "chat-1", lastIndex: 10, limit: 25 }),
      );
    });

    it("uses default limit of 50", async () => {
      mockGetChatMessages.mockResolvedValue({
        messages: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      });

      const result = await getConversationMessages({ chatUuid: "chat-1" });

      expect(result.limit).toBe(50);
      expect(result.page).toBe(1);
    });

    it("returns message items from module", async () => {
      const mockMessages = [
        {
          chat_message_uuid: "msg-1",
          chat_uuid: "chat-1",
          message: "Hello",
          message_index: 1,
          from: "candidate",
          status: true,
          created_at: "2024-01-15T10:00:00.000Z",
        },
      ];

      mockGetChatMessages.mockResolvedValue({
        messages: mockMessages,
        total: 1,
        page: 1,
        limit: 50,
        totalPages: 1,
      });

      const result = await getConversationMessages({ chatUuid: "chat-1" });

      expect(result.messages).toEqual(mockMessages);
      expect(result.messages[0].message).toBe("Hello");
    });

    it("returns empty result on missing chat UUID", async () => {
      const result = await getConversationMessages({} as any);

      expect(result.messages).toEqual([]);
      expect(mockGetChatMessages).not.toHaveBeenCalled();
    });

    it("requires candidate.read.own capability", async () => {
      const { requireCapability } = await import("@/modules/auth/session");
      vi.mocked(requireCapability).mockRejectedValue(new Error("Unauthorized"));

      await expect(
        getConversationMessages({ chatUuid: "chat-1" }),
      ).rejects.toThrow("Unauthorized");
    });
  });
});
