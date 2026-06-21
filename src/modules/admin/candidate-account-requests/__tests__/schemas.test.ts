import { describe, it, expect } from "vitest";
import {
  listCandidateIdRequestsSchema,
  getCandidateIdRequestSchema,
  updateCandidateIdRequestStatusSchema,
  listCandidateIdRequestsOutputSchema,
  getCandidateIdRequestOutputSchema,
  updateCandidateIdRequestStatusOutputSchema,
  candidateIdRequestRowSchema,
} from "../schemas";

describe("admin/candidate-account-requests schemas", () => {
  describe("listCandidateIdRequestsSchema", () => {
    it("accepts empty input with defaults", () => {
      const result = listCandidateIdRequestsSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
        expect(result.data.status).toBeUndefined();
      }
    });

    it("accepts pagination params", () => {
      const result = listCandidateIdRequestsSchema.safeParse({ page: 2, limit: 50 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(50);
      }
    });

    it("coerces string page/limit to numbers", () => {
      const result = listCandidateIdRequestsSchema.safeParse({ page: "3", limit: "10" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.limit).toBe(10);
      }
    });

    it("accepts status filter 'pending'", () => {
      const result = listCandidateIdRequestsSchema.safeParse({ status: "pending" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("pending");
      }
    });

    it("accepts status filter 'approved'", () => {
      const result = listCandidateIdRequestsSchema.safeParse({ status: "approved" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("approved");
      }
    });

    it("accepts status filter 'rejected'", () => {
      const result = listCandidateIdRequestsSchema.safeParse({ status: "rejected" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("rejected");
      }
    });

    it("rejects invalid status value", () => {
      const result = listCandidateIdRequestsSchema.safeParse({ status: "invalid" });
      expect(result.success).toBe(false);
    });

    it("rejects page less than 1", () => {
      const result = listCandidateIdRequestsSchema.safeParse({ page: 0 });
      expect(result.success).toBe(false);
    });

    it("rejects limit over 100", () => {
      const result = listCandidateIdRequestsSchema.safeParse({ limit: 200 });
      expect(result.success).toBe(false);
    });
  });

  describe("getCandidateIdRequestSchema", () => {
    it("accepts valid cirUuid", () => {
      const result = getCandidateIdRequestSchema.safeParse({ cirUuid: "abc-123" });
      expect(result.success).toBe(true);
    });

    it("rejects empty cirUuid", () => {
      const result = getCandidateIdRequestSchema.safeParse({ cirUuid: "" });
      expect(result.success).toBe(false);
    });

    it("rejects missing cirUuid", () => {
      const result = getCandidateIdRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("updateCandidateIdRequestStatusSchema", () => {
    it("accepts valid input with pending status", () => {
      const result = updateCandidateIdRequestStatusSchema.safeParse({
        cirUuid: "abc-123",
        status: "pending",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid input with approved status", () => {
      const result = updateCandidateIdRequestStatusSchema.safeParse({
        cirUuid: "abc-123",
        status: "approved",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid input with rejected status", () => {
      const result = updateCandidateIdRequestStatusSchema.safeParse({
        cirUuid: "abc-123",
        status: "rejected",
      });
      expect(result.success).toBe(true);
    });

    it("accepts optional rejectionReason", () => {
      const result = updateCandidateIdRequestStatusSchema.safeParse({
        cirUuid: "abc-123",
        status: "rejected",
        rejectionReason: "Incomplete documentation",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rejectionReason).toBe("Incomplete documentation");
      }
    });

    it("rejects invalid status", () => {
      const result = updateCandidateIdRequestStatusSchema.safeParse({
        cirUuid: "abc-123",
        status: "invalid",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty cirUuid", () => {
      const result = updateCandidateIdRequestStatusSchema.safeParse({
        cirUuid: "",
        status: "pending",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing cirUuid", () => {
      const result = updateCandidateIdRequestStatusSchema.safeParse({
        status: "approved",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("candidateIdRequestRowSchema", () => {
    it("validates a valid row", () => {
      const result = candidateIdRequestRowSchema.safeParse({
        cir_uuid: "uuid-1",
        candidate_ids: "101,102,103",
        status: "pending",
        rejection_reason: null,
        created_by_name: "Admin User",
        updated_by_name: null,
        created_at: "2024-01-15T10:00:00.000Z",
        updated_at: "2024-01-15T12:00:00.000Z",
      });
      expect(result.success).toBe(true);
    });

    it("validates row with all nulls", () => {
      const result = candidateIdRequestRowSchema.safeParse({
        cir_uuid: "uuid-2",
        candidate_ids: null,
        status: null,
        rejection_reason: null,
        created_by_name: null,
        updated_by_name: null,
        created_at: null,
        updated_at: null,
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty cir_uuid", () => {
      const result = candidateIdRequestRowSchema.safeParse({
        cir_uuid: "",
        candidate_ids: null,
        status: null,
        rejection_reason: null,
        created_by_name: null,
        updated_by_name: null,
        created_at: null,
        updated_at: null,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("listCandidateIdRequestsOutputSchema", () => {
    it("validates a valid paginated output", () => {
      const result = listCandidateIdRequestsOutputSchema.safeParse({
        items: [
          {
            cir_uuid: "uuid-1",
            candidate_ids: "101,102",
            status: "pending",
            rejection_reason: null,
            created_by_name: "Admin",
            updated_by_name: null,
            created_at: "2024-01-15T10:00:00.000Z",
            updated_at: null,
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
      const result = listCandidateIdRequestsOutputSchema.safeParse({
        items: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("getCandidateIdRequestOutputSchema", () => {
    it("validates found request", () => {
      const result = getCandidateIdRequestOutputSchema.safeParse({
        request: {
          cir_uuid: "uuid-1",
          candidate_ids: "101,102",
          status: "approved",
          rejection_reason: null,
          created_by_name: "Admin",
          updated_by_name: null,
          created_at: null,
          updated_at: null,
        },
      });
      expect(result.success).toBe(true);
    });

    it("validates null request (not found)", () => {
      const result = getCandidateIdRequestOutputSchema.safeParse({
        request: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("updateCandidateIdRequestStatusOutputSchema", () => {
    it("validates success result", () => {
      const result = updateCandidateIdRequestStatusOutputSchema.safeParse({
        operation: "success",
        message: "Status updated",
      });
      expect(result.success).toBe(true);
    });

    it("validates error result", () => {
      const result = updateCandidateIdRequestStatusOutputSchema.safeParse({
        operation: "error",
        message: "Something went wrong",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid operation", () => {
      const result = updateCandidateIdRequestStatusOutputSchema.safeParse({
        operation: "invalid",
        message: "msg",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty message", () => {
      const result = updateCandidateIdRequestStatusOutputSchema.safeParse({
        operation: "success",
        message: "",
      });
      expect(result.success).toBe(false);
    });
  });
});
