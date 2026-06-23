import { describe, it, expect } from "vitest";
import {
  listScheduleSchema,
  getScheduleItemSchema,
  getScheduleDetailSchema,
  updateScheduleStatusSchema,
} from "./schemas";

describe("listScheduleSchema", () => {
  it("accepts empty params", () => {
    const r = listScheduleSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts date range", () => {
    const r = listScheduleSchema.safeParse({ dateFrom: "2026-01-01", dateTo: "2026-01-31" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.dateFrom).toBe("2026-01-01");
    }
  });

  it("rejects limit over 100", () => {
    expect(listScheduleSchema.safeParse({ limit: 999 }).success).toBe(false);
  });
});

describe("getScheduleItemSchema", () => {
  it("accepts valid UUID", () => {
    const r = getScheduleItemSchema.safeParse({ cwd_uuid: "550e8400-e29b-41d4-a716-446655440000" });
    expect(r.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getScheduleItemSchema.safeParse({ cwd_uuid: "" }).success).toBe(false);
  });
});

describe("getScheduleDetailSchema", () => {
  it("accepts valid UUID", () => {
    const r = getScheduleDetailSchema.safeParse({ cwd_uuid: "550e8400-e29b-41d4-a716-446655440000" });
    expect(r.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getScheduleDetailSchema.safeParse({ cwd_uuid: "" }).success).toBe(false);
  });
});

describe("updateScheduleStatusSchema", () => {
  it("accepts valid status update (number)", () => {
    const r = updateScheduleStatusSchema.safeParse({
      cwd_uuid: "550e8400-e29b-41d4-a716-446655440000",
      status: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts status 0 (Pending)", () => {
    expect(updateScheduleStatusSchema.safeParse({ cwd_uuid: "uuid", status: 0 }).success).toBe(true);
  });

  it("accepts status 3 (Completed)", () => {
    expect(updateScheduleStatusSchema.safeParse({ cwd_uuid: "uuid", status: 3 }).success).toBe(true);
  });

  it("rejects invalid status value", () => {
    expect(updateScheduleStatusSchema.safeParse({ cwd_uuid: "uuid", status: 99 }).success).toBe(false);
  });

  it("rejects string status", () => {
    expect(updateScheduleStatusSchema.safeParse({ cwd_uuid: "uuid", status: "approved" }).success).toBe(false);
  });

  it("rejects missing status", () => {
    expect(updateScheduleStatusSchema.safeParse({ cwd_uuid: "uuid" }).success).toBe(false);
  });
});
