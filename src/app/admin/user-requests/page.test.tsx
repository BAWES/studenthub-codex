import { describe, it, expect } from "vitest";
import {
  listStoreAssignmentRequestsSchema,
  getStoreAssignmentRequestSchema,
  updateStoreAssignmentRequestStatusSchema,
  storeAssignmentRequestRowSchema,
  listStoreAssignmentRequestsOutputSchema,
  getStoreAssignmentRequestOutputSchema,
  updateStoreAssignmentRequestStatusOutputSchema,
} from "./schemas";

/**
 * Page migration test for admin/user-requests.
 *
 * Verifies the data contract between page and action.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("admin user-requests page — data contract", () => {
  it("listStoreAssignmentRequestsSchema parses with defaults", () => {
    const r = listStoreAssignmentRequestsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("listStoreAssignmentRequestsSchema accepts filters", () => {
    const r = listStoreAssignmentRequestsSchema.safeParse({
      status: "pending",
      candidateId: 42,
    });
    expect(r.success).toBe(true);
  });

  it("getStoreAssignmentRequestSchema validates with sarUuid", () => {
    const r = getStoreAssignmentRequestSchema.safeParse({
      sarUuid: "sar-001",
    });
    expect(r.success).toBe(true);
  });

  it("getStoreAssignmentRequestSchema rejects missing uuid", () => {
    const r = getStoreAssignmentRequestSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("updateStoreAssignmentRequestStatusSchema validates", () => {
    const r = updateStoreAssignmentRequestStatusSchema.safeParse({
      sarUuid: "sar-001",
      status: "approved",
    });
    expect(r.success).toBe(true);
  });

  it("updateStoreAssignmentRequestStatusSchema rejects invalid status", () => {
    const r = updateStoreAssignmentRequestStatusSchema.safeParse({
      sarUuid: "sar-001",
      status: "invalid",
    });
    expect(r.success).toBe(false);
  });

  it("storeAssignmentRequestRowSchema validates a row", () => {
    const r = storeAssignmentRequestRowSchema.safeParse({
      sar_uuid: "sar-001",
      candidate_id: 42,
      candidate_name: "Ahmed",
      store_id: 7,
      store_name: "Main Branch",
      currency_code: "KWD",
      status: 1,
      created_at: "2026-06-14T08:00:00Z",
      updated_at: null,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.sar_uuid).toBe("sar-001");
      expect(r.data.status).toBe(1);
    }
  });

  it("listStoreAssignmentRequestsOutputSchema validates paginated output", () => {
    const r = listStoreAssignmentRequestsOutputSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("getStoreAssignmentRequestOutputSchema validates nullable request", () => {
    const r = getStoreAssignmentRequestOutputSchema.safeParse({
      request: null,
    });
    expect(r.success).toBe(true);
  });

  it("updateStoreAssignmentRequestStatusOutputSchema validates", () => {
    const r = updateStoreAssignmentRequestStatusOutputSchema.safeParse({
      operation: "success",
      message: "Status updated",
    });
    expect(r.success).toBe(true);
  });
});
