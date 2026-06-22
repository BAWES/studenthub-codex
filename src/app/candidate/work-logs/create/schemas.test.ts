import { describe, it, expect } from "vitest";
import { submitWorkLogResultOutputSchema } from "./schemas";

// ---------------------------------------------------------------------------
// Schema validation tests — candidate/work-logs/create
// ---------------------------------------------------------------------------
// Re-exported from the parent work-logs/schemas.ts.

describe("submitWorkLogResultOutputSchema (create route)", () => {
  const validWorkLogItem = {
    candidate_working_hour_uuid: "wl-001",
    date: new Date("2026-06-15"),
    start_time: new Date("2026-06-15T09:00:00"),
    end_time: new Date("2026-06-15T17:00:00"),
    total_time: 8,
    status: 1,
    via: "app",
    note: null,
    store_name: null,
    company_name: null,
    created_at: new Date("2026-06-15T10:30:00"),
    updated_at: null,
  };

  it("accepts a success result with workLog", () => {
    expect(
      submitWorkLogResultOutputSchema.safeParse({
        operation: "success",
        message: "Work log submitted",
        workLog: validWorkLogItem,
      }).success,
    ).toBe(true);
  });

  it("accepts a success result without workLog", () => {
    expect(
      submitWorkLogResultOutputSchema.safeParse({
        operation: "success",
        message: "Work log submitted",
      }).success,
    ).toBe(true);
  });

  it("accepts an error result", () => {
    expect(
      submitWorkLogResultOutputSchema.safeParse({
        operation: "error",
        message: "Invalid time range",
      }).success,
    ).toBe(true);
  });

  it("rejects missing message", () => {
    expect(
      submitWorkLogResultOutputSchema.safeParse({
        operation: "success",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid operation value", () => {
    expect(
      submitWorkLogResultOutputSchema.safeParse({
        operation: "unknown",
        message: "test",
      }).success,
    ).toBe(false);
  });
});
