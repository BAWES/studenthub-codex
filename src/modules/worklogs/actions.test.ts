import { describe, it, expect } from "vitest";
import {
  createWorklogSchema,
  listWorklogsSchema,
  updateWorklogSchema,
  deleteWorklogSchema,
  appealWorklogSchema,
} from "./actions";

// ---------------------------------------------------------------------------
// Pure logic: schema validation for worklog server actions
//
// These schemas are used internally by the server actions. Testing them
// separately avoids mocking "use server" dependencies (prisma, session).
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// createWorklogSchema tests
// ---------------------------------------------------------------------------

describe("createWorklogSchema", () => {
  it("accepts valid date and start time", () => {
    const result = createWorklogSchema.safeParse({
      date: "2026-06-09",
      startTime: "09:00",
    });
    expect(result.success).toBe(true);
  });

  it("accepts date, start time, and end time", () => {
    const result = createWorklogSchema.safeParse({
      date: "2026-06-09",
      startTime: "09:00",
      endTime: "17:00",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all optional fields", () => {
    const result = createWorklogSchema.safeParse({
      date: "2026-06-09",
      startTime: "09:00",
      endTime: "17:00",
      note: "Worked on candidate migration",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing date", () => {
    const result = createWorklogSchema.safeParse({
      startTime: "09:00",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date format", () => {
    const result = createWorklogSchema.safeParse({
      date: "09-06-2026",
      startTime: "09:00",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid time format", () => {
    const result = createWorklogSchema.safeParse({
      date: "2026-06-09",
      startTime: "9:00",
    });
    expect(result.success).toBe(false);
  });

  it("rejects too-long note", () => {
    const result = createWorklogSchema.safeParse({
      date: "2026-06-09",
      startTime: "09:00",
      note: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listWorklogsSchema tests
// ---------------------------------------------------------------------------

describe("listWorklogsSchema", () => {
  it("accepts empty params", () => {
    const result = listWorklogsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts a single date filter", () => {
    const result = listWorklogsSchema.safeParse({ date: "2026-06-09" });
    expect(result.success).toBe(true);
  });

  it("accepts a date range", () => {
    const result = listWorklogsSchema.safeParse({
      startDate: "2026-06-01",
      endDate: "2026-06-30",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid start date", () => {
    const result = listWorklogsSchema.safeParse({ startDate: "01-06-2026" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid end date", () => {
    const result = listWorklogsSchema.safeParse({ endDate: "not-a-date" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateWorklogSchema tests
// ---------------------------------------------------------------------------

describe("updateWorklogSchema", () => {
  it("accepts worklog UUID with all optional fields", () => {
    const result = updateWorklogSchema.safeParse({
      worklogUuid: "wl_abc123",
      startTime: "10:00",
      endTime: "18:00",
      note: "Updated note",
    });
    expect(result.success).toBe(true);
  });

  it("accepts worklog UUID with only one field", () => {
    const result = updateWorklogSchema.safeParse({
      worklogUuid: "wl_abc123",
      note: "Just updating the note",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing worklog UUID", () => {
    const result = updateWorklogSchema.safeParse({
      startTime: "10:00",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty worklog UUID", () => {
    const result = updateWorklogSchema.safeParse({
      worklogUuid: "",
      startTime: "10:00",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid time format", () => {
    const result = updateWorklogSchema.safeParse({
      worklogUuid: "wl_abc123",
      startTime: "10:00 AM",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteWorklogSchema tests
// ---------------------------------------------------------------------------

describe("deleteWorklogSchema", () => {
  it("accepts a valid worklog UUID", () => {
    const result = deleteWorklogSchema.safeParse({ worklogUuid: "wl_abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty worklog UUID", () => {
    const result = deleteWorklogSchema.safeParse({ worklogUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing worklog UUID", () => {
    const result = deleteWorklogSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// appealWorklogSchema tests
// ---------------------------------------------------------------------------

describe("appealWorklogSchema", () => {
  it("accepts valid UUID and reason", () => {
    const result = appealWorklogSchema.safeParse({
      worklogUuid: "wl_abc123",
      reason: "I worked 8 hours on this day but the system only shows 4.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects too-short reason", () => {
    const result = appealWorklogSchema.safeParse({
      worklogUuid: "wl_abc123",
      reason: "Too short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing reason", () => {
    const result = appealWorklogSchema.safeParse({
      worklogUuid: "wl_abc123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = appealWorklogSchema.safeParse({
      reason: "I worked 8 hours on this day but the system only shows 4.",
    });
    expect(result.success).toBe(false);
  });
});
