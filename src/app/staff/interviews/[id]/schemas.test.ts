import { describe, it, expect } from "vitest";
import {
  interviewDetailRouteOutputSchema,
  updateInterviewNotesOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// interviewDetailRouteOutputSchema
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
  interviewNote: "Great candidate, strong technical skills.",
  internalNote: "Follow up next week.",
  staffName: "Bob Reviewer",
  createdAt: new Date("2025-05-20T08:00:00Z"),
  updatedAt: new Date("2025-06-01T12:00:00Z"),
};

describe("interviewDetailRouteOutputSchema", () => {
  it("accepts a fully populated interview detail", () => {
    expect(interviewDetailRouteOutputSchema.safeParse(validInterviewDetail).success).toBe(true);
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
      internalNote: null,
      staffName: null,
      createdAt: null,
      updatedAt: null,
    };
    expect(interviewDetailRouteOutputSchema.safeParse(data).success).toBe(true);
  });

  it("rejects when interviewUuid is missing", () => {
    const { interviewUuid, ...rest } = validInterviewDetail;
    expect(interviewDetailRouteOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects when interviewUuid is not a string", () => {
    const data = { ...validInterviewDetail, interviewUuid: 123 };
    expect(interviewDetailRouteOutputSchema.safeParse(data).success).toBe(false);
  });

  it("rejects when scheduledAt is not a Date", () => {
    const data = { ...validInterviewDetail, scheduledAt: "2025-06-01T10:00:00Z" };
    expect(interviewDetailRouteOutputSchema.safeParse(data).success).toBe(false);
  });

  it("rejects when candidateId is not an integer", () => {
    const data = { ...validInterviewDetail, candidateId: 42.5 };
    expect(interviewDetailRouteOutputSchema.safeParse(data).success).toBe(false);
  });

  it("rejects when status is not a number", () => {
    const data = { ...validInterviewDetail, status: "1" };
    expect(interviewDetailRouteOutputSchema.safeParse(data).success).toBe(false);
  });

  it("rejects when an extra unexpected field causes no harm (loose object check)", () => {
    // Zod's object schema ignores unknown keys by default, so extra fields are fine
    const data = { ...validInterviewDetail, extraField: "should be ignored" };
    expect(interviewDetailRouteOutputSchema.safeParse(data).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// updateInterviewNotesOutputSchema
// ---------------------------------------------------------------------------
describe("updateInterviewNotesOutputSchema", () => {
  it("accepts a success operation", () => {
    expect(
      updateInterviewNotesOutputSchema.safeParse({ operation: "success", message: "Notes updated" }).success
    ).toBe(true);
  });

  it("accepts an error operation", () => {
    expect(
      updateInterviewNotesOutputSchema.safeParse({ operation: "error", message: "Interview not found" }).success
    ).toBe(true);
  });

  it("rejects when operation is missing", () => {
    expect(updateInterviewNotesOutputSchema.safeParse({ message: "Notes updated" }).success).toBe(false);
  });

  it("rejects when message is missing", () => {
    expect(updateInterviewNotesOutputSchema.safeParse({ operation: "success" }).success).toBe(false);
  });

  it("rejects an invalid operation value", () => {
    expect(
      updateInterviewNotesOutputSchema.safeParse({ operation: "invalid", message: "test" }).success
    ).toBe(false);
  });

  it("rejects when operation is not a string", () => {
    expect(
      updateInterviewNotesOutputSchema.safeParse({ operation: 1, message: "test" }).success
    ).toBe(false);
  });
});
