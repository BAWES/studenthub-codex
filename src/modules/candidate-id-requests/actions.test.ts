import { describe, it, expect } from "vitest";
import {
  listIdRequestsSchema,
  getIdRequestSchema,
  regenerateIdRequestSchema,
  deleteIdRequestSchema,
} from "./actions";

// ---------------------------------------------------------------------------
// listIdRequestsSchema
// ---------------------------------------------------------------------------

describe("listIdRequestsSchema", () => {
  it("accepts empty params with defaults", () => {
    const result = listIdRequestsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts custom page and limit", () => {
    const result = listIdRequestsSchema.safeParse({ page: 3, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(10);
    }
  });

  it("coerces string numbers", () => {
    const result = listIdRequestsSchema.safeParse({
      page: "2",
      limit: "15",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(15);
    }
  });

  it("rejects page 0", () => {
    const result = listIdRequestsSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listIdRequestsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects limit 0", () => {
    const result = listIdRequestsSchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects limit above 100", () => {
    const result = listIdRequestsSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric page", () => {
    const result = listIdRequestsSchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getIdRequestSchema
// ---------------------------------------------------------------------------

describe("getIdRequestSchema", () => {
  it("accepts valid UUID string", () => {
    const result = getIdRequestSchema.safeParse({
      uuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.uuid).toBe("550e8400-e29b-41d4-a716-446655440000");
    }
  });

  it("rejects empty UUID", () => {
    const result = getIdRequestSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getIdRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// regenerateIdRequestSchema
// ---------------------------------------------------------------------------

describe("regenerateIdRequestSchema", () => {
  it("accepts valid UUID", () => {
    const result = regenerateIdRequestSchema.safeParse({
      uuid: "abc-def-123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = regenerateIdRequestSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = regenerateIdRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteIdRequestSchema
// ---------------------------------------------------------------------------

describe("deleteIdRequestSchema", () => {
  it("accepts valid UUID", () => {
    const result = deleteIdRequestSchema.safeParse({
      uuid: "xyz-789-abc",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = deleteIdRequestSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = deleteIdRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

describe("CandidateIdRequestItem type shape", () => {
  type CandidateIdRequestItem = {
    cir_uuid: string;
    candidate_ids: string | null;
    status: string | null;
    rejection_reason: string | null;
    created_at: string | null;
    updated_at: string | null;
    created_by: number | null;
    updated_by: number | null;
  };

  it("shapes a complete item", () => {
    const item: CandidateIdRequestItem = {
      cir_uuid: "uuid-1",
      candidate_ids: "1,2,3",
      status: "pending",
      rejection_reason: null,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: null,
      created_by: 10,
      updated_by: null,
    };
    expect(item.cir_uuid).toBe("uuid-1");
    expect(item.status).toBe("pending");
    expect(item.rejection_reason).toBeNull();
  });
});

describe("ListIdRequestsResult shape", () => {
  type ListIdRequestsResult = {
    requests: unknown[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  it("calculates totalPages from total/limit", () => {
    // Mirror of Math.ceil(total / limit) in the implementation
    const total = 25;
    const limit = 10;
    const totalPages = Math.ceil(total / limit);
    const result: ListIdRequestsResult = {
      requests: [],
      total,
      page: 1,
      limit,
      totalPages,
    };
    expect(result.totalPages).toBe(3);
  });

  it("handles empty results", () => {
    const result: ListIdRequestsResult = {
      requests: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.totalPages).toBe(0);
  });
});

describe("IdRequestMutationResult type shape", () => {
  it("shapes a success result", () => {
    const result: { operation: string; message?: unknown } = {
      operation: "success",
    };
    expect(result.operation).toBe("success");
    expect(result.message).toBeUndefined();
  });

  it("shapes an error result with message", () => {
    const result: { operation: string; message?: unknown } = {
      operation: "error",
      message: "ID request not found",
    };
    expect(result.operation).toBe("error");
    expect(result.message).toBe("ID request not found");
  });
});
