import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: chat list schema validation
// ---------------------------------------------------------------------------

const listChatsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  companyId: z.number().int().positive().optional(),
  storeId: z.number().int().positive().optional(),
  staffId: z.number().int().positive().optional(),
});

const getChatSchema = z.object({
  chatUuid: z.string().min(1, "Chat UUID is required"),
});

describe("listChatsSchema", () => {
  it("accepts empty params", () => {
    const result = listChatsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listChatsSchema.safeParse({ page: 1, limit: 20 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts optional filters", () => {
    const result = listChatsSchema.safeParse({ companyId: 1, storeId: 5, staffId: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(1);
      expect(result.data.storeId).toBe(5);
      expect(result.data.staffId).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    const result = listChatsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listChatsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });
});

describe("getChatSchema", () => {
  it("accepts a valid UUID", () => {
    const result = getChatSchema.safeParse({ chatUuid: "abc-123-def" });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = getChatSchema.safeParse({ chatUuid: "" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Return type shapes
// ---------------------------------------------------------------------------

type ChatListItem = {
  chat_uuid: string;
  candidate_id: number;
  company_id: number;
  store_id: number;
  staff_id: number | null;
  created_at: Date | null;
  updated_at: Date | null;
};

type ListChatsResult = {
  chats: ChatListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type ChatDetail = ChatListItem & {
  contact_uuid: string | null;
  parent_company_id: number | null;
};

type GetChatResult = {
  chat: ChatDetail;
};

describe("ChatListItem shape", () => {
  it("defines the expected fields", () => {
    const mock: ChatListItem = {
      chat_uuid: "abc-123",
      candidate_id: 100,
      company_id: 1,
      store_id: 5,
      staff_id: null,
      created_at: new Date(),
      updated_at: null,
    };
    expect(mock.chat_uuid).toBe("abc-123");
    expect(mock.candidate_id).toBe(100);
    expect(mock.company_id).toBe(1);
    expect(mock.store_id).toBe(5);
    expect(mock.staff_id).toBeNull();
  });
});

describe("ListChatsResult shape", () => {
  it("accepts a valid result set", () => {
    const result: ListChatsResult = {
      chats: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.chats).toHaveLength(0);
  });
});

describe("ChatDetail shape", () => {
  it("extends ChatListItem with contact_uuid and parent_company_id", () => {
    const detail: ChatDetail = {
      chat_uuid: "abc-123",
      candidate_id: 100,
      company_id: 1,
      parent_company_id: null,
      store_id: 5,
      staff_id: 10,
      contact_uuid: "contact-456",
      created_at: new Date(),
      updated_at: null,
    };
    expect(detail.contact_uuid).toBe("contact-456");
    expect(detail.staff_id).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// Pure function: build chat query filter (scoped to candidate_id)
// ---------------------------------------------------------------------------

type ChatWhereInput = {
  candidate_id: number;
  company_id?: number;
  store_id?: number;
  staff_id?: number;
};

function buildChatListFilter(
  candidateId: number,
  companyId?: number,
  storeId?: number,
  staffId?: number,
): ChatWhereInput {
  const where: ChatWhereInput = { candidate_id: candidateId };
  if (companyId !== undefined) where.company_id = companyId;
  if (storeId !== undefined) where.store_id = storeId;
  if (staffId !== undefined) where.staff_id = staffId;
  return where;
}

describe("buildChatListFilter", () => {
  it("scopes to candidate_id", () => {
    const result = buildChatListFilter(100);
    expect(result).toEqual({ candidate_id: 100 });
  });

  it("adds company_id filter", () => {
    const result = buildChatListFilter(100, 1);
    expect(result).toEqual({ candidate_id: 100, company_id: 1 });
  });

  it("adds store_id filter", () => {
    const result = buildChatListFilter(100, undefined, 5);
    expect(result).toEqual({ candidate_id: 100, store_id: 5 });
  });

  it("adds staff_id filter", () => {
    const result = buildChatListFilter(100, undefined, undefined, 10);
    expect(result).toEqual({ candidate_id: 100, staff_id: 10 });
  });

  it("adds all filters", () => {
    const result = buildChatListFilter(100, 1, 5, 10);
    expect(result).toEqual({ candidate_id: 100, company_id: 1, store_id: 5, staff_id: 10 });
  });
});
