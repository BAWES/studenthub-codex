import { describe, it, expect } from "vitest";
import {
  listStaffInterviewsSchema,
  getStaffInterviewDetailSchema,
  updateInterviewStatusSchema,
  formatInterviewDate,
  interviewStatusLabel,
} from "./schemas";

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
// Helper functions
// ---------------------------------------------------------------------------

describe("formatInterviewDate", () => {
  it("returns 'Not scheduled' for null", () => {
    expect(formatInterviewDate(null)).toBe("Not scheduled");
  });

  it("returns 'Not scheduled' for undefined", () => {
    expect(formatInterviewDate(undefined)).toBe("Not scheduled");
  });

  it("returns formatted string for a past date (days)", () => {
    const past = new Date();
    past.setDate(past.getDate() - 3);
    const result = formatInterviewDate(past);
    expect(result).toMatch(/\d+d ago/);
  });

  it("returns hours ago for recent dates", () => {
    const recent = new Date();
    recent.setHours(recent.getHours() - 5);
    const result = formatInterviewDate(recent);
    expect(result).toMatch(/\d+h ago/);
  });

  it("returns minutes ago for very recent dates", () => {
    const recent = new Date();
    recent.setMinutes(recent.getMinutes() - 10);
    const result = formatInterviewDate(recent);
    expect(result).toMatch(/\d+m ago/);
  });

  it("returns 'just now' for dates less than a minute ago", () => {
    const now = new Date();
    expect(formatInterviewDate(now)).toBe("just now");
  });

  it("returns locale date for dates older than 7 days", () => {
    const old = new Date("2026-01-01");
    const result = formatInterviewDate(old);
    expect(result).toMatch(/Jan 1, 2026|January 1, 2026/);
  });
});

describe("interviewStatusLabel", () => {
  it('returns "Scheduled" for status 0', () => {
    expect(interviewStatusLabel(0)).toBe("Scheduled");
  });

  it('returns "Completed" for status 1', () => {
    expect(interviewStatusLabel(1)).toBe("Completed");
  });

  it('returns "Cancelled" for status 2', () => {
    expect(interviewStatusLabel(2)).toBe("Cancelled");
  });

  it('returns "Scheduled" for null', () => {
    expect(interviewStatusLabel(null)).toBe("Scheduled");
  });

  it('returns "Scheduled" for undefined', () => {
    expect(interviewStatusLabel(undefined)).toBe("Scheduled");
  });

  it('returns "Scheduled" for unknown status', () => {
    expect(interviewStatusLabel(99)).toBe("Scheduled");
  });
});
