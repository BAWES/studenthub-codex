import { describe, it, expect } from "vitest";
import {
  listIdRequestsSchema,
  getIdRequestSchema,
  updateIdRequestStatusSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listIdRequestsSchema
// ---------------------------------------------------------------------------
describe("listIdRequestsSchema", () => {
  it("accepts empty input with defaults", () => {
    const r = listIdRequestsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts with filters", () => {
    const r = listIdRequestsSchema.safeParse({
      page: 2,
      limit: 10,
      q: "search",
      status: "pending",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.q).toBe("search");
      expect(r.data.status).toBe("pending");
    }
  });

  it("rejects negative page", () => {
    expect(listIdRequestsSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listIdRequestsSchema.safeParse({ limit: 200 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getIdRequestSchema
// ---------------------------------------------------------------------------
describe("getIdRequestSchema", () => {
  it("accepts valid ID", () => {
    expect(getIdRequestSchema.safeParse({ id: "req-123" }).success).toBe(true);
  });

  it("rejects empty ID", () => {
    expect(getIdRequestSchema.safeParse({ id: "" }).success).toBe(false);
  });

  it("rejects missing ID", () => {
    expect(getIdRequestSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateIdRequestStatusSchema
// ---------------------------------------------------------------------------
describe("updateIdRequestStatusSchema", () => {
  const valid = { id: "req-123", status: "approved" as const };

  it("accepts valid approve", () => {
    expect(updateIdRequestStatusSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts pending status", () => {
    expect(
      updateIdRequestStatusSchema.safeParse({ id: "req-123", status: "pending" }).success
    ).toBe(true);
  });

  it("accepts rejected with reason", () => {
    const r = updateIdRequestStatusSchema.safeParse({
      id: "req-123",
      status: "rejected",
      rejection_reason: "Invalid document provided",
    });
    expect(r.success).toBe(true);
  });

  it("rejects rejection_reason under 10 chars", () => {
    expect(
      updateIdRequestStatusSchema.safeParse({
        id: "req-123",
        status: "rejected",
        rejection_reason: "No",
      }).success
    ).toBe(false);
  });

  it("rejects invalid status", () => {
    expect(
      updateIdRequestStatusSchema.safeParse({
        id: "req-123",
        status: "invalid",
      }).success
    ).toBe(false);
  });

  it("rejects missing id", () => {
    expect(
      updateIdRequestStatusSchema.safeParse({ status: "approved" }).success
    ).toBe(false);
  });
});