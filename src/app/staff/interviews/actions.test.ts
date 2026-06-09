import { describe, it, expect } from "vitest";
import {
  listStaffInterviewsSchema,
  getStaffInterviewDetailSchema,
  updateInterviewStatusSchema,
} from "./actions";

// ---------------------------------------------------------------------------
// listStaffInterviewsSchema
// ---------------------------------------------------------------------------

describe("listStaffInterviewsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listStaffInterviewsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const result = listStaffInterviewsSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("accepts status filter (0=scheduled, 1=completed, 2=cancelled)", () => {
    const result = listStaffInterviewsSchema.safeParse({ status: "0" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("0");
    }
  });

  it("accepts completed status filter", () => {
    const result = listStaffInterviewsSchema.safeParse({ status: "1" });
    expect(result.success).toBe(true);
  });

  it("accepts cancelled status filter", () => {
    const result = listStaffInterviewsSchema.safeParse({ status: "2" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status filter", () => {
    const result = listStaffInterviewsSchema.safeParse({ status: "99" });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listStaffInterviewsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listStaffInterviewsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("accepts search query", () => {
    const result = listStaffInterviewsSchema.safeParse({ q: "developer" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe("developer");
    }
  });
});

// ---------------------------------------------------------------------------
// getStaffInterviewDetailSchema
// ---------------------------------------------------------------------------

describe("getStaffInterviewDetailSchema", () => {
  it("accepts a valid interview UUID", () => {
    const result = getStaffInterviewDetailSchema.safeParse({
      interviewUuid: "interview_abc-123-def-456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.interviewUuid).toBe("interview_abc-123-def-456");
    }
  });

  it("rejects empty UUID", () => {
    const result = getStaffInterviewDetailSchema.safeParse({ interviewUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getStaffInterviewDetailSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateInterviewStatusSchema
// ---------------------------------------------------------------------------

describe("updateInterviewStatusSchema", () => {
  it("accepts valid status update (complete)", () => {
    const result = updateInterviewStatusSchema.safeParse({
      interviewUuid: "interview_abc-123",
      status: "1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("1");
    }
  });

  it("accepts valid status update (cancel)", () => {
    const result = updateInterviewStatusSchema.safeParse({
      interviewUuid: "interview_abc-123",
      status: "2",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid status update (reset to scheduled)", () => {
    const result = updateInterviewStatusSchema.safeParse({
      interviewUuid: "interview_abc-123",
      status: "0",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = updateInterviewStatusSchema.safeParse({
      interviewUuid: "interview_abc-123",
      status: "99",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric status", () => {
    const result = updateInterviewStatusSchema.safeParse({
      interviewUuid: "interview_abc-123",
      status: "cancelled",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = updateInterviewStatusSchema.safeParse({ status: "1" });
    expect(result.success).toBe(false);
  });

  it("rejects missing status", () => {
    const result = updateInterviewStatusSchema.safeParse({
      interviewUuid: "interview_abc-123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty UUID", () => {
    const result = updateInterviewStatusSchema.safeParse({
      interviewUuid: "",
      status: "1",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

type InterviewRow = {
  id: string;
  candidate: string;
  requestTitle: string;
  scheduledAt: string;
  status: string;
  note: string;
};

type InterviewDetail = {
  interviewUuid: string;
  candidateName: string | null;
  candidateEmail: string | null;
  requestTitle: string | null;
  companyName: string | null;
  scheduledAt: Date | null;
  status: number | null;
  note: string | null;
};

type UpdateInterviewStatusResult = {
  operation: "success" | "error";
  message: string;
};

describe("InterviewRow shape", () => {
  it("defines the expected fields", () => {
    const mock: InterviewRow = {
      id: "interview_abc-123",
      candidate: "John Doe",
      requestTitle: "Senior Developer",
      scheduledAt: "2 hours ago",
      status: "Scheduled",
      note: "Internal note",
    };
    expect(mock.id).toBe("interview_abc-123");
    expect(mock.candidate).toBe("John Doe");
    expect(mock.status).toBe("Scheduled");
  });
});

describe("InterviewDetail shape", () => {
  it("accepts a valid detail object", () => {
    const detail: InterviewDetail = {
      interviewUuid: "interview_abc-123",
      candidateName: "John Doe",
      candidateEmail: "john@example.com",
      requestTitle: "Senior Developer",
      companyName: "Acme Corp",
      scheduledAt: new Date("2026-06-10T10:00:00Z"),
      status: 0,
      note: "Internal note",
    };
    expect(detail.candidateName).toBe("John Doe");
    expect(detail.companyName).toBe("Acme Corp");
    expect(detail.status).toBe(0);
  });
});

describe("UpdateInterviewStatusResult shape", () => {
  it("accepts a success result", () => {
    const result: UpdateInterviewStatusResult = {
      operation: "success",
      message: "Interview status updated",
    };
    expect(result.operation).toBe("success");
  });

  it("accepts an error result", () => {
    const result: UpdateInterviewStatusResult = {
      operation: "error",
      message: "Interview not found",
    };
    expect(result.operation).toBe("error");
  });
});
