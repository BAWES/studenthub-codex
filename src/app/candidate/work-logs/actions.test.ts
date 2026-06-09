import { describe, it, expect } from "vitest";
import {
  getWorkLogsSchema,
  getWorkLogDetailSchema,
  submitWorkLogSchema,
  updateWorkLogStatusSchema,
  type SubmitWorkLogInput,
} from "./actions";

// ---------------------------------------------------------------------------
// getWorkLogsSchema tests
// ---------------------------------------------------------------------------

describe("getWorkLogsSchema", () => {
  it("accepts empty params (default listing)", () => {
    const result = getWorkLogsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts a date filter", () => {
    const result = getWorkLogsSchema.safeParse({ date: "2026-06-09" });
    expect(result.success).toBe(true);
  });

  it("accepts a date range", () => {
    const result = getWorkLogsSchema.safeParse({
      startDate: "2026-06-01",
      endDate: "2026-06-30",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid date format", () => {
    const result = getWorkLogsSchema.safeParse({ date: "09-06-2026" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid start date", () => {
    const result = getWorkLogsSchema.safeParse({ startDate: "01-06-2026" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid end date", () => {
    const result = getWorkLogsSchema.safeParse({ endDate: "not-a-date" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getWorkLogDetailSchema tests
// ---------------------------------------------------------------------------

describe("getWorkLogDetailSchema", () => {
  it("accepts a valid work log UUID", () => {
    const result = getWorkLogDetailSchema.safeParse({ workLogUuid: "wl_abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = getWorkLogDetailSchema.safeParse({ workLogUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getWorkLogDetailSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// submitWorkLogSchema tests
// ---------------------------------------------------------------------------

describe("submitWorkLogSchema", () => {
  const validInput: SubmitWorkLogInput = {
    date: "2026-06-09",
    startTime: "09:00",
    endTime: "17:00",
    note: "Worked on server actions migration",
  };

  it("accepts valid full input", () => {
    const result = submitWorkLogSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("accepts input without end time", () => {
    const result = submitWorkLogSchema.safeParse({
      date: "2026-06-09",
      startTime: "09:00",
    });
    expect(result.success).toBe(true);
  });

  it("accepts input without note", () => {
    const result = submitWorkLogSchema.safeParse({
      date: "2026-06-09",
      startTime: "09:00",
      endTime: "17:00",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing date", () => {
    const result = submitWorkLogSchema.safeParse({
      startTime: "09:00",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date format", () => {
    const result = submitWorkLogSchema.safeParse({
      date: "09-06-2026",
      startTime: "09:00",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid start time format", () => {
    const result = submitWorkLogSchema.safeParse({
      date: "2026-06-09",
      startTime: "9:00",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid end time format", () => {
    const result = submitWorkLogSchema.safeParse({
      date: "2026-06-09",
      startTime: "09:00",
      endTime: "5:00 PM",
    });
    expect(result.success).toBe(false);
  });

  it("rejects too-long note", () => {
    const result = submitWorkLogSchema.safeParse({
      date: "2026-06-09",
      startTime: "09:00",
      note: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("rejects end time without start time (caught by base schema)", () => {
    const result = submitWorkLogSchema.safeParse({
      date: "2026-06-09",
      endTime: "17:00",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateWorkLogStatusSchema tests
// ---------------------------------------------------------------------------

describe("updateWorkLogStatusSchema", () => {
  it("accepts a valid work log UUID and status", () => {
    const result = updateWorkLogStatusSchema.safeParse({
      workLogUuid: "wl_abc123",
      status: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts status 0", () => {
    const result = updateWorkLogStatusSchema.safeParse({
      workLogUuid: "wl_abc123",
      status: 0,
    });
    expect(result.success).toBe(true);
  });

  it("accepts status within valid range", () => {
    const result = updateWorkLogStatusSchema.safeParse({
      workLogUuid: "wl_abc123",
      status: 5,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative status", () => {
    const result = updateWorkLogStatusSchema.safeParse({
      workLogUuid: "wl_abc123",
      status: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects status above 10", () => {
    const result = updateWorkLogStatusSchema.safeParse({
      workLogUuid: "wl_abc123",
      status: 11,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = updateWorkLogStatusSchema.safeParse({ status: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects empty UUID", () => {
    const result = updateWorkLogStatusSchema.safeParse({
      workLogUuid: "",
      status: 1,
    });
    expect(result.success).toBe(false);
  });
});
