import { describe, it, expect } from "vitest";
import {
  listIdRequestsSchema,
  getIdRequestSchema,
  updateIdRequestStatusSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listIdRequestsSchema (input)
// ---------------------------------------------------------------------------

describe("listIdRequestsSchema", () => {
  it("parses with defaults when empty", () => {
    const r = listIdRequestsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts explicit page and limit", () => {
    const r = listIdRequestsSchema.safeParse({ page: 2, limit: 50 });
    expect(r.success).toBe(true);
  });

  it("accepts optional q and status", () => {
    const r = listIdRequestsSchema.safeParse({ q: "test", status: "pending" });
    expect(r.success).toBe(true);
  });

  it("rejects negative page", () => {
    const r = listIdRequestsSchema.safeParse({ page: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const r = listIdRequestsSchema.safeParse({ limit: 200 });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getIdRequestSchema (input)
// ---------------------------------------------------------------------------

describe("getIdRequestSchema", () => {
  it("accepts valid request id", () => {
    const r = getIdRequestSchema.safeParse({ id: "req-001" });
    expect(r.success).toBe(true);
  });

  it("rejects empty id", () => {
    const r = getIdRequestSchema.safeParse({ id: "" });
    expect(r.success).toBe(false);
  });

  it("rejects missing id", () => {
    const r = getIdRequestSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateIdRequestStatusSchema (input)
// ---------------------------------------------------------------------------

describe("updateIdRequestStatusSchema", () => {
  it("accepts valid pending status", () => {
    const r = updateIdRequestStatusSchema.safeParse({ id: "req-001", status: "pending" });
    expect(r.success).toBe(true);
  });

  it("accepts approved status", () => {
    const r = updateIdRequestStatusSchema.safeParse({ id: "req-001", status: "approved" });
    expect(r.success).toBe(true);
  });

  it("accepts rejected status with rejection reason", () => {
    const r = updateIdRequestStatusSchema.safeParse({
      id: "req-001",
      status: "rejected",
      rejection_reason: "Document mismatch",
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const r = updateIdRequestStatusSchema.safeParse({ id: "req-001", status: "invalid" });
    expect(r.success).toBe(false);
  });

  it("rejects rejection_reason shorter than 10 chars", () => {
    const r = updateIdRequestStatusSchema.safeParse({
      id: "req-001",
      status: "rejected",
      rejection_reason: "Short",
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing id", () => {
    const r = updateIdRequestStatusSchema.safeParse({ status: "pending" });
    expect(r.success).toBe(false);
  });

  it("rejects missing status", () => {
    const r = updateIdRequestStatusSchema.safeParse({ id: "req-001" });
    expect(r.success).toBe(false);
  });
});
