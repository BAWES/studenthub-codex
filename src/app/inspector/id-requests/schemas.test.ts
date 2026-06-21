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
    expect(listIdRequestsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(
      listIdRequestsSchema.safeParse({ page: 2, limit: 50, q: "test", status: "pending" }).success,
    ).toBe(true);
  });

  it("rejects limit below 1", () => {
    expect(listIdRequestsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listIdRequestsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listIdRequestsSchema.safeParse({ page: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getIdRequestSchema
// ---------------------------------------------------------------------------
describe("getIdRequestSchema", () => {
  it("accepts valid input", () => {
    expect(getIdRequestSchema.safeParse({ id: "req-123" }).success).toBe(true);
  });

  it("rejects missing id", () => {
    expect(getIdRequestSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty id", () => {
    expect(getIdRequestSchema.safeParse({ id: "" }).success).toBe(false);
  });

  it("rejects wrong type", () => {
    expect(getIdRequestSchema.safeParse({ id: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateIdRequestStatusSchema
// ---------------------------------------------------------------------------
describe("updateIdRequestStatusSchema", () => {
  it("accepts valid input", () => {
    expect(
      updateIdRequestStatusSchema.safeParse({ id: "req-1", status: "approved" }).success,
    ).toBe(true);
  });

  it("accepts all valid statuses", () => {
    for (const status of ["pending", "approved", "rejected"]) {
      expect(updateIdRequestStatusSchema.safeParse({ id: "req-1", status }).success).toBe(true);
    }
  });

  it("accepts rejection_reason when rejecting", () => {
    expect(
      updateIdRequestStatusSchema.safeParse({
        id: "req-1",
        status: "rejected",
        rejection_reason: "Incomplete documentation submitted",
      }).success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    expect(updateIdRequestStatusSchema.safeParse({ status: "approved" }).success).toBe(false);
  });

  it("rejects empty id", () => {
    expect(updateIdRequestStatusSchema.safeParse({ id: "", status: "approved" }).success).toBe(false);
  });

  it("rejects missing status", () => {
    expect(updateIdRequestStatusSchema.safeParse({ id: "req-1" }).success).toBe(false);
  });

  it("rejects invalid status", () => {
    expect(
      updateIdRequestStatusSchema.safeParse({ id: "req-1", status: "invalid" }).success,
    ).toBe(false);
  });

  it("rejects rejection_reason below min length", () => {
    expect(
      updateIdRequestStatusSchema.safeParse({ id: "req-1", status: "rejected", rejection_reason: "Short" }).success,
    ).toBe(false);
  });

  it("rejects rejection_reason exceeding 500 chars", () => {
    expect(
      updateIdRequestStatusSchema.safeParse({
        id: "req-1",
        status: "rejected",
        rejection_reason: "x".repeat(501),
      }).success,
    ).toBe(false);
  });
});
