import { describe, it, expect } from "vitest";
import { submitWorkLogSchema } from "../schemas";

// ---------------------------------------------------------------------------
// createWorkLog — schema validation tests
// (The server action uses the same submitWorkLogSchema from ../schemas)
// ---------------------------------------------------------------------------

describe("createWorkLog — submitWorkLogSchema", () => {
  it("accepts valid minimal params (date + startTime)", () => {
    const result = submitWorkLogSchema.safeParse({
      date: "2026-06-15",
      startTime: "2026-06-15T08:00:00",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.date).toBe("2026-06-15");
      expect(result.data.startTime).toBe("2026-06-15T08:00:00");
      expect(result.data.endTime).toBeUndefined();
    }
  });

  it("accepts all optional fields", () => {
    const result = submitWorkLogSchema.safeParse({
      date: "2026-06-15",
      startTime: "2026-06-15T08:00:00",
      endTime: "2026-06-15T16:00:00",
      totalTime: 480,
      note: "Test work log entry",
      storeId: 5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.endTime).toBe("2026-06-15T16:00:00");
      expect(result.data.totalTime).toBe(480);
      expect(result.data.note).toBe("Test work log entry");
      expect(result.data.storeId).toBe(5);
    }
  });

  it("rejects missing date", () => {
    const result = submitWorkLogSchema.safeParse({
      startTime: "2026-06-15T08:00:00",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing startTime", () => {
    const result = submitWorkLogSchema.safeParse({
      date: "2026-06-15",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty date", () => {
    const result = submitWorkLogSchema.safeParse({
      date: "",
      startTime: "2026-06-15T08:00:00",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty startTime", () => {
    const result = submitWorkLogSchema.safeParse({
      date: "2026-06-15",
      startTime: "",
    });
    expect(result.success).toBe(false);
  });

  it("coerces storeId from string to number", () => {
    const result = submitWorkLogSchema.safeParse({
      date: "2026-06-15",
      startTime: "2026-06-15T08:00:00",
      storeId: "3",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.storeId).toBe(3);
    }
  });

  it("coerces totalTime from string to number", () => {
    const result = submitWorkLogSchema.safeParse({
      date: "2026-06-15",
      startTime: "2026-06-15T08:00:00",
      totalTime: "240",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.totalTime).toBe(240);
    }
  });
});
