import { describe, it, expect } from "vitest";
import {
  listStaffInterviewsSchema,
  getStaffInterviewDetailSchema,
  updateInterviewStatusSchema,
  updateInterviewNotesSchema,
  interviewRowOutputSchema,
  interviewListOutputSchema,
  interviewDetailOutputSchema,
  updateInterviewStatusOutputSchema,
  updateInterviewNotesOutputSchema,
} from "./schemas";

/**
 * Page migration test for staff/interviews.
 *
 * Verifies the data contract between page and action.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("staff interviews page — data contract", () => {
  it("listStaffInterviewsSchema accepts valid input", () => {
    const r = listStaffInterviewsSchema.safeParse({
      page: 1,
      limit: 20,
      status: "1",
      q: "search",
    });
    expect(r.success).toBe(true);
  });

  it("listStaffInterviewsSchema accepts empty input (defaults)", () => {
    const r = listStaffInterviewsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("listStaffInterviewsSchema rejects invalid status", () => {
    const r = listStaffInterviewsSchema.safeParse({ status: "9" });
    expect(r.success).toBe(false);
  });

  it("getStaffInterviewDetailSchema validates with interviewUuid", () => {
    const r = getStaffInterviewDetailSchema.safeParse({
      interviewUuid: "uuid-123",
    });
    expect(r.success).toBe(true);
  });

  it("getStaffInterviewDetailSchema rejects missing uuid", () => {
    const r = getStaffInterviewDetailSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("updateInterviewStatusSchema validates with uuid and status", () => {
    const r = updateInterviewStatusSchema.safeParse({
      interviewUuid: "uuid-123",
      status: "1",
    });
    expect(r.success).toBe(true);
  });

  it("updateInterviewStatusSchema rejects invalid status", () => {
    const r = updateInterviewStatusSchema.safeParse({
      interviewUuid: "uuid-123",
      status: "invalid",
    });
    expect(r.success).toBe(false);
  });

  it("updateInterviewNotesSchema validates with uuid only", () => {
    const r = updateInterviewNotesSchema.safeParse({
      interviewUuid: "uuid-123",
    });
    expect(r.success).toBe(true);
  });

  it("updateInterviewNotesSchema validates with all fields", () => {
    const r = updateInterviewNotesSchema.safeParse({
      interviewUuid: "uuid-123",
      internalNote: "Internal note",
      interviewNote: "Interview note",
    });
    expect(r.success).toBe(true);
  });

  it("interviewRowOutputSchema validates a row", () => {
    const r = interviewRowOutputSchema.safeParse({
      id: "uuid-1",
      candidate: "John Doe",
      candidateEmail: "john@test.com",
      candidateId: 42,
      requestTitle: "Software Engineer",
      requestUuid: "req-uuid",
      scheduledAt: "2026-06-15T10:00:00Z",
      status: "1",
      note: "Candidate confirmed",
    });
    expect(r.success).toBe(true);
  });

  it("interviewListOutputSchema validates paginated result", () => {
    const r = interviewListOutputSchema.safeParse({
      items: [
        {
          id: "uuid-1",
          candidate: "John Doe",
          candidateEmail: "john@test.com",
          candidateId: null,
          requestTitle: "Engineer",
          requestUuid: "req-uuid",
          scheduledAt: "2026-06-15T10:00:00Z",
          status: "1",
          note: "",
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("interviewDetailOutputSchema validates detail", () => {
    const r = interviewDetailOutputSchema.safeParse({
      interviewUuid: "uuid-123",
      candidateName: "John Doe",
      candidateEmail: "john@test.com",
      candidatePhone: "+96512345678",
      candidateId: 42,
      requestTitle: "Engineer",
      requestUuid: "req-uuid",
      companyName: "Acme Corp",
      scheduledAt: new Date("2026-06-15T10:00:00Z"),
      status: 1,
      interviewNote: "Good candidate",
      note: "Follow up",
      staffName: "Staff User",
      createdAt: new Date("2026-06-01T00:00:00Z"),
      updatedAt: new Date("2026-06-10T00:00:00Z"),
    });
    expect(r.success).toBe(true);
  });

  it("updateInterviewStatusOutputSchema validates response", () => {
    const r = updateInterviewStatusOutputSchema.safeParse({
      operation: "success",
      message: "Status updated",
    });
    expect(r.success).toBe(true);
  });

  it("updateInterviewNotesOutputSchema validates response", () => {
    const r = updateInterviewNotesOutputSchema.safeParse({
      operation: "error",
      message: "Note required",
    });
    expect(r.success).toBe(true);
  });
});
