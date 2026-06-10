import { describe, it, expect } from "vitest";
import {
  listScheduleSchema,
  getScheduleItemSchema,
  getScheduleDetailSchema,
  updateScheduleStatusSchema,
} from "./actions";

// ---------------------------------------------------------------------------
// Schema tests for candidate/schedule actions (pure unit — no DB required)
// ---------------------------------------------------------------------------

describe("listScheduleSchema", () => {
  it("accepts empty params (default — no pagination, no filter)", () => {
    expect(listScheduleSchema.safeParse({}).success).toBe(true);
  });

  it("accepts pagination params", () => {
    const r = listScheduleSchema.safeParse({ page: 1, limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts optional date filter", () => {
    const r = listScheduleSchema.safeParse({ dateFrom: "2026-06-01", dateTo: "2026-06-30" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.dateFrom).toBe("2026-06-01");
      expect(r.data.dateTo).toBe("2026-06-30");
    }
  });

  it("rejects limit over 100", () => {
    expect(listScheduleSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listScheduleSchema.safeParse({ page: -1 }).success).toBe(false);
  });
});

describe("getScheduleItemSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      getScheduleItemSchema.safeParse({ cwd_uuid: "abc-123-def" }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getScheduleItemSchema.safeParse({ cwd_uuid: "" }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getScheduleItemSchema.safeParse({}).success).toBe(false);
  });
});

describe("updateScheduleStatusSchema", () => {
  it("accepts valid status update to confirmed (1)", () => {
    const r = updateScheduleStatusSchema.safeParse({
      cwd_uuid: "abc-123-def",
      status: 1,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.cwd_uuid).toBe("abc-123-def");
      expect(r.data.status).toBe(1);
    }
  });

  it("accepts valid status update to cancelled (2)", () => {
    const r = updateScheduleStatusSchema.safeParse({
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
      updateScheduleStatusSchema.safeParse({
        cwd_uuid: "abc-123-def",
        status: 99,
      }).success,
    ).toBe(false);
  });

  it("rejects empty UUID", () => {
    expect(
      updateScheduleStatusSchema.safeParse({
        cwd_uuid: "",
        status: 1,
      }).success,
    ).toBe(false);
  });

  it("rejects negative status", () => {
    expect(
      updateScheduleStatusSchema.safeParse({
        cwd_uuid: "abc-123-def",
        status: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects missing status", () => {
    expect(
      updateScheduleStatusSchema.safeParse({
        cwd_uuid: "abc-123-def",
      }).success,
    ).toBe(false);
  });

  it("rejects string status (must be number)", () => {
    expect(
      updateScheduleStatusSchema.safeParse({
        cwd_uuid: "abc-123-def",
        status: "1",
      }).success,
    ).toBe(false);
  });
});

describe("getScheduleDetailSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      getScheduleDetailSchema.safeParse({ cwd_uuid: "abc-123-def" }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getScheduleDetailSchema.safeParse({ cwd_uuid: "" }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getScheduleDetailSchema.safeParse({}).success).toBe(false);
  });
});
