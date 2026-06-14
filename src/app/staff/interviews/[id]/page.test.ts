import { describe, it, expect } from "vitest";
import {
  getInterviewSchema,
  updateInterviewNotesSchema,
  interviewDetailRouteOutputSchema,
  updateInterviewNotesOutputSchema,
} from "./schemas";

/**
 * Page data-contract tests for staff/interviews/[id].
 *
 * The page calls getStaffInterviewDetail (module-level) which returns
 * InterviewDetail | null. The route-level schemas include both input
 * validation and output validation for the interview detail action.
 *
 * The route actions.ts also has updateInterviewNotes which uses the
 * updateInterviewNotesOutputSchema.
 *
 * Tests verify input validation and output shapes for the interview
 * detail action and the notes-update action.
 */

describe("staff/interviews/[id] — getInterviewSchema", () => {
  it("accepts valid interview UUID", () => {
    const r = getInterviewSchema.safeParse({
      interviewUuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty interviewUuid", () => {
    const r = getInterviewSchema.safeParse({ interviewUuid: "" });
    expect(r.success).toBe(false);
  });

  it("rejects missing interviewUuid", () => {
    const r = getInterviewSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects null", () => {
    const r = getInterviewSchema.safeParse(null);
    expect(r.success).toBe(false);
  });
});

describe("staff/interviews/[id] — interviewDetailRouteOutputSchema", () => {
  it("accepts full interview detail", () => {
    const r = interviewDetailRouteOutputSchema.safeParse({
      interviewUuid: "550e8400-e29b-41d4-a716-446655440000",
      candidateName: "Alice",
      candidateEmail: "alice@example.com",
      candidatePhone: "+96550000000",
      candidateId: 42,
      requestTitle: "Software Engineer",
      requestUuid: "uu-123",
      companyName: "Company A",
      scheduledAt: new Date("2024-06-15T10:00:00Z"),
      status: 0,
      interviewNote: null,
      internalNote: null,
      staffName: "Bob",
      createdAt: new Date("2024-06-10T08:00:00Z"),
      updatedAt: null,
    });
    expect(r.success).toBe(true);
  });

  it("allows all nullable fields as null", () => {
    const r = interviewDetailRouteOutputSchema.safeParse({
      interviewUuid: "550e8400-e29b-41d4-a716-446655440000",
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
      internalNote: null,
      staffName: null,
      createdAt: null,
      updatedAt: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing interviewUuid", () => {
    const r = interviewDetailRouteOutputSchema.safeParse({
      candidateName: "Alice",
    });
    expect(r.success).toBe(false);
  });

  it("rejects null input", () => {
    const r = interviewDetailRouteOutputSchema.safeParse(null);
    expect(r.success).toBe(false);
  });

  it("rejects non-integer candidateId", () => {
    const r = interviewDetailRouteOutputSchema.safeParse({
      interviewUuid: "550e8400-e29b-41d4-a716-446655440000",
      candidateName: null,
      candidateEmail: null,
      candidatePhone: null,
      candidateId: "not-a-number",
      requestTitle: null,
      requestUuid: null,
      companyName: null,
      scheduledAt: null,
      status: null,
      interviewNote: null,
      internalNote: null,
      staffName: null,
      createdAt: null,
      updatedAt: null,
    });
    expect(r.success).toBe(false);
  });
});

describe("staff/interviews/[id] — updateInterviewNotesSchema", () => {
  it("accepts valid update with both notes", () => {
    const r = updateInterviewNotesSchema.safeParse({
      interviewUuid: "550e8400-e29b-41d4-a716-446655440000",
      internalNote: "Internal comment",
      interviewNote: "Interview feedback",
    });
    expect(r.success).toBe(true);
  });

  it("accepts update with only internal note", () => {
    const r = updateInterviewNotesSchema.safeParse({
      interviewUuid: "550e8400-e29b-41d4-a716-446655440000",
      internalNote: "Internal comment",
    });
    expect(r.success).toBe(true);
  });

  it("accepts update with only interview note", () => {
    const r = updateInterviewNotesSchema.safeParse({
      interviewUuid: "550e8400-e29b-41d4-a716-446655440000",
      interviewNote: "Interview feedback",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty interviewUuid", () => {
    const r = updateInterviewNotesSchema.safeParse({
      interviewUuid: "",
      internalNote: "Note",
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing interviewUuid", () => {
    const r = updateInterviewNotesSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

describe("staff/interviews/[id] — updateInterviewNotesOutputSchema", () => {
  it("accepts success operation", () => {
    const r = updateInterviewNotesOutputSchema.safeParse({
      operation: "success",
      message: "Notes updated",
    });
    expect(r.success).toBe(true);
  });

  it("accepts error operation", () => {
    const r = updateInterviewNotesOutputSchema.safeParse({
      operation: "error",
      message: "Interview not found",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty object", () => {
    const r = updateInterviewNotesOutputSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects invalid operation value", () => {
    const r = updateInterviewNotesOutputSchema.safeParse({
      operation: "invalid",
      message: "test",
    });
    expect(r.success).toBe(false);
  });

  it("rejects null", () => {
    const r = updateInterviewNotesOutputSchema.safeParse(null);
    expect(r.success).toBe(false);
  });
});
