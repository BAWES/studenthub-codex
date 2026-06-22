import { describe, it, expect } from "vitest";
import {
  interviewRowOutputSchema,
  interviewListOutputSchema,
  interviewDetailOutputSchema,
  updateInterviewStatusOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Output schema validation tests
// ---------------------------------------------------------------------------

describe("interviewRowOutputSchema", () => {
  const validRow = {
    id: "int_abc123",
    candidate: "Jane Doe",
    candidateEmail: "jane@example.com",
    candidateId: 42,
    requestTitle: "Software Engineer",
    requestUuid: "req_abc123",
    scheduledAt: "2026-06-20T10:00:00",
    status: "0",
    note: "Candidate is confirmed",
  };

  it("accepts a valid interview row", () => {
    expect(interviewRowOutputSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts null candidateId", () => {
    expect(
      interviewRowOutputSchema.safeParse({ ...validRow, candidateId: null })
        .success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validRow;
    expect(interviewRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for candidateId", () => {
    expect(
      interviewRowOutputSchema.safeParse({
        ...validRow,
        candidateId: "42",
      }).success,
    ).toBe(false);
  });

  it("accepts empty candidate name (z.string() without .min() accepts empty)", () => {
    expect(
      interviewRowOutputSchema.safeParse({ ...validRow, candidate: "" }).success,
    ).toBe(true);
  });
});

describe("interviewListOutputSchema", () => {
  const validList = {
    items: [
      {
        id: "int_1",
        candidate: "Jane Doe",
        candidateEmail: "jane@example.com",
        candidateId: null,
        requestTitle: "Engineer",
        requestUuid: "req_1",
        scheduledAt: "2026-06-20T10:00:00",
        status: "0",
        note: "Confirmed",
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid paginated result", () => {
    expect(interviewListOutputSchema.safeParse(validList).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      interviewListOutputSchema.safeParse({
        ...validList,
        items: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validList;
    expect(interviewListOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      interviewListOutputSchema.safeParse({ ...validList, total: -1 }).success,
    ).toBe(false);
  });
});

describe("interviewDetailOutputSchema", () => {
  const validDetail = {
    interviewUuid: "int_abc123",
    candidateName: "Jane Doe",
    candidateEmail: "jane@example.com",
    candidatePhone: "+965****5678",
    candidateId: 42,
    requestTitle: "Software Engineer",
    requestUuid: "req_abc123",
    companyName: "Acme Corp",
    scheduledAt: new Date("2026-06-20T10:00:00"),
    status: 0,
    interviewNote: "Good communication skills",
    note: "Internal: schedule follow-up",
    staffName: "John Recruiter",
    createdAt: new Date("2026-06-15T10:00:00"),
    updatedAt: new Date("2026-06-15T10:00:00"),
  };

  it("accepts a valid interview detail", () => {
    expect(interviewDetailOutputSchema.safeParse(validDetail).success).toBe(
      true,
    );
  });

  it("accepts null fields", () => {
    expect(
      interviewDetailOutputSchema.safeParse({
        ...validDetail,
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
      }).success,
    ).toBe(true);
  });

  it("rejects missing interviewUuid", () => {
    const { interviewUuid: _, ...rest } = validDetail;
    expect(interviewDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects string instead of Date for scheduledAt", () => {
    expect(
      interviewDetailOutputSchema.safeParse({
        ...validDetail,
        scheduledAt: "2026-06-20T10:00:00",
      }).success,
    ).toBe(false);
  });

  it("rejects string instead of number for status", () => {
    expect(
      interviewDetailOutputSchema.safeParse({
        ...validDetail,
        status: "0",
      }).success,
    ).toBe(false);
  });
});

describe("updateInterviewStatusOutputSchema", () => {
  it("accepts success response", () => {
    expect(
      updateInterviewStatusOutputSchema.safeParse({
        operation: "success",
        message: "Status updated",
      }).success,
    ).toBe(true);
  });

  it("accepts error response", () => {
    expect(
      updateInterviewStatusOutputSchema.safeParse({
        operation: "error",
        message: "Interview not found",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid operation", () => {
    expect(
      updateInterviewStatusOutputSchema.safeParse({
        operation: "invalid",
        message: "Something",
      }).success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(
      updateInterviewStatusOutputSchema.safeParse({
        operation: "success",
      }).success,
    ).toBe(false);
  });
});
