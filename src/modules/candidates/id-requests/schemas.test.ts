import { describe, it, expect } from "vitest";
import {
  idRequestListItemSchema,
  idRequestDetailSchema,
  listIdRequestsResultSchema,
  createIdRequestResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// idRequestListItemSchema
// ---------------------------------------------------------------------------
describe("idRequestListItemSchema", () => {
  const validItem = {
    cir_uuid: "CIR-001",
    candidate_count: 5,
    status: "pending",
    rejection_reason: null,
    created_at: new Date("2026-06-01T10:00:00Z"),
    updated_at: new Date("2026-06-10T12:00:00Z"),
  };

  it("accepts a valid item", () => {
    expect(idRequestListItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts null status", () => {
    expect(
      idRequestListItemSchema.safeParse({ ...validItem, status: null }).success,
    ).toBe(true);
  });

  it("accepts null rejection_reason", () => {
    expect(
      idRequestListItemSchema.safeParse({ ...validItem, rejection_reason: null }).success,
    ).toBe(true);
  });

  it("accepts a non-null rejection_reason", () => {
    expect(
      idRequestListItemSchema.safeParse({ ...validItem, rejection_reason: "Invalid document" }).success,
    ).toBe(true);
  });

  it("accepts null created_at", () => {
    expect(
      idRequestListItemSchema.safeParse({ ...validItem, created_at: null }).success,
    ).toBe(true);
  });

  it("accepts null updated_at", () => {
    expect(
      idRequestListItemSchema.safeParse({ ...validItem, updated_at: null }).success,
    ).toBe(true);
  });

  it("accepts zero candidate_count", () => {
    expect(
      idRequestListItemSchema.safeParse({ ...validItem, candidate_count: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing cir_uuid", () => {
    const { cir_uuid: _, ...rest } = validItem;
    expect(idRequestListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing candidate_count", () => {
    const { candidate_count: _, ...rest } = validItem;
    expect(idRequestListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for cir_uuid", () => {
    expect(
      idRequestListItemSchema.safeParse({ ...validItem, cir_uuid: 123 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for candidate_count", () => {
    expect(
      idRequestListItemSchema.safeParse({ ...validItem, candidate_count: "5" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for status", () => {
    expect(
      idRequestListItemSchema.safeParse({ ...validItem, status: 123 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for created_at", () => {
    expect(
      idRequestListItemSchema.safeParse({ ...validItem, created_at: "2026-06-01" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for updated_at", () => {
    expect(
      idRequestListItemSchema.safeParse({ ...validItem, updated_at: "2026-06-01" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// idRequestDetailSchema
// ---------------------------------------------------------------------------
describe("idRequestDetailSchema", () => {
  const validDetail = {
    cir_uuid: "CIR-001",
    candidate_ids: "STU-001,STU-002",
    status: "approved",
    rejection_reason: null,
    created_at: new Date("2026-06-01T10:00:00Z"),
    updated_at: new Date("2026-06-10T12:00:00Z"),
    created_by_name: "John Doe",
    updated_by_name: null,
  };

  it("accepts a valid detail", () => {
    expect(idRequestDetailSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts null candidate_ids", () => {
    expect(
      idRequestDetailSchema.safeParse({ ...validDetail, candidate_ids: null }).success,
    ).toBe(true);
  });

  it("accepts null status", () => {
    expect(
      idRequestDetailSchema.safeParse({ ...validDetail, status: null }).success,
    ).toBe(true);
  });

  it("accepts null rejection_reason", () => {
    expect(
      idRequestDetailSchema.safeParse({ ...validDetail, rejection_reason: null }).success,
    ).toBe(true);
  });

  it("accepts a non-null rejection_reason", () => {
    expect(
      idRequestDetailSchema.safeParse({ ...validDetail, rejection_reason: "Expired ID" }).success,
    ).toBe(true);
  });

  it("accepts null created_at", () => {
    expect(
      idRequestDetailSchema.safeParse({ ...validDetail, created_at: null }).success,
    ).toBe(true);
  });

  it("accepts null updated_at", () => {
    expect(
      idRequestDetailSchema.safeParse({ ...validDetail, updated_at: null }).success,
    ).toBe(true);
  });

  it("accepts null created_by_name", () => {
    expect(
      idRequestDetailSchema.safeParse({ ...validDetail, created_by_name: null }).success,
    ).toBe(true);
  });

  it("accepts null updated_by_name", () => {
    expect(
      idRequestDetailSchema.safeParse({ ...validDetail, updated_by_name: null }).success,
    ).toBe(true);
  });

  it("accepts a non-null updated_by_name", () => {
    expect(
      idRequestDetailSchema.safeParse({ ...validDetail, updated_by_name: "Jane Admin" }).success,
    ).toBe(true);
  });

  it("rejects missing cir_uuid", () => {
    const { cir_uuid: _, ...rest } = validDetail;
    expect(idRequestDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing candidate_ids", () => {
    const { candidate_ids: _, ...rest } = validDetail;
    expect(idRequestDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing created_by_name", () => {
    const { created_by_name: _, ...rest } = validDetail;
    expect(idRequestDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for cir_uuid", () => {
    expect(
      idRequestDetailSchema.safeParse({ ...validDetail, cir_uuid: 123 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for candidate_ids", () => {
    expect(
      idRequestDetailSchema.safeParse({ ...validDetail, candidate_ids: 123 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for status", () => {
    expect(
      idRequestDetailSchema.safeParse({ ...validDetail, status: 456 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for created_at", () => {
    expect(
      idRequestDetailSchema.safeParse({ ...validDetail, created_at: "2026-06-01" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for created_by_name", () => {
    expect(
      idRequestDetailSchema.safeParse({ ...validDetail, created_by_name: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listIdRequestsResultSchema
// ---------------------------------------------------------------------------
describe("listIdRequestsResultSchema", () => {
  const validResult = {
    requests: [
      {
        cir_uuid: "CIR-001",
        candidate_count: 5,
        status: "pending",
        rejection_reason: null,
        created_at: new Date("2026-06-01T10:00:00Z"),
        updated_at: new Date("2026-06-10T12:00:00Z"),
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listIdRequestsResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty requests array", () => {
    expect(
      listIdRequestsResultSchema.safeParse({ ...validResult, requests: [], total: 0, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("accepts zero total and page values", () => {
    expect(
      listIdRequestsResultSchema.safeParse({
        requests: [],
        total: 0,
        page: 0,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing requests", () => {
    const { requests: _, ...rest } = validResult;
    expect(listIdRequestsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = validResult;
    expect(listIdRequestsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = validResult;
    expect(listIdRequestsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing limit", () => {
    const { limit: _, ...rest } = validResult;
    expect(listIdRequestsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing totalPages", () => {
    const { totalPages: _, ...rest } = validResult;
    expect(listIdRequestsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects requests as non-array", () => {
    expect(
      listIdRequestsResultSchema.safeParse({ ...validResult, requests: "not-an-array" }).success,
    ).toBe(false);
  });

  it("rejects an invalid item inside requests array", () => {
    expect(
      listIdRequestsResultSchema.safeParse({
        ...validResult,
        requests: [{ cir_uuid: 123 }], // wrong type for cir_uuid
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type for total", () => {
    expect(
      listIdRequestsResultSchema.safeParse({ ...validResult, total: "one" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for page", () => {
    expect(
      listIdRequestsResultSchema.safeParse({ ...validResult, page: "first" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for limit", () => {
    expect(
      listIdRequestsResultSchema.safeParse({ ...validResult, limit: "twenty" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for totalPages", () => {
    expect(
      listIdRequestsResultSchema.safeParse({ ...validResult, totalPages: "one" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createIdRequestResultSchema
// ---------------------------------------------------------------------------
describe("createIdRequestResultSchema", () => {
  const validResult = {
    cir_uuid: "CIR-001",
    status: "pending",
  };

  it("accepts a valid result", () => {
    expect(createIdRequestResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("rejects missing cir_uuid", () => {
    const { cir_uuid: _, ...rest } = validResult;
    expect(createIdRequestResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing status", () => {
    const { status: _, ...rest } = validResult;
    expect(createIdRequestResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for cir_uuid", () => {
    expect(
      createIdRequestResultSchema.safeParse({ ...validResult, cir_uuid: 123 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for status", () => {
    expect(
      createIdRequestResultSchema.safeParse({ ...validResult, status: 456 }).success,
    ).toBe(false);
  });

  it("accepts extra unknown property (zod strips unknowns by default)", () => {
    // zod strips unknowns by default, but should still parse successfully
    // (unknown keys are stripped, not rejected)
    expect(
      createIdRequestResultSchema.safeParse({ ...validResult, extraField: "oops" }).success,
    ).toBe(true);
  });
});
