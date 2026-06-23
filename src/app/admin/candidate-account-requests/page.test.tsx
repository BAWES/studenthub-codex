import { describe, it, expect } from "vitest";
import {
  listCandidateIdRequestsSchema,
  getCandidateIdRequestSchema,
  updateCandidateIdRequestStatusSchema,
  candidateIdRequestRowSchema,
  listCandidateIdRequestsOutputSchema,
  getCandidateIdRequestOutputSchema,
  updateCandidateIdRequestStatusOutputSchema,
} from "./schemas";

/**
 * Page migration test for admin/candidate-account-requests.
 *
 * Verifies the data contract between page and action.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("admin candidate-account-requests page — data contract", () => {
  it("listCandidateIdRequestsSchema parses with defaults", () => {
    const r = listCandidateIdRequestsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("listCandidateIdRequestsSchema accepts status filter", () => {
    const r = listCandidateIdRequestsSchema.safeParse({ status: "pending" });
    expect(r.success).toBe(true);
  });

  it("getCandidateIdRequestSchema validates with cirUuid", () => {
    const r = getCandidateIdRequestSchema.safeParse({ cirUuid: "abc-123" });
    expect(r.success).toBe(true);
  });

  it("getCandidateIdRequestSchema rejects missing cirUuid", () => {
    const r = getCandidateIdRequestSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("updateCandidateIdRequestStatusSchema validates valid status", () => {
    const r = updateCandidateIdRequestStatusSchema.safeParse({
      cirUuid: "abc-123",
      status: "approved",
    });
    expect(r.success).toBe(true);
  });

  it("updateCandidateIdRequestStatusSchema rejects invalid status", () => {
    const r = updateCandidateIdRequestStatusSchema.safeParse({
      cirUuid: "abc-123",
      status: "unknown",
    });
    expect(r.success).toBe(false);
  });

  it("candidateIdRequestRowSchema validates a row", () => {
    const r = candidateIdRequestRowSchema.safeParse({
      cir_uuid: "abc-123",
      candidate_ids: "42,43",
      status: "pending",
      rejection_reason: null,
      created_by_name: "Admin",
      updated_by_name: null,
      created_at: "2026-06-14T08:00:00Z",
      updated_at: null,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe("pending");
    }
  });

  it("listCandidateIdRequestsOutputSchema validates paginated output", () => {
    const r = listCandidateIdRequestsOutputSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("getCandidateIdRequestOutputSchema validates with nullable request", () => {
    const r = getCandidateIdRequestOutputSchema.safeParse({ request: null });
    expect(r.success).toBe(true);
  });

  it("updateCandidateIdRequestStatusOutputSchema validates success result", () => {
    const r = updateCandidateIdRequestStatusOutputSchema.safeParse({
      operation: "success",
      message: "Status updated",
    });
    expect(r.success).toBe(true);
  });

  it("updateCandidateIdRequestStatusOutputSchema rejects missing fields", () => {
    const r = updateCandidateIdRequestStatusOutputSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});
