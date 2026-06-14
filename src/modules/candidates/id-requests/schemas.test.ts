import { describe, it, expect } from "vitest";
import {
  idRequestListItemSchema,
  idRequestDetailSchema,
  listIdRequestsResultSchema,
  createIdRequestResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

describe("idRequestListItemSchema", () => {
  const valid = {
    cir_uuid: "cir_abc123",
    candidate_count: 5,
    status: "pending",
    rejection_reason: null,
    created_at: new Date("2024-01-15"),
    updated_at: new Date("2024-06-20"),
  };

  it("accepts a valid ID request list item", () => {
    expect(idRequestListItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable fields", () => {
    expect(
      idRequestListItemSchema.safeParse({
        cir_uuid: "cir_xyz",
        candidate_count: 0,
        status: null,
        rejection_reason: null,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing cir_uuid", () => {
    const { cir_uuid: _, ...rest } = valid;
    expect(idRequestListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing candidate_count", () => {
    const { candidate_count: _, ...rest } = valid;
    expect(idRequestListItemSchema.safeParse(rest).success).toBe(false);
  });
});

describe("idRequestDetailSchema", () => {
  const valid = {
    cir_uuid: "cir_abc",
    candidate_ids: "1,2,3",
    status: "completed",
    rejection_reason: null,
    created_at: new Date("2024-01-15"),
    updated_at: new Date("2024-06-20"),
    created_by_name: "Admin User",
    updated_by_name: null,
  };

  it("accepts a valid detail", () => {
    expect(idRequestDetailSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable fields", () => {
    expect(
      idRequestDetailSchema.safeParse({
        cir_uuid: "cir_xyz",
        candidate_ids: null,
        status: null,
        rejection_reason: null,
        created_at: null,
        updated_at: null,
        created_by_name: null,
        updated_by_name: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing cir_uuid", () => {
    const { cir_uuid: _, ...rest } = valid;
    expect(idRequestDetailSchema.safeParse(rest).success).toBe(false);
  });
});

describe("listIdRequestsResultSchema", () => {
  it("accepts valid result with empty list", () => {
    expect(
      listIdRequestsResultSchema.safeParse({
        requests: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing requests", () => {
    expect(
      listIdRequestsResultSchema.safeParse({ total: 0, page: 1, limit: 20, totalPages: 0 }).success,
    ).toBe(false);
  });
});

describe("createIdRequestResultSchema", () => {
  it("accepts valid result", () => {
    const r = createIdRequestResultSchema.safeParse({
      cir_uuid: "cir_new",
      status: "pending",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.cir_uuid).toBe("cir_new");
  });

  it("rejects missing cir_uuid", () => {
    expect(createIdRequestResultSchema.safeParse({ status: "pending" }).success).toBe(false);
  });

  it("rejects missing status", () => {
    expect(createIdRequestResultSchema.safeParse({ cir_uuid: "cir_1" }).success).toBe(false);
  });
});
