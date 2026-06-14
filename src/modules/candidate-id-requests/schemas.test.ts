import { describe, it, expect } from "vitest";
import {
  candidateIdRequestItemSchema,
  listIdRequestsResultSchema,
  idRequestMutationResultSchema,
  listIdRequestsSchema,
  getIdRequestSchema,
  regenerateIdRequestSchema,
  deleteIdRequestSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// candidateIdRequestItemSchema
// ---------------------------------------------------------------------------
describe("candidateIdRequestItemSchema", () => {
  const valid = {
    cir_uuid: "uuid-1234",
    candidate_ids: "1001,1002",
    status: "pending",
    rejection_reason: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: null,
    created_by: 42,
    updated_by: null,
  };

  it("accepts a valid candidate ID request item", () => {
    expect(candidateIdRequestItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable candidate_ids", () => {
    expect(
      candidateIdRequestItemSchema.safeParse({ ...valid, candidate_ids: null }).success,
    ).toBe(true);
  });

  it("accepts nullable status", () => {
    expect(
      candidateIdRequestItemSchema.safeParse({ ...valid, status: null }).success,
    ).toBe(true);
  });

  it("accepts nullable rejection_reason", () => {
    expect(
      candidateIdRequestItemSchema.safeParse({ ...valid, rejection_reason: null }).success,
    ).toBe(true);
  });

  it("accepts nullable created_at", () => {
    expect(
      candidateIdRequestItemSchema.safeParse({ ...valid, created_at: null }).success,
    ).toBe(true);
  });

  it("accepts nullable updated_at", () => {
    expect(
      candidateIdRequestItemSchema.safeParse({ ...valid, updated_at: null }).success,
    ).toBe(true);
  });

  it("accepts nullable created_by", () => {
    expect(
      candidateIdRequestItemSchema.safeParse({ ...valid, created_by: null }).success,
    ).toBe(true);
  });

  it("accepts nullable updated_by", () => {
    expect(
      candidateIdRequestItemSchema.safeParse({ ...valid, updated_by: null }).success,
    ).toBe(true);
  });

  it("rejects missing cir_uuid", () => {
    const { cir_uuid: _, ...rest } = valid;
    expect(candidateIdRequestItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing candidate_ids", () => {
    const { candidate_ids: _, ...rest } = valid;
    expect(candidateIdRequestItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing status", () => {
    const { status: _, ...rest } = valid;
    expect(candidateIdRequestItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing created_at", () => {
    const { created_at: _, ...rest } = valid;
    expect(candidateIdRequestItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for cir_uuid", () => {
    expect(
      candidateIdRequestItemSchema.safeParse({ ...valid, cir_uuid: 123 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for created_by", () => {
    expect(
      candidateIdRequestItemSchema.safeParse({ ...valid, created_by: "admin" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for updated_by", () => {
    expect(
      candidateIdRequestItemSchema.safeParse({ ...valid, updated_by: "admin" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listIdRequestsResultSchema
// ---------------------------------------------------------------------------
describe("listIdRequestsResultSchema", () => {
  const valid = {
    requests: [
      {
        cir_uuid: "uuid-1",
        candidate_ids: null,
        status: null,
        rejection_reason: null,
        created_at: null,
        updated_at: null,
        created_by: null,
        updated_by: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listIdRequestsResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty requests array", () => {
    expect(
      listIdRequestsResultSchema.safeParse({ ...valid, requests: [], total: 0, totalPages: 0 })
        .success,
    ).toBe(true);
  });

  it("rejects missing requests", () => {
    const { requests: _, ...rest } = valid;
    expect(listIdRequestsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = valid;
    expect(listIdRequestsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = valid;
    expect(listIdRequestsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for total", () => {
    expect(
      listIdRequestsResultSchema.safeParse({ ...valid, total: "not-a-number" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for page", () => {
    expect(
      listIdRequestsResultSchema.safeParse({ ...valid, page: "first" }).success,
    ).toBe(false);
  });

  it("rejects non-array requests", () => {
    expect(
      listIdRequestsResultSchema.safeParse({ ...valid, requests: "not-an-array" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// idRequestMutationResultSchema
// ---------------------------------------------------------------------------
describe("idRequestMutationResultSchema", () => {
  const valid = {
    operation: "createIdRequest",
    message: "Request created successfully",
  };

  it("accepts a valid mutation result", () => {
    expect(idRequestMutationResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts result without optional message", () => {
    const { message: _, ...rest } = valid;
    expect(idRequestMutationResultSchema.safeParse(rest).success).toBe(true);
  });

  it("rejects missing operation", () => {
    const { operation: _, ...rest } = valid;
    expect(idRequestMutationResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for operation", () => {
    expect(
      idRequestMutationResultSchema.safeParse({ ...valid, operation: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listIdRequestsSchema (input)
// ---------------------------------------------------------------------------
describe("listIdRequestsSchema", () => {
  it("accepts valid params", () => {
    expect(listIdRequestsSchema.safeParse({ page: 1, limit: 20 }).success).toBe(true);
  });

  it("accepts empty object (defaults applied)", () => {
    expect(listIdRequestsSchema.safeParse({}).success).toBe(true);
  });

  it("rejects zero page", () => {
    expect(listIdRequestsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listIdRequestsSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(listIdRequestsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listIdRequestsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getIdRequestSchema (input)
// ---------------------------------------------------------------------------
describe("getIdRequestSchema", () => {
  it("accepts a valid uuid", () => {
    expect(getIdRequestSchema.safeParse({ uuid: "abc-123-def" }).success).toBe(true);
  });

  it("rejects missing uuid", () => {
    expect(getIdRequestSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty string uuid", () => {
    expect(getIdRequestSchema.safeParse({ uuid: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// regenerateIdRequestSchema (input)
// ---------------------------------------------------------------------------
describe("regenerateIdRequestSchema", () => {
  it("accepts a valid uuid", () => {
    expect(regenerateIdRequestSchema.safeParse({ uuid: "abc-123-def" }).success).toBe(true);
  });

  it("rejects missing uuid", () => {
    expect(regenerateIdRequestSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty string uuid", () => {
    expect(regenerateIdRequestSchema.safeParse({ uuid: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteIdRequestSchema (input)
// ---------------------------------------------------------------------------
describe("deleteIdRequestSchema", () => {
  it("accepts a valid uuid", () => {
    expect(deleteIdRequestSchema.safeParse({ uuid: "abc-123-def" }).success).toBe(true);
  });

  it("rejects missing uuid", () => {
    expect(deleteIdRequestSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty string uuid", () => {
    expect(deleteIdRequestSchema.safeParse({ uuid: "" }).success).toBe(false);
  });
});
