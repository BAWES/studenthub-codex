import { describe, it, expect } from "vitest";
import {
  candidateIdRequestItemSchema,
  listIdRequestsResultSchema,
  idRequestMutationResultSchema,
} from "./schemas";
import {
  listIdRequestsSchema,
  getIdRequestSchema,
  regenerateIdRequestSchema,
  deleteIdRequestSchema,
} from "./schemas";

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
// Output schema tests
// ---------------------------------------------------------------------------

describe("candidateIdRequestItemSchema", () => {
  it("parses a complete item", () => {
    const result = candidateIdRequestItemSchema.safeParse({
      cir_uuid: "uuid-1",
      candidate_ids: "1,2,3",
      status: "pending",
      rejection_reason: null,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: null,
      created_by: 10,
      updated_by: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cir_uuid).toBe("uuid-1");
      expect(result.data.status).toBe("pending");
    }
  });

  it("accepts all-null optionals", () => {
    const result = candidateIdRequestItemSchema.safeParse({
      cir_uuid: "uuid-2",
      candidate_ids: null,
      status: null,
      rejection_reason: null,
      created_at: null,
      updated_at: null,
      created_by: null,
      updated_by: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing cir_uuid", () => {
    const result = candidateIdRequestItemSchema.safeParse({
      updated_at: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects wrong type for created_at (Date instead of string)", () => {
    const result = candidateIdRequestItemSchema.safeParse({
      cir_uuid: "uuid-1",
      candidate_ids: null,
      status: null,
      rejection_reason: null,
      created_at: new Date(),
      updated_at: null,
      created_by: null,
      updated_by: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("listIdRequestsResultSchema", () => {
  it("calculates totalPages from total/limit", () => {
    const result = listIdRequestsResultSchema.safeParse({
      requests: [],
      total: 25,
      page: 1,
      limit: 10,
      totalPages: 3,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.totalPages).toBe(3);
    }
  });

  it("handles empty results", () => {
    const result = listIdRequestsResultSchema.safeParse({
      requests: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing total", () => {
    const result = listIdRequestsResultSchema.safeParse({
      requests: [],
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("idRequestMutationResultSchema", () => {
  it("parses success result without message", () => {
    const result = idRequestMutationResultSchema.safeParse({
      operation: "success",
    });
    expect(result.success).toBe(true);
  });

  it("parses error result with message", () => {
    const result = idRequestMutationResultSchema.safeParse({
      operation: "error",
      message: "ID request not found",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing operation", () => {
    const result = idRequestMutationResultSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-string operation", () => {
    const result = idRequestMutationResultSchema.safeParse({ operation: 42 });
    expect(result.success).toBe(false);
  });
});
