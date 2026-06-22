import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: staff work session schema validation
//
// The server actions in actions.ts use these zod schemas internally.
// Testing them separately avoids mocking "use server" deps.
// ---------------------------------------------------------------------------

const listStaffWorkSessionsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  staffId: z.coerce.number().int().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const getStaffWorkSessionSchema = z.object({
  workSessionUuid: z.string().min(1, "Work session UUID is required"),
});

const createStaffWorkSessionSchema = z.object({
  staff_id: z.coerce.number().int().positive("Staff ID is required"),
  total_minutes: z.coerce.number().int().min(0).optional().default(0),
});

// ---------------------------------------------------------------------------
// listStaffWorkSessionsSchema
// ---------------------------------------------------------------------------

describe("listStaffWorkSessionsSchema", () => {
  it("accepts empty params (defaults applied)", () => {
    const result = listStaffWorkSessionsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const result = listStaffWorkSessionsSchema.safeParse({
      page: "2",
      limit: "50",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts staffId filter", () => {
    const result = listStaffWorkSessionsSchema.safeParse({
      staffId: "42",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.staffId).toBe(42);
    }
  });

  it("accepts date range params", () => {
    const result = listStaffWorkSessionsSchema.safeParse({
      startDate: "2026-01-01",
      endDate: "2026-12-31",
    });
    expect(result.success).toBe(true);
  });

  it("rejects limit over 100", () => {
    const result = listStaffWorkSessionsSchema.safeParse({ limit: "999" });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listStaffWorkSessionsSchema.safeParse({ page: "-1" });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric staffId", () => {
    const result = listStaffWorkSessionsSchema.safeParse({ staffId: "abc" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getStaffWorkSessionSchema
// ---------------------------------------------------------------------------

describe("getStaffWorkSessionSchema", () => {
  it("accepts valid UUID", () => {
    const result = getStaffWorkSessionSchema.safeParse({
      workSessionUuid: "work_session_abc123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = getStaffWorkSessionSchema.safeParse({
      workSessionUuid: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getStaffWorkSessionSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createStaffWorkSessionSchema
// ---------------------------------------------------------------------------

describe("createStaffWorkSessionSchema", () => {
  it("accepts valid staff_id", () => {
    const result = createStaffWorkSessionSchema.safeParse({
      staff_id: "42",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.staff_id).toBe(42);
      expect(result.data.total_minutes).toBe(0); // default
    }
  });

  it("accepts staff_id with total_minutes", () => {
    const result = createStaffWorkSessionSchema.safeParse({
      staff_id: "42",
      total_minutes: "120",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.total_minutes).toBe(120);
    }
  });

  it("rejects missing staff_id", () => {
    const result = createStaffWorkSessionSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects negative total_minutes", () => {
    const result = createStaffWorkSessionSchema.safeParse({
      staff_id: "42",
      total_minutes: "-5",
    });
    expect(result.success).toBe(false);
  });
});
