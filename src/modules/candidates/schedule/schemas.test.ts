import { describe, it, expect } from "vitest";
import {
  scheduleItemSchema,
  scheduleStatusResultSchema,
  scheduleDetailSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// scheduleItemSchema
// ---------------------------------------------------------------------------

describe("scheduleItemSchema", () => {
  const validItem = () => ({
    cwd_uuid: "wd-001",
    date: new Date("2026-06-15"),
    start_time: new Date("2026-06-15T08:00:00"),
    end_time: new Date("2026-06-15T17:00:00"),
    total_time: 540,
    status: 1,
    store_name: "Main Branch",
    company_name: "Acme Corp",
  });

  it("accepts a valid schedule item", () => {
    const r = scheduleItemSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = scheduleItemSchema.safeParse({
      ...validItem(),
      end_time: null,
      total_time: null,
      status: null,
      store_name: null,
      company_name: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing cwd_uuid", () => {
    const { cwd_uuid: _, ...rest } = validItem();
    expect(scheduleItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-date date field", () => {
    expect(
      scheduleItemSchema.safeParse({ ...validItem(), date: "invalid" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// scheduleStatusResultSchema
// ---------------------------------------------------------------------------

describe("scheduleStatusResultSchema", () => {
  it("accepts valid status result", () => {
    const r = scheduleStatusResultSchema.safeParse({ cwd_uuid: "wd-001", status: 2 });
    expect(r.success).toBe(true);
  });

  it("rejects missing cwd_uuid", () => {
    const r = scheduleStatusResultSchema.safeParse({ status: 1 });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer status", () => {
    const r = scheduleStatusResultSchema.safeParse({ cwd_uuid: "wd-001", status: "pending" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// scheduleDetailSchema
// ---------------------------------------------------------------------------

describe("scheduleDetailSchema", () => {
  it("accepts valid detail with store", () => {
    const r = scheduleDetailSchema.safeParse({
      cwd_uuid: "wd-001",
      date: new Date(),
      start_time: new Date(),
      end_time: null,
      total_time: 480,
      status: 1,
      created_at: new Date(),
      updated_at: null,
      store: { store_name: "Branch A", company: { company_name: "Acme" } },
    });
    expect(r.success).toBe(true);
  });

  it("accepts null store", () => {
    const r = scheduleDetailSchema.safeParse({
      cwd_uuid: "wd-001",
      date: new Date(),
      start_time: new Date(),
      end_time: null,
      total_time: null,
      status: null,
      created_at: null,
      updated_at: null,
      store: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing date", () => {
    const r = scheduleDetailSchema.safeParse({
      cwd_uuid: "wd-001", start_time: new Date(), store: null,
    });
    expect(r.success).toBe(false);
  });
});
