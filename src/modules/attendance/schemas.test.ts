import { describe, it, expect } from "vitest";
import {
  attendanceItemSchema,
  attendanceDetailSchema,
  listAttendanceResultSchema,
  createAttendanceResultSchema,
} from "./schemas";

const validAttendanceItem = () => ({
  attendance_uuid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  employee_uuid: "e1f2a3b4-c5d6-7890-abcd-ef1234567890",
  date: "2026-06-14",
  clock_in: "09:00:00",
  clock_out: "17:30:00",
  total_hours: 8.5,
  status: 10,
  note: "On time",
  created_at: "2026-06-14T06:00:00.000Z",
  updated_at: "2026-06-14T06:00:00.000Z",
});

const validAttendanceItemMinimal = () => ({
  attendance_uuid: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  employee_uuid: null,
  date: "2026-06-14",
  clock_in: null,
  clock_out: null,
  total_hours: null,
  status: 20,
  note: null,
  created_at: "2026-06-14T06:00:00.000Z",
  updated_at: "2026-06-14T06:00:00.000Z",
});

// ---------------------------------------------------------------------------
// attendanceItemSchema
// ---------------------------------------------------------------------------

describe("attendanceItemSchema", () => {
  it("accepts a full attendance item", () => {
    const r = attendanceItemSchema.safeParse(validAttendanceItem());
    expect(r.success).toBe(true);
  });

  it("accepts a minimal attendance item (nullable fields set to null)", () => {
    const r = attendanceItemSchema.safeParse(validAttendanceItemMinimal());
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = attendanceItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong types", () => {
    const r = attendanceItemSchema.safeParse({
      ...validAttendanceItem(),
      status: "not-a-number",
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing attendance_uuid", () => {
    const r = attendanceItemSchema.safeParse({
      ...validAttendanceItem(),
      attendance_uuid: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-string date", () => {
    const r = attendanceItemSchema.safeParse({
      ...validAttendanceItem(),
      date: 12345,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// attendanceDetailSchema
// ---------------------------------------------------------------------------

describe("attendanceDetailSchema", () => {
  it("accepts a valid attendance item", () => {
    const r = attendanceDetailSchema.safeParse(validAttendanceItem());
    expect(r.success).toBe(true);
  });

  it("accepts null", () => {
    const r = attendanceDetailSchema.safeParse(null);
    expect(r.success).toBe(true);
  });

  it("rejects undefined", () => {
    const r = attendanceDetailSchema.safeParse(undefined);
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listAttendanceResultSchema
// ---------------------------------------------------------------------------

describe("listAttendanceResultSchema", () => {
  it("accepts a full paginated result", () => {
    const r = listAttendanceResultSchema.safeParse({
      items: [validAttendanceItem(), validAttendanceItemMinimal()],
      total: 42,
      page: 1,
      limit: 20,
      totalPages: 3,
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty items array", () => {
    const r = listAttendanceResultSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = listAttendanceResultSchema.safeParse({
      items: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects zero page", () => {
    const r = listAttendanceResultSchema.safeParse({
      items: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const r = listAttendanceResultSchema.safeParse({ items: [] });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createAttendanceResultSchema
// ---------------------------------------------------------------------------

describe("createAttendanceResultSchema", () => {
  it("accepts a valid create result", () => {
    const r = createAttendanceResultSchema.safeParse({
      attendance_uuid: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing attendance_uuid", () => {
    const r = createAttendanceResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects non-string attendance_uuid", () => {
    const r = createAttendanceResultSchema.safeParse({
      attendance_uuid: 123,
    });
    expect(r.success).toBe(false);
  });
});
