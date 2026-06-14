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
  const validItem = () => ({
    cir_uuid: "cir-001",
    candidate_count: 3,
    status: "pending",
    rejection_reason: null,
    created_at: new Date("2026-06-01"),
    updated_at: new Date("2026-06-10"),
  });

  it("accepts a valid list item", () => {
    const r = idRequestListItemSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = idRequestListItemSchema.safeParse({
      ...validItem(),
      status: null,
      rejection_reason: null,
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing cir_uuid", () => {
    const { cir_uuid: _, ...rest } = validItem();
    expect(idRequestListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-number candidate_count", () => {
    expect(
      idRequestListItemSchema.safeParse({ ...validItem(), candidate_count: "three" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// idRequestDetailSchema
// ---------------------------------------------------------------------------

describe("idRequestDetailSchema", () => {
  const validDetail = () => ({
    cir_uuid: "cir-001",
    candidate_ids: "1,2,3",
    status: "approved",
    rejection_reason: null,
    created_at: new Date("2026-06-01"),
    updated_at: new Date("2026-06-10"),
    created_by_name: "Staff User",
    updated_by_name: "Staff User",
  });

  it("accepts a valid detail object", () => {
    const r = idRequestDetailSchema.safeParse(validDetail());
    expect(r.success).toBe(true);
  });

  it("accepts all nullable fields", () => {
    const r = idRequestDetailSchema.safeParse({
      ...validDetail(),
      candidate_ids: null,
      status: null,
      rejection_reason: null,
      created_at: null,
      updated_at: null,
      created_by_name: null,
      updated_by_name: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing cir_uuid", () => {
    const { cir_uuid: _, ...rest } = validDetail();
    expect(idRequestDetailSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listIdRequestsResultSchema
// ---------------------------------------------------------------------------

describe("listIdRequestsResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const r = listIdRequestsResultSchema.safeParse({
      requests: [{
        cir_uuid: "c-1",
        candidate_count: 1,
        status: null,
        rejection_reason: null,
        created_at: null,
        updated_at: null,
      }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty requests array", () => {
    const r = listIdRequestsResultSchema.safeParse({
      requests: [], total: 0, page: 1, limit: 20, totalPages: 0,
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// createIdRequestResultSchema
// ---------------------------------------------------------------------------

describe("createIdRequestResultSchema", () => {
  it("accepts valid result", () => {
    const r = createIdRequestResultSchema.safeParse({ cir_uuid: "cir-new", status: "pending" });
    expect(r.success).toBe(true);
  });

  it("rejects missing cir_uuid", () => {
    const r = createIdRequestResultSchema.safeParse({ status: "pending" });
    expect(r.success).toBe(false);
  });

  it("rejects missing status", () => {
    const r = createIdRequestResultSchema.safeParse({ cir_uuid: "cir-new" });
    expect(r.success).toBe(false);
  });
});
