import { describe, it, expect } from "vitest";
import {
  listRequestsSchema,
  getRequestSchema,
  updateRequestStatusSchema,
  approveRequestSchema,
  rejectRequestSchema,
  closeRequestSchema,
  listRequestsOutputSchema,
  getRequestOutputSchema,
  updateRequestStatusOutputSchema,
  approveRequestOutputSchema,
  rejectRequestOutputSchema,
  closeRequestOutputSchema,
} from "../schemas";

describe("admin/requests schemas", () => {
  describe("listRequestsSchema", () => {
    it("accepts empty input with defaults", () => {
      const result = listRequestsSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
        expect(result.data.companyId).toBeUndefined();
        expect(result.data.status).toBeUndefined();
        expect(result.data.q).toBeUndefined();
      }
    });

    it("accepts pagination params", () => {
      const result = listRequestsSchema.safeParse({ page: 2, limit: 50 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(50);
      }
    });

    it("coerces string page/limit to numbers", () => {
      const result = listRequestsSchema.safeParse({ page: "3", limit: "10" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.limit).toBe(10);
      }
    });

    it("accepts status filter 'pending'", () => {
      const result = listRequestsSchema.safeParse({ status: "pending" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("pending");
      }
    });

    it("accepts status filter 'started'", () => {
      const result = listRequestsSchema.safeParse({ status: "started" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("started");
      }
    });

    it("accepts status filter 'delivered'", () => {
      const result = listRequestsSchema.safeParse({ status: "delivered" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("delivered");
      }
    });

    it("accepts status filter 'cancelled'", () => {
      const result = listRequestsSchema.safeParse({ status: "cancelled" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("cancelled");
      }
    });

    it("accepts status filter 'finished_by_recruitment'", () => {
      const result = listRequestsSchema.safeParse({ status: "finished_by_recruitment" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("finished_by_recruitment");
      }
    });

    it("accepts status filter 're_work'", () => {
      const result = listRequestsSchema.safeParse({ status: "re_work" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("re_work");
      }
    });

    it("rejects invalid status value", () => {
      const result = listRequestsSchema.safeParse({ status: "invalid" });
      expect(result.success).toBe(false);
    });

    it("accepts companyId filter", () => {
      const result = listRequestsSchema.safeParse({ companyId: 42 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.companyId).toBe(42);
      }
    });

    it("accepts search query", () => {
      const result = listRequestsSchema.safeParse({ q: "developer" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.q).toBe("developer");
      }
    });

    it("rejects page less than 1", () => {
      const result = listRequestsSchema.safeParse({ page: 0 });
      expect(result.success).toBe(false);
    });

    it("rejects limit over 100", () => {
      const result = listRequestsSchema.safeParse({ limit: 200 });
      expect(result.success).toBe(false);
    });
  });

  describe("getRequestSchema", () => {
    it("accepts valid requestUuid", () => {
      const result = getRequestSchema.safeParse({ requestUuid: "abc-123" });
      expect(result.success).toBe(true);
    });

    it("rejects empty requestUuid", () => {
      const result = getRequestSchema.safeParse({ requestUuid: "" });
      expect(result.success).toBe(false);
    });

    it("rejects missing requestUuid", () => {
      const result = getRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("updateRequestStatusSchema", () => {
    it("accepts valid input with started status", () => {
      const result = updateRequestStatusSchema.safeParse({
        requestUuid: "abc-123",
        status: "started",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid input with delivered status", () => {
      const result = updateRequestStatusSchema.safeParse({
        requestUuid: "abc-123",
        status: "delivered",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid input with cancelled status", () => {
      const result = updateRequestStatusSchema.safeParse({
        requestUuid: "abc-123",
        status: "cancelled",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid input with finished_by_recruitment status", () => {
      const result = updateRequestStatusSchema.safeParse({
        requestUuid: "abc-123",
        status: "finished_by_recruitment",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid input with re_work status", () => {
      const result = updateRequestStatusSchema.safeParse({
        requestUuid: "abc-123",
        status: "re_work",
      });
      expect(result.success).toBe(true);
    });

    it("accepts optional feedback", () => {
      const result = updateRequestStatusSchema.safeParse({
        requestUuid: "abc-123",
        status: "delivered",
        feedback: "Great work on this request",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.feedback).toBe("Great work on this request");
      }
    });

    it("rejects invalid status", () => {
      const result = updateRequestStatusSchema.safeParse({
        requestUuid: "abc-123",
        status: "invalid",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty requestUuid", () => {
      const result = updateRequestStatusSchema.safeParse({
        requestUuid: "",
        status: "pending",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing requestUuid", () => {
      const result = updateRequestStatusSchema.safeParse({
        status: "started",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("approveRequestSchema", () => {
    it("accepts valid input", () => {
      const result = approveRequestSchema.safeParse({
        requestUuid: "abc-123",
        reason: "Meets all requirements",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reason).toBe("Meets all requirements");
      }
    });

    it("rejects empty reason", () => {
      const result = approveRequestSchema.safeParse({
        requestUuid: "abc-123",
        reason: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty requestUuid", () => {
      const result = approveRequestSchema.safeParse({
        requestUuid: "",
        reason: "Valid reason",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("rejectRequestSchema", () => {
    it("accepts valid input", () => {
      const result = rejectRequestSchema.safeParse({
        requestUuid: "abc-123",
        reason: "Insufficient budget",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reason).toBe("Insufficient budget");
      }
    });

    it("rejects empty reason", () => {
      const result = rejectRequestSchema.safeParse({
        requestUuid: "abc-123",
        reason: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty requestUuid", () => {
      const result = rejectRequestSchema.safeParse({
        requestUuid: "",
        reason: "Valid reason",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("closeRequestSchema", () => {
    it("accepts valid input", () => {
      const result = closeRequestSchema.safeParse({
        requestUuid: "abc-123",
        resolution: "Position filled successfully",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.resolution).toBe("Position filled successfully");
      }
    });

    it("rejects empty resolution", () => {
      const result = closeRequestSchema.safeParse({
        requestUuid: "abc-123",
        resolution: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty requestUuid", () => {
      const result = closeRequestSchema.safeParse({
        requestUuid: "",
        resolution: "Valid resolution",
      });
      expect(result.success).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Output validation schemas
  // -----------------------------------------------------------------------

  describe("listRequestsOutputSchema", () => {
    it("validates a valid paginated output", () => {
      const result = listRequestsOutputSchema.safeParse({
        items: [
          {
            request_uuid: "uuid-1",
            title: "Senior Developer",
            company_name: "Acme Corp",
            staff_name: "Alice",
            position_type: "fulltime",
            no_of_employees: 2,
            status: "pending",
            priority: 1,
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
      const result = listRequestsOutputSchema.safeParse({
        items: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty title", () => {
      const result = listRequestsOutputSchema.safeParse({
        items: [
          {
            request_uuid: "uuid-1",
            title: "",
            company_name: null,
            staff_name: null,
            position_type: "fulltime",
            no_of_employees: null,
            status: "pending",
            priority: null,
            created_at: null,
            updated_at: null,
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("getRequestOutputSchema", () => {
    it("validates found request with relations", () => {
      const result = getRequestOutputSchema.safeParse({
        request: {
          request_uuid: "uuid-1",
          request_position_title: "Senior Developer",
          request_job_description: "Hiring a senior dev",
          request_compensation: "2000 KWD/month",
          request_status: "pending",
          request_feedback: null,
          request_priority: 1,
          request_started_at: null,
          request_finished_at: null,
          request_created_datetime: "2024-01-15T10:00:00.000Z",
          request_updated_datetime: null,
          company: { company_name: "Acme Corp", company_email: "hr@acme.com" },
          staff: { staff_name: "Alice", staff_email: "alice@acme.com" },
        },
        applications: [
          {
            application_uuid: "app-1",
            candidate_name: "John Doe",
            status: 0,
            created_at: "2024-01-16T10:00:00.000Z",
          },
        ],
        invitations: [
          {
            invitation_uuid: "inv-1",
            candidate_name: "Jane Smith",
            status: 0,
            created_at: "2024-01-16T11:00:00.000Z",
          },
        ],
        interviews: [
          {
            request_interview_uuid: "int-1",
            candidate_name: "Bob Wilson",
            interview_at: "2024-01-20T14:00:00.000Z",
            status: 0,
          },
        ],
        metrics: [
          { label: "Applications", value: 1, note: "Candidates applied" },
          { label: "Invitations", value: 1, note: "Candidates invited" },
          { label: "Interviews", value: 1, note: "Scheduled" },
          { label: "Status", value: "pending", note: "Priority: 1" },
        ],
      });
      expect(result.success).toBe(true);
    });

    it("validates null request (not found)", () => {
      const result = getRequestOutputSchema.safeParse({
        request: null,
        applications: [],
        invitations: [],
        interviews: [],
        metrics: [],
      });
      expect(result.success).toBe(true);
    });

    it("validates with null company/staff", () => {
      const result = getRequestOutputSchema.safeParse({
        request: {
          request_uuid: "uuid-1",
          request_position_title: null,
          request_job_description: "Hiring",
          request_compensation: "Negotiable",
          request_status: null,
          request_feedback: null,
          request_priority: null,
          request_started_at: null,
          request_finished_at: null,
          request_created_datetime: null,
          request_updated_datetime: null,
          company: null,
          staff: null,
        },
        applications: [],
        invitations: [],
        interviews: [],
        metrics: [],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("updateRequestStatusOutputSchema", () => {
    it("validates success result", () => {
      const result = updateRequestStatusOutputSchema.safeParse({
        operation: "success",
        message: "Request status updated",
      });
      expect(result.success).toBe(true);
    });

    it("validates error result", () => {
      const result = updateRequestStatusOutputSchema.safeParse({
        operation: "error",
        message: "Request not found",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid operation", () => {
      const result = updateRequestStatusOutputSchema.safeParse({
        operation: "invalid",
        message: "msg",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty message", () => {
      const result = updateRequestStatusOutputSchema.safeParse({
        operation: "success",
        message: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("approveRequestOutputSchema", () => {
    it("validates success", () => {
      const result = approveRequestOutputSchema.safeParse({
        operation: "success",
        message: "Request approved",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("rejectRequestOutputSchema", () => {
    it("validates success", () => {
      const result = rejectRequestOutputSchema.safeParse({
        operation: "success",
        message: "Request rejected",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("closeRequestOutputSchema", () => {
    it("validates success", () => {
      const result = closeRequestOutputSchema.safeParse({
        operation: "success",
        message: "Request closed",
      });
      expect(result.success).toBe(true);
    });
  });
});
