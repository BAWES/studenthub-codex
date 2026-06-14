import { describe, it, expect } from "vitest";
import {
  staffRequestRowOutputSchema,
  staffRequestListOutputSchema,
  requestCandidateOutputSchema,
  staffRequestDetailOutputSchema,
  updateRequestStatusOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// staffRequestRowOutputSchema
// ---------------------------------------------------------------------------

describe("staffRequestRowOutputSchema", () => {
  const validRow = () => ({
    id: "req-001",
    title: "Need Software Engineer",
    company: "Acme Corp",
    seats: 3,
    status: "pending",
    updated: "2026-06-01T10:00:00Z",
  });

  it("accepts a valid request row", () => {
    const r = staffRequestRowOutputSchema.safeParse(validRow());
    expect(r.success).toBe(true);
  });

  it("rejects non-integer seats", () => {
    expect(
      staffRequestRowOutputSchema.safeParse({ ...validRow(), seats: "three" }).success,
    ).toBe(false);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validRow();
    expect(staffRequestRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing title", () => {
    const { title: _, ...rest } = validRow();
    expect(staffRequestRowOutputSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// staffRequestListOutputSchema
// ---------------------------------------------------------------------------

describe("staffRequestListOutputSchema", () => {
  const validRow = () => ({
    id: "req-001",
    title: "Engineer",
    company: "Acme",
    seats: 1,
    status: "pending",
    updated: "2026-06-01T00:00:00Z",
  });

  it("accepts a valid paginated result", () => {
    const r = staffRequestListOutputSchema.safeParse({
      items: [validRow()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty items", () => {
    const r = staffRequestListOutputSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects non-positive page", () => {
    expect(
      staffRequestListOutputSchema.safeParse({ items: [], total: 0, page: 0, limit: 20, totalPages: 0 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// requestCandidateOutputSchema
// ---------------------------------------------------------------------------

describe("requestCandidateOutputSchema", () => {
  const validCandidate = () => ({
    uuid: "cand-001",
    name: "John Doe",
    email: "john@example.com",
    applicationStatus: 1,
    appliedAt: new Date("2026-06-01"),
  });

  it("accepts a valid candidate", () => {
    const r = requestCandidateOutputSchema.safeParse(validCandidate());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields", () => {
    const r = requestCandidateOutputSchema.safeParse({
      ...validCandidate(),
      name: null,
      email: null,
      applicationStatus: null,
      appliedAt: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing uuid", () => {
    const { uuid: _, ...rest } = validCandidate();
    expect(requestCandidateOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-integer applicationStatus", () => {
    expect(
      requestCandidateOutputSchema.safeParse({ ...validCandidate(), applicationStatus: "pending" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// staffRequestDetailOutputSchema
// ---------------------------------------------------------------------------

describe("staffRequestDetailOutputSchema", () => {
  const validDetail = () => ({
    requestUuid: "req-001",
    positionTitle: "Software Engineer",
    jobDescription: "Full-stack developer needed",
    compensation: "1200 KWD",
    seats: 2,
    location: "Kuwait City",
    status: "pending",
    priority: 1,
    assignedAt: null,
    startedAt: null,
    finishedAt: null,
    updatedAt: new Date("2026-06-10"),
    createdAt: new Date("2026-06-01"),
    company: { company_id: 10, company_name: "Acme Corp", company_email: "hr@acme.com" },
    contact: { contact_name: "Hassan", contact_email: "hassan@acme.com" },
    staff: { staff_name: "Staff User", staff_email: "staff@example.com" },
    candidates: [
      {
        uuid: "cand-001",
        name: "Jane",
        email: "jane@example.com",
        applicationStatus: 2,
        appliedAt: new Date("2026-06-05"),
      },
    ],
  });

  it("accepts a valid detail object", () => {
    const r = staffRequestDetailOutputSchema.safeParse(validDetail());
    expect(r.success).toBe(true);
  });

  it("accepts nullable sub-objects and fields", () => {
    const r = staffRequestDetailOutputSchema.safeParse({
      ...validDetail(),
      positionTitle: null,
      location: null,
      status: null,
      priority: null,
      assignedAt: null,
      startedAt: null,
      finishedAt: null,
      company: null,
      contact: null,
      staff: null,
      candidates: [],
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing requestUuid", () => {
    const { requestUuid: _, ...rest } = validDetail();
    expect(staffRequestDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-array candidates", () => {
    expect(
      staffRequestDetailOutputSchema.safeParse({ ...validDetail(), candidates: "none" }).success,
    ).toBe(false);
  });

  it("rejects non-integer company_id", () => {
    expect(
      staffRequestDetailOutputSchema.safeParse({
        ...validDetail(),
        company: { company_id: "ten", company_name: "Acme", company_email: null },
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateRequestStatusOutputSchema
// ---------------------------------------------------------------------------

describe("updateRequestStatusOutputSchema", () => {
  it("accepts success operation", () => {
    const r = updateRequestStatusOutputSchema.safeParse({ operation: "success", message: "Updated" });
    expect(r.success).toBe(true);
  });

  it("accepts error operation", () => {
    const r = updateRequestStatusOutputSchema.safeParse({ operation: "error", message: "Failed" });
    expect(r.success).toBe(true);
  });

  it("rejects invalid operation", () => {
    const r = updateRequestStatusOutputSchema.safeParse({ operation: "unknown", message: "Bad" });
    expect(r.success).toBe(false);
  });

  it("rejects missing message", () => {
    const r = updateRequestStatusOutputSchema.safeParse({ operation: "success" });
    expect(r.success).toBe(false);
  });

  it("rejects non-string message", () => {
    const r = updateRequestStatusOutputSchema.safeParse({ operation: "error", message: 42 });
    expect(r.success).toBe(false);
  });
});
