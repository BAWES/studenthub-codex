import { describe, it, expect } from "vitest";
import {
  VALID_REQUEST_STATUSES,
  listStaffRequestsSchema,
  getStaffRequestDetailSchema,
  updateRequestStatusSchema,
  staffRequestRowOutputSchema,
  staffRequestListOutputSchema,
  requestCandidateOutputSchema,
  staffRequestDetailOutputSchema,
  updateRequestStatusOutputSchema,
} from "./schemas";

/**
 * Page migration test for staff/requests.
 *
 * Verifies the data contract between page and action.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("staff requests page — data contract", () => {
  it("VALID_REQUEST_STATUSES has expected values", () => {
    expect(VALID_REQUEST_STATUSES).toEqual(["pending", "started", "delivered"]);
  });

  it("listStaffRequestsSchema accepts valid input", () => {
    const r = listStaffRequestsSchema.safeParse({
      page: 1,
      limit: 20,
      status: "pending",
      q: "developer",
    });
    expect(r.success).toBe(true);
  });

  it("listStaffRequestsSchema accepts empty input (defaults)", () => {
    const r = listStaffRequestsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("listStaffRequestsSchema rejects invalid status", () => {
    const r = listStaffRequestsSchema.safeParse({ status: "invalid" });
    expect(r.success).toBe(false);
  });

  it("getStaffRequestDetailSchema validates with requestUuid", () => {
    const r = getStaffRequestDetailSchema.safeParse({
      requestUuid: "req-123",
    });
    expect(r.success).toBe(true);
  });

  it("getStaffRequestDetailSchema rejects missing uuid", () => {
    const r = getStaffRequestDetailSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("updateRequestStatusSchema validates with uuid and status", () => {
    const r = updateRequestStatusSchema.safeParse({
      requestUuid: "req-123",
      status: "started",
      feedback: "Proceeding with recruitment",
    });
    expect(r.success).toBe(true);
  });

  it("updateRequestStatusSchema accepts minimal input (no feedback)", () => {
    const r = updateRequestStatusSchema.safeParse({
      requestUuid: "req-123",
      status: "delivered",
    });
    expect(r.success).toBe(true);
  });

  it("updateRequestStatusSchema rejects invalid status", () => {
    const r = updateRequestStatusSchema.safeParse({
      requestUuid: "req-123",
      status: "cancelled",
    });
    expect(r.success).toBe(false);
  });

  it("staffRequestRowOutputSchema validates a row", () => {
    const r = staffRequestRowOutputSchema.safeParse({
      id: "req-123",
      title: "Software Engineer",
      company: "Acme Corp",
      seats: 3,
      status: "pending",
      updated: "2026-06-01T00:00:00Z",
    });
    expect(r.success).toBe(true);
  });

  it("staffRequestListOutputSchema validates paginated result", () => {
    const r = staffRequestListOutputSchema.safeParse({
      items: [
        {
          id: "req-123",
          title: "Engineer",
          company: "Acme",
          seats: 1,
          status: "pending",
          updated: "2026-06-01T00:00:00Z",
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("requestCandidateOutputSchema validates candidate application", () => {
    const r = requestCandidateOutputSchema.safeParse({
      uuid: "cand-uuid",
      name: "John Doe",
      email: "john@test.com",
      applicationStatus: 0,
      appliedAt: new Date("2026-06-01T00:00:00Z"),
    });
    expect(r.success).toBe(true);
  });

  it("staffRequestDetailOutputSchema validates full detail", () => {
    const r = staffRequestDetailOutputSchema.safeParse({
      requestUuid: "req-123",
      positionTitle: "Software Engineer",
      jobDescription: "Full-stack developer",
      compensation: "800 KWD/month",
      seats: 2,
      location: "Kuwait City",
      status: "started",
      priority: 1,
      assignedAt: new Date("2026-06-01T00:00:00Z"),
      startedAt: new Date("2026-06-02T00:00:00Z"),
      finishedAt: null,
      updatedAt: new Date("2026-06-10T00:00:00Z"),
      createdAt: new Date("2026-06-01T00:00:00Z"),
      company: {
        company_id: 1,
        company_name: "Acme Corp",
        company_email: "hr@acme.com",
      },
      contact: {
        contact_name: "Jane Contact",
        contact_email: "jane@acme.com",
      },
      staff: {
        staff_name: "Staff User",
        staff_email: "staff@studenthub.ai",
      },
      candidates: [
        {
          uuid: "cand-uuid",
          name: "John Doe",
          email: "john@test.com",
          applicationStatus: 0,
          appliedAt: new Date("2026-06-03T00:00:00Z"),
        },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("updateRequestStatusOutputSchema validates response", () => {
    const r = updateRequestStatusOutputSchema.safeParse({
      operation: "success",
      message: "Status updated to started",
    });
    expect(r.success).toBe(true);
  });
});
