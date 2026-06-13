import { describe, it, expect } from "vitest";
import {
  listStoreAssignmentRequestsSchema,
  getStoreAssignmentRequestSchema,
  updateStoreAssignmentRequestStatusSchema,
  listStoreAssignmentRequestsOutputSchema,
  getStoreAssignmentRequestOutputSchema,
  updateStoreAssignmentRequestStatusOutputSchema,
  storeAssignmentRequestRowSchema,
} from "../schemas";

describe("admin/user-requests schemas", () => {
  describe("listStoreAssignmentRequestsSchema", () => {
    it("accepts empty input with defaults", () => {
      const result = listStoreAssignmentRequestsSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
        expect(result.data.candidateId).toBeUndefined();
        expect(result.data.storeId).toBeUndefined();
        expect(result.data.status).toBeUndefined();
      }
    });

    it("accepts pagination params", () => {
      const result = listStoreAssignmentRequestsSchema.safeParse({ page: 2, limit: 50 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(50);
      }
    });

    it("coerces string page/limit to numbers", () => {
      const result = listStoreAssignmentRequestsSchema.safeParse({ page: "3", limit: "10" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.limit).toBe(10);
      }
    });

    it("accepts status filter 'pending'", () => {
      const result = listStoreAssignmentRequestsSchema.safeParse({ status: "pending" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("pending");
      }
    });

    it("accepts status filter 'approved'", () => {
      const result = listStoreAssignmentRequestsSchema.safeParse({ status: "approved" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("approved");
      }
    });

    it("rejects invalid status value", () => {
      const result = listStoreAssignmentRequestsSchema.safeParse({ status: "invalid" });
      expect(result.success).toBe(false);
    });

    it("accepts candidateId and storeId filters", () => {
      const result = listStoreAssignmentRequestsSchema.safeParse({ candidateId: 42, storeId: 7 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.candidateId).toBe(42);
        expect(result.data.storeId).toBe(7);
      }
    });

    it("rejects page less than 1", () => {
      const result = listStoreAssignmentRequestsSchema.safeParse({ page: 0 });
      expect(result.success).toBe(false);
    });

    it("rejects limit over 100", () => {
      const result = listStoreAssignmentRequestsSchema.safeParse({ limit: 200 });
      expect(result.success).toBe(false);
    });
  });

  describe("getStoreAssignmentRequestSchema", () => {
    it("accepts valid sarUuid", () => {
      const result = getStoreAssignmentRequestSchema.safeParse({ sarUuid: "abc-123" });
      expect(result.success).toBe(true);
    });

    it("rejects empty sarUuid", () => {
      const result = getStoreAssignmentRequestSchema.safeParse({ sarUuid: "" });
      expect(result.success).toBe(false);
    });

    it("rejects missing sarUuid", () => {
      const result = getStoreAssignmentRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("updateStoreAssignmentRequestStatusSchema", () => {
    it("accepts valid input with pending status", () => {
      const result = updateStoreAssignmentRequestStatusSchema.safeParse({
        sarUuid: "abc-123",
        status: "pending",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid input with approved status", () => {
      const result = updateStoreAssignmentRequestStatusSchema.safeParse({
        sarUuid: "abc-123",
        status: "approved",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid status", () => {
      const result = updateStoreAssignmentRequestStatusSchema.safeParse({
        sarUuid: "abc-123",
        status: "invalid",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty sarUuid", () => {
      const result = updateStoreAssignmentRequestStatusSchema.safeParse({
        sarUuid: "",
        status: "pending",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing sarUuid", () => {
      const result = updateStoreAssignmentRequestStatusSchema.safeParse({
        status: "approved",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("storeAssignmentRequestRowSchema", () => {
    it("validates a valid row", () => {
      const result = storeAssignmentRequestRowSchema.safeParse({
        sar_uuid: "uuid-1",
        candidate_id: 42,
        candidate_name: "John Doe",
        store_id: 7,
        store_name: "Main Store",
        currency_code: "KWD",
        status: 0,
        created_at: "2024-01-15T10:00:00.000Z",
        updated_at: "2024-01-15T12:00:00.000Z",
      });
      expect(result.success).toBe(true);
    });

    it("validates row with null candidate/store", () => {
      const result = storeAssignmentRequestRowSchema.safeParse({
        sar_uuid: "uuid-2",
        candidate_id: null,
        candidate_name: null,
        store_id: null,
        store_name: null,
        currency_code: null,
        status: null,
        created_at: null,
        updated_at: null,
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty sar_uuid", () => {
      const result = storeAssignmentRequestRowSchema.safeParse({
        sar_uuid: "",
        candidate_id: null,
        candidate_name: null,
        store_id: null,
        store_name: null,
        currency_code: null,
        status: null,
        created_at: null,
        updated_at: null,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("listStoreAssignmentRequestsOutputSchema", () => {
    it("validates a valid paginated output", () => {
      const result = listStoreAssignmentRequestsOutputSchema.safeParse({
        items: [
          {
            sar_uuid: "uuid-1",
            candidate_id: 42,
            candidate_name: "John Doe",
            store_id: 7,
            store_name: "Main Store",
            currency_code: "KWD",
            status: 0,
            created_at: "2024-01-15T10:00:00.000Z",
            updated_at: "2024-01-15T12:00:00.000Z",
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      expect(result.success).toBe(true);
    });

    it("rejects negative total", () => {
      const result = listStoreAssignmentRequestsOutputSchema.safeParse({
        items: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("getStoreAssignmentRequestOutputSchema", () => {
    it("validates found request", () => {
      const result = getStoreAssignmentRequestOutputSchema.safeParse({
        request: {
          sar_uuid: "uuid-1",
          candidate_id: 42,
          candidate_name: "John Doe",
          store_id: 7,
          store_name: "Main Store",
          currency_code: "KWD",
          status: 0,
          created_at: null,
          updated_at: null,
        },
      });
      expect(result.success).toBe(true);
    });

    it("validates null request (not found)", () => {
      const result = getStoreAssignmentRequestOutputSchema.safeParse({
        request: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("updateStoreAssignmentRequestStatusOutputSchema", () => {
    it("validates success result", () => {
      const result = updateStoreAssignmentRequestStatusOutputSchema.safeParse({
        operation: "success",
        message: "Status updated",
      });
      expect(result.success).toBe(true);
    });

    it("validates error result", () => {
      const result = updateStoreAssignmentRequestStatusOutputSchema.safeParse({
        operation: "error",
        message: "Something went wrong",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid operation", () => {
      const result = updateStoreAssignmentRequestStatusOutputSchema.safeParse({
        operation: "invalid",
        message: "msg",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty message", () => {
      const result = updateStoreAssignmentRequestStatusOutputSchema.safeParse({
        operation: "success",
        message: "",
      });
      expect(result.success).toBe(false);
    });
  });
});
