import { describe, it, expect } from "vitest";
import {
  listConversationsSchema,
  getConversationMessagesSchema,
  conversationItemOutputSchema,
  conversationMessageItemOutputSchema,
  listConversationsResultOutputSchema,
  getConversationMessagesResultOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests — candidate/chat
// ---------------------------------------------------------------------------

describe("listConversationsSchema", () => {
  it("accepts valid pagination input", () => {
    const r = listConversationsSchema.safeParse({ page: 1, limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("defaults page and limit", () => {
    const r = listConversationsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("rejects page < 1", () => {
    expect(listConversationsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects limit > 100", () => {
    expect(listConversationsSchema.safeParse({ limit: 200 }).success).toBe(
      false,
    );
  });

  it("coerces string page and limit", () => {
    const r = listConversationsSchema.safeParse({ page: "2", limit: "10" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });

  it("accepts optional companyId, storeId, staffId filters", () => {
    const r = listConversationsSchema.safeParse({
      companyId: 1,
      storeId: 2,
      staffId: 3,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyId).toBe(1);
      expect(r.data.storeId).toBe(2);
      expect(r.data.staffId).toBe(3);
    }
  });
});

describe("getConversationMessagesSchema", () => {
  it("accepts valid input with chat UUID", () => {
    const r = getConversationMessagesSchema.safeParse({
      chatUuid: "abc-123",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.chatUuid).toBe("abc-123");
      expect(r.data.limit).toBe(50);
    }
  });

  it("accepts optional lastIndex and custom limit", () => {
    const r = getConversationMessagesSchema.safeParse({
      chatUuid: "abc-123",
      lastIndex: 10,
      limit: 25,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.lastIndex).toBe(10);
      expect(r.data.limit).toBe(25);
    }
  });

  it("rejects missing chatUuid", () => {
    expect(getConversationMessagesSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty chatUuid", () => {
    expect(
      getConversationMessagesSchema.safeParse({ chatUuid: "" }).success,
    ).toBe(false);
  });

  it("rejects limit > 100", () => {
    expect(
      getConversationMessagesSchema.safeParse({
        chatUuid: "abc",
        limit: 200,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("conversationItemOutputSchema", () => {
  const validItem = {
    chat_uuid: "abc-123",
    candidate_id: 1,
    company_id: 2,
    store_id: 3,
    staff_id: null,
    created_at: null,
  };

  it("accepts valid conversation item", () => {
    expect(conversationItemOutputSchema.safeParse(validItem).success).toBe(
      true,
    );
  });

  it("rejects missing chat_uuid", () => {
    const { chat_uuid: _, ...rest } = validItem;
    expect(conversationItemOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for candidate_id", () => {
    expect(
      conversationItemOutputSchema.safeParse({
        ...validItem,
        candidate_id: "abc",
      }).success,
    ).toBe(false);
  });
});

describe("conversationMessageItemOutputSchema", () => {
  const validItem = {
    chat_message_uuid: "msg-123",
    chat_uuid: "chat-123",
    message: "Hello!",
    message_index: null,
    from: null,
    status: null,
    created_at: null,
  };

  it("accepts valid message item", () => {
    expect(
      conversationMessageItemOutputSchema.safeParse(validItem).success,
    ).toBe(true);
  });

  it("rejects missing message", () => {
    const { message: _, ...rest } = validItem;
    expect(conversationMessageItemOutputSchema.safeParse(rest).success).toBe(
      false,
    );
  });
});

describe("listConversationsResultOutputSchema", () => {
  const validResult = {
    conversations: [
      {
        chat_uuid: "abc-123",
        candidate_id: 1,
        company_id: 2,
        store_id: 3,
        staff_id: null,
        created_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts valid result", () => {
    expect(
      listConversationsResultOutputSchema.safeParse(validResult).success,
    ).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listConversationsResultOutputSchema.safeParse({
        ...validResult,
        total: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects missing conversations", () => {
    const { conversations: _, ...rest } = validResult;
    expect(
      listConversationsResultOutputSchema.safeParse(rest).success,
    ).toBe(false);
  });
});

describe("getConversationMessagesResultOutputSchema", () => {
  const validResult = {
    messages: [
      {
        chat_message_uuid: "msg-1",
        chat_uuid: "chat-1",
        message: "Hi",
        message_index: null,
        from: null,
        status: null,
        created_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 50,
    totalPages: 1,
  };

  it("accepts valid result", () => {
    expect(
      getConversationMessagesResultOutputSchema.safeParse(validResult).success,
    ).toBe(true);
  });
});
