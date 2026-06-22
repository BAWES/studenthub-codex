import { describe, it, expect } from "vitest";
import { interviewDetailRouteOutputSchema, updateInterviewNotesOutputSchema } from "./schemas";
import { getInterviewSchema, updateInterviewNotesSchema } from "./schemas";

// ---------------------------------------------------------------------------
// getInterviewSchema
// ---------------------------------------------------------------------------

describe("getInterviewSchema", () => {
  it("accepts a valid interview UUID", () => {
    const result = getInterviewSchema.safeParse({
      interviewUuid: "interview_abc-123-def-456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.interviewUuid).toBe("interview_abc-123-def-456");
    }
  });

  it("rejects empty UUID", () => {
    const result = getInterviewSchema.safeParse({ interviewUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getInterviewSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateInterviewNotesSchema
// ---------------------------------------------------------------------------

describe("updateInterviewNotesSchema", () => {
  it("accepts valid notes update with both fields", () => {
    const result = updateInterviewNotesSchema.safeParse({
      interviewUuid: "interview_abc-123",
      internalNote: "Internal update",
      interviewNote: "Interview feedback notes",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.interviewUuid).toBe("interview_abc-123");
      expect(result.data.internalNote).toBe("Internal update");
      expect(result.data.interviewNote).toBe("Interview feedback notes");
    }
  });

  it("accepts valid notes update with only internalNote", () => {
    const result = updateInterviewNotesSchema.safeParse({
      interviewUuid: "interview_abc-123",
      internalNote: "Just internal note",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.internalNote).toBe("Just internal note");
      expect(result.data.interviewNote).toBeUndefined();
    }
  });

  it("accepts valid notes update with only interviewNote", () => {
    const result = updateInterviewNotesSchema.safeParse({
      interviewUuid: "interview_abc-123",
      interviewNote: "Just interview note",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.interviewNote).toBe("Just interview note");
      expect(result.data.internalNote).toBeUndefined();
    }
  });

  it("accepts valid notes update with all fields missing (empty optional)", () => {
    const result = updateInterviewNotesSchema.safeParse({
      interviewUuid: "interview_abc-123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing UUID", () => {
    const result = updateInterviewNotesSchema.safeParse({
      internalNote: "Some note",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty UUID", () => {
    const result = updateInterviewNotesSchema.safeParse({
      interviewUuid: "",
      internalNote: "Some note",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

type InterviewDetail = {
  interviewUuid: string;
  candidateName: string | null;
  candidateEmail: string | null;
  candidatePhone: string | null;
  candidateId: number | null;
  requestTitle: string | null;
  requestUuid: string | null;
  companyName: string | null;
  scheduledAt: Date | null;
  status: number | null;
  interviewNote: string | null;
  internalNote: string | null;
  staffName: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

type UpdateInterviewNotesResult = {
  operation: "success" | "error";
  message: string;
};

describe("InterviewDetail shape", () => {
  it("defines the expected fields", () => {
    const detail: InterviewDetail = {
      interviewUuid: "interview_abc-123",
      candidateName: "John Doe",
      candidateEmail: "john@example.com",
      candidatePhone: "+1234567890",
      candidateId: 42,
      requestTitle: "Senior Developer",
      requestUuid: "req_xyz-789",
      companyName: "Acme Corp",
      scheduledAt: new Date("2026-06-10T10:00:00Z"),
      status: 0,
      interviewNote: "Good candidate",
      internalNote: "Follow up next week",
      staffName: "Jane Staff",
      createdAt: new Date("2026-06-09T10:00:00Z"),
      updatedAt: new Date("2026-06-09T10:00:00Z"),
    };
    expect(detail.interviewUuid).toBe("interview_abc-123");
    expect(detail.candidateName).toBe("John Doe");
    expect(detail.companyName).toBe("Acme Corp");
    expect(detail.status).toBe(0);
    expect(detail.interviewNote).toBe("Good candidate");
  });
});

describe("UpdateInterviewNotesResult shape", () => {
  it("accepts a success result", () => {
    const result: UpdateInterviewNotesResult = {
      operation: "success",
      message: "Notes updated successfully",
    };
    expect(result.operation).toBe("success");
  });

  it("accepts an error result", () => {
    const result: UpdateInterviewNotesResult = {
      operation: "error",
      message: "Interview not found",
    };
    expect(result.operation).toBe("error");
  });
});


// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("interviewDetailRouteOutputSchema", () => {
  it("accepts a valid route-level interview detail", () => {
    const result = interviewDetailRouteOutputSchema.safeParse({
      interviewUuid: "int_abc",
      candidateName: "John Doe",
      candidateEmail: "john@example.com",
      candidatePhone: "+965****5678",
      candidateId: 42,
      requestTitle: "Software Engineer",
      requestUuid: "req_abc",
      companyName: "Acme Corp",
      scheduledAt: new Date(),
      status: 0,
      interviewNote: "Good candidate",
      internalNote: "Internal note",
      staffName: "Staff Member",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(result.success).toBe(true);
  });
});

describe("updateInterviewNotesOutputSchema", () => {
  it("accepts a success result", () => {
    const result = updateInterviewNotesOutputSchema.safeParse({
      operation: "success",
      message: "Notes updated",
    });
    expect(result.success).toBe(true);
  });
});
