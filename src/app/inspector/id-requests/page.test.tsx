import { describe, it, expect } from "vitest";
import {
  listIdRequestsSchema,
  getIdRequestSchema,
  updateIdRequestStatusSchema,
} from "./schemas";

/**
 * Page migration test for inspector/id-requests.
 *
 * Verifies the data contract between page and action.
 * The ID requests page allows inspectors to manage candidate
 * identity verification requests with status updates.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("inspector id-requests page — data contract", () => {
  // ---------------------------------------------------------------------------
  // listIdRequestsSchema (input)
  // ---------------------------------------------------------------------------
  it("listIdRequestsSchema accepts empty input with defaults", () => {
    const r = listIdRequestsSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("listIdRequestsSchema accepts explicit values", () => {
    const r = listIdRequestsSchema.safeParse({
      page: 2,
      limit: 50,
      q: "test",
      status: "pending",
    });
    expect(r.success).toBe(true);
  });

  it("listIdRequestsSchema rejects limit below 1", () => {
    const r = listIdRequestsSchema.safeParse({ limit: 0 });
    expect(r.success).toBe(false);
  });

  it("listIdRequestsSchema rejects limit above 100", () => {
    const r = listIdRequestsSchema.safeParse({ limit: 101 });
    expect(r.success).toBe(false);
  });

  it("listIdRequestsSchema rejects zero page", () => {
    const r = listIdRequestsSchema.safeParse({ page: 0 });
    expect(r.success).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // getIdRequestSchema (input)
  // ---------------------------------------------------------------------------
  it("getIdRequestSchema accepts valid id", () => {
    const r = getIdRequestSchema.safeParse({ id: "req-123" });
    expect(r.success).toBe(true);
  });

  it("getIdRequestSchema rejects missing id", () => {
    const r = getIdRequestSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("getIdRequestSchema rejects empty id", () => {
    const r = getIdRequestSchema.safeParse({ id: "" });
    expect(r.success).toBe(false);
  });

  it("getIdRequestSchema rejects wrong type", () => {
    const r = getIdRequestSchema.safeParse({ id: 123 });
    expect(r.success).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // updateIdRequestStatusSchema (input)
  // ---------------------------------------------------------------------------
  it("updateIdRequestStatusSchema accepts valid input", () => {
    const r = updateIdRequestStatusSchema.safeParse({
      id: "req-1",
      status: "approved",
    });
    expect(r.success).toBe(true);
  });

  it("updateIdRequestStatusSchema accepts all valid statuses", () => {
    for (const status of ["pending", "approved", "rejected"]) {
      const r = updateIdRequestStatusSchema.safeParse({
        id: "req-1",
        status,
      });
      expect(r.success).toBe(true);
    }
  });

  it("updateIdRequestStatusSchema accepts rejection_reason when rejecting", () => {
    const r = updateIdRequestStatusSchema.safeParse({
      id: "req-1",
      status: "rejected",
      rejection_reason: "Incomplete documentation submitted",
    });
    expect(r.success).toBe(true);
  });

  it("updateIdRequestStatusSchema rejects missing id", () => {
    const r = updateIdRequestStatusSchema.safeParse({
      status: "approved",
    });
    expect(r.success).toBe(false);
  });

  it("updateIdRequestStatusSchema rejects missing status", () => {
    const r = updateIdRequestStatusSchema.safeParse({ id: "req-1" });
    expect(r.success).toBe(false);
  });

  it("updateIdRequestStatusSchema rejects invalid status", () => {
    const r = updateIdRequestStatusSchema.safeParse({
      id: "req-1",
      status: "invalid",
    });
    expect(r.success).toBe(false);
  });

  it("updateIdRequestStatusSchema rejects short rejection_reason", () => {
    const r = updateIdRequestStatusSchema.safeParse({
      id: "req-1",
      status: "rejected",
      rejection_reason: "Short",
    });
    expect(r.success).toBe(false);
  });

  it("updateIdRequestStatusSchema rejects long rejection_reason", () => {
    const r = updateIdRequestStatusSchema.safeParse({
      id: "req-1",
      status: "rejected",
      rejection_reason: "x".repeat(501),
    });
    expect(r.success).toBe(false);
  });
});
