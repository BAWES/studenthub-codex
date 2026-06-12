import { describe, it, expect } from "vitest";
import {
  interviewRowOutputSchema,
  interviewListOutputSchema,
  interviewDetailOutputSchema,
  updateInterviewStatusOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// interviewRowOutputSchema
// ---------------------------------------------------------------------------
const validInterviewRow = {
  id: "int-001",
  candidate: "Alice Smith",
  candidateEmail: "alice@example.com",
  candidateId: 42,
  requestTitle: "Senior Developer Request",
  requestUuid: "req-001",
  scheduledAt: "2025-06-01T10:00:00Z",
  status: "1",
  note: "Candidate seems promising.",
};

describe("interviewRowOutputSchema", () => {
  it("accepts a fully populated interview row", () => {
    expect(interviewRowOutputSchema.safeParse(validInterviewRow).success).toBe(true);
  });

  it("accepts with candidateId set to null", () => {
    const data = { ...validInterviewRow, candidateId: null };
    expect(interviewRowOutputSchema.safeParse(data).success).toBe(true);
  });

  it("rejects when id is missing", () => {
    const { id, ...rest } = validInterviewRow;
    expect(interviewRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects when candidate is missing", () => {
    const { candidate, ...rest } = validInterviewRow;
    expect(interviewRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects when candidateEmail is missing", () => {
    const { candidateEmail, ...rest } = validInterviewRow;
    expect(interviewRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects when candidateId is a float instead of int or null", () => {
    const data = { ...validInterviewRow, candidateId: 42.5 };
    expect(interviewRowOutputSchema.safeParse(data).success).toBe(false);
  });

  it("rejects when status is not a string", () => {
    const data = { ...validInterviewRow, status: 1 };
    expect(interviewRowOutputSchema.safeParse(data).success).toBe(false);
  });

  it("rejects when scheduledAt is missing", () => {
    const { scheduledAt, ...rest } = validInterviewRow;
    expect(interviewRowOutputSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// interviewListOutputSchema
// ---------------------------------------------------------------------------
describe("interviewListOutputSchema", () => {
  it("accepts a valid interview list response", () => {
    const data = {
      items: [validInterviewRow],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(interviewListOutputSchema.safeParse(data).success).toBe(true);
  });

  it("accepts an empty items array", () => {
    const data = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(interviewListOutputSchema.safeParse(data).success).toBe(true);
  });

  it("rejects when items is missing", () => {
    const { items, ...rest } = {
      items: [validInterviewRow],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(interviewListOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects when total is negative", () => {
    const data = {
      items: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(interviewListOutputSchema.safeParse(data).success).toBe(false);
  });

  it("rejects when page is zero (must be positive)", () => {
    const data = {
      items: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    };
    expect(interviewListOutputSchema.safeParse(data).success).toBe(false);
  });

  it("rejects when limit is not positive", () => {
    const data = {
      items: [],
      total: 0,
      page: 1,
      limit: 0,
      totalPages: 0,
    };
    expect(interviewListOutputSchema.safeParse(data).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// interviewDetailOutputSchema
// ---------------------------------------------------------------------------
const validInterviewDetail = {
  interviewUuid: "int-001",
  candidateName: "Alice Smith",
  candidateEmail: "alice@example.com",
  candidatePhone: "+1-555-0100",
  candidateId: 42,
  requestTitle: "Senior Developer Request",
  requestUuid: "req-001",
  companyName: "Acme Corp",
  scheduledAt: new Date("2025-06-01T10:00:00Z"),
  status: 1,
  interviewNote: "Great candidate.",
  note: "Internal note about the candidate.",
  staffName: "Bob Reviewer",
  createdAt: new Date("2025-05-20T08:00:00Z"),
  updatedAt: new Date("2025-06-01T12:00:00Z"),
};

describe("interviewDetailOutputSchema", () => {
  it("accepts a fully populated interview detail", () => {
    expect(interviewDetailOutputSchema.safeParse(validInterviewDetail).success).toBe(true);
  });

  it("accepts with all nullable fields set to null", () => {
    const data = {
      ...validInterviewDetail,
      candidateName: null,
      candidateEmail: null,
      candidatePhone: null,
      candidateId: null,
      requestTitle: null,
      requestUuid: null,
      companyName: null,
      scheduledAt: null,
      status: null,
      interviewNote: null,
      note: null,
      staffName: null,
      createdAt: null,
      updatedAt: null,
    };
    expect(interviewDetailOutputSchema.safeParse(data).success).toBe(true);
  });

  it("rejects when interviewUuid is missing", () => {
    const { interviewUuid, ...rest } = validInterviewDetail;
    expect(interviewDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects when scheduledAt is not a Date", () => {
    const data = { ...validInterviewDetail, scheduledAt: "2025-06-01T10:00:00Z" };
    expect(interviewDetailOutputSchema.safeParse(data).success).toBe(false);
  });

  it("rejects when candidateId is not an integer", () => {
    const data = { ...validInterviewDetail, candidateId: 42.5 };
    expect(interviewDetailOutputSchema.safeParse(data).success).toBe(false);
  });

  it("rejects when status is not a number", () => {
    const data = { ...validInterviewDetail, status: "1" };
    expect(interviewDetailOutputSchema.safeParse(data).success).toBe(false);
  });

  it("rejects when createdAt is not a Date", () => {
    const data = { ...validInterviewDetail, createdAt: "2025-05-20T08:00:00Z" };
    expect(interviewDetailOutputSchema.safeParse(data).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateInterviewStatusOutputSchema
// ---------------------------------------------------------------------------
describe("updateInterviewStatusOutputSchema", () => {
  it("accepts a success operation", () => {
    expect(
      updateInterviewStatusOutputSchema.safeParse({ operation: "success", message: "Status updated" }).success
    ).toBe(true);
  });

  it("accepts an error operation", () => {
    expect(
      updateInterviewStatusOutputSchema.safeParse({ operation: "error", message: "Interview not found" }).success
    ).toBe(true);
  });

  it("rejects when operation is missing", () => {
    expect(updateInterviewStatusOutputSchema.safeParse({ message: "Status updated" }).success).toBe(false);
  });

  it("rejects when message is missing", () => {
    expect(updateInterviewStatusOutputSchema.safeParse({ operation: "success" }).success).toBe(false);
  });

  it("rejects an invalid operation value", () => {
    expect(
      updateInterviewStatusOutputSchema.safeParse({ operation: "invalid", message: "test" }).success
    ).toBe(false);
  });

  it("rejects when operation is not a string", () => {
    expect(
      updateInterviewStatusOutputSchema.safeParse({ operation: 1, message: "test" }).success
    ).toBe(false);
  });
});
