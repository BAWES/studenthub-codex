import { describe, it, expect } from "vitest";
import {
  getScheduleEntrySchema,
  updateScheduleEntrySchema,
  deleteScheduleEntrySchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests for candidate/schedule/[id] actions (pure unit — no DB required)
// ---------------------------------------------------------------------------

describe("getScheduleEntrySchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      getScheduleEntrySchema.safeParse({ cwd_uuid: "abc-123-def" }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getScheduleEntrySchema.safeParse({ cwd_uuid: "" }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getScheduleEntrySchema.safeParse({}).success).toBe(false);
  });
});

describe("updateScheduleEntrySchema", () => {
  it("accepts valid status update to confirmed (1)", () => {
    const r = updateScheduleEntrySchema.safeParse({
      cwd_uuid: "abc-123-def",
      status: 1,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.cwd_uuid).toBe("abc-123-def");
      expect(r.data.status).toBe(1);
    }
  });

  it("accepts valid status with optional reason", () => {
    const r = updateScheduleEntrySchema.safeParse({
      cwd_uuid: "abc-123-def",
      status: 2,
      reason: "Schedule conflict",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.reason).toBe("Schedule conflict");
    }
  });

  it("accepts valid status update to cancelled (2)", () => {
    const r = updateScheduleEntrySchema.safeParse({
      cwd_uuid: "abc-123-def",
      status: 2,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe(2);
    }
  });

  it("rejects invalid status 99", () => {
    expect(
      updateScheduleEntrySchema.safeParse({
        cwd_uuid: "abc-123-def",
        status: 99,
      }).success,
    ).toBe(false);
  });

  it("rejects empty UUID", () => {
    expect(
      updateScheduleEntrySchema.safeParse({
        cwd_uuid: "",
        status: 1,
      }).success,
    ).toBe(false);
  });

  it("rejects missing status", () => {
    expect(
      updateScheduleEntrySchema.safeParse({
        cwd_uuid: "abc-123-def",
      }).success,
    ).toBe(false);
  });

  it("rejects string status (must be number)", () => {
    expect(
      updateScheduleEntrySchema.safeParse({
        cwd_uuid: "abc-123-def",
        status: "1",
      }).success,
    ).toBe(false);
  });
});

describe("deleteScheduleEntrySchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      deleteScheduleEntrySchema.safeParse({ cwd_uuid: "abc-123-def" }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(deleteScheduleEntrySchema.safeParse({ cwd_uuid: "" }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(deleteScheduleEntrySchema.safeParse({}).success).toBe(false);
  });
});
