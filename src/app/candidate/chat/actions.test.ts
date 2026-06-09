import { describe, it, expect } from "vitest";
import {
  listConversationsSchema,
  getConversationMessagesSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listConversationsSchema
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

  it("rejects zero page (must be positive)", () => {
    const result = listConversationsSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getConversationMessagesSchema
// ---------------------------------------------------------------------------

describe("getConversationMessagesSchema", () => {
  it("accepts a valid chat UUID and optional pagination", () => {
    const result = getConversationMessagesSchema.safeParse({
      chatUuid: "abc-123-def-456",
      lastIndex: 50,
      limit: 30,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.chatUuid).toBe("abc-123-def-456");
      expect(result.data.lastIndex).toBe(50);
      expect(result.data.limit).toBe(30);
    }
  });

  it("accepts just the required chatUuid", () => {
    const result = getConversationMessagesSchema.safeParse({
      chatUuid: "uuid-here",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.chatUuid).toBe("uuid-here");
      expect(result.data.limit).toBe(50); // default
    }
  });

  it("rejects empty chatUuid", () => {
    const result = getConversationMessagesSchema.safeParse({ chatUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing chatUuid", () => {
    const result = getConversationMessagesSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = getConversationMessagesSchema.safeParse({
      chatUuid: "abc",
      limit: 999,
    });
    expect(result.success).toBe(false);
  });
});
