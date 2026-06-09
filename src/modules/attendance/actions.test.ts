import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listAttendanceSchema = z.object({
  employee_uuid: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  status: z.coerce.number().int().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getAttendanceSchema = z.object({
  uuid: z.string().min(1, "Attendance UUID is required"),
});

const createAttendanceSchema = z.object({
  employee_uuid: z.string().min(1, "Employee UUID is required"),
  date: z.string().min(1, "Date is required"),
  clock_in: z.string().optional(),
  clock_out: z.string().optional(),
  total_hours: z.number().positive().optional(),
  status: z.number().int().optional().default(10),
  note: z.string().max(500).optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AttendanceItem = {
  attendance_uuid: string;
  employee_uuid: string | null;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  total_hours: number | null;
  status: number;
  note: string | null;
  created_at: string;
  updated_at: string;
};

type AttendanceDetail = AttendanceItem | null;

type ListAttendanceResult = {
  items: AttendanceItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type CreateAttendanceInput = z.input<typeof createAttendanceSchema>;

// ---------------------------------------------------------------------------
// Tests — Schema validation
// ---------------------------------------------------------------------------

describe("listAttendanceSchema", () => {
  it("accepts empty params (defaults)", () => {
    const r = listAttendanceSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts all filters", () => {
    const r = listAttendanceSchema.safeParse({
      employee_uuid: "emp-uuid",
      date_from: "2025-01-01",
      date_to: "2025-12-31",
      status: 10,
      page: 2,
      limit: 50,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative page", () => {
    const r = listAttendanceSchema.safeParse({ page: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const r = listAttendanceSchema.safeParse({ limit: 999 });
    expect(r.success).toBe(false);
  });
});

describe("getAttendanceSchema", () => {
  it("accepts a valid UUID", () => {
    const r = getAttendanceSchema.safeParse({ uuid: "att-uuid-123" });
    expect(r.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const r = getAttendanceSchema.safeParse({ uuid: "" });
    expect(r.success).toBe(false);
  });
});

describe("createAttendanceSchema", () => {
  it("accepts valid input", () => {
    const r = createAttendanceSchema.safeParse({
      employee_uuid: "emp-uuid",
      date: "2025-01-15",
      clock_in: "09:00",
      clock_out: "17:00",
      total_hours: 8.0,
      status: 10,
      note: "Regular work day",
    });
    expect(r.success).toBe(true);
  });

  it("requires employee_uuid and date", () => {
    const r = createAttendanceSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("applies default status of 10", () => {
    const r = createAttendanceSchema.safeParse({
      employee_uuid: "emp-uuid",
      date: "2025-01-15",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe(10);
    }
  });

  it("rejects note over 500 chars", () => {
    const r = createAttendanceSchema.safeParse({
      employee_uuid: "emp-uuid",
      date: "2025-01-15",
      note: "x".repeat(501),
    });
    expect(r.success).toBe(false);
  });

  it("accepts minimal input (employee_uuid + date)", () => {
    const r = createAttendanceSchema.safeParse({
      employee_uuid: "emp-uuid",
      date: "2025-01-15",
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tests — Type shapes (compile-time checks)
// ---------------------------------------------------------------------------

describe("AttendanceItem shape", () => {
  it("has required fields", () => {
    const item: AttendanceItem = {
      attendance_uuid: "uuid",
      employee_uuid: null,
      date: "2025-01-15",
      clock_in: null,
      clock_out: null,
      total_hours: null,
      status: 10,
      note: null,
      created_at: "2025-01-01T00:00:00.000Z",
      updated_at: "2025-01-01T00:00:00.000Z",
    };
    expect(item.attendance_uuid).toBe("uuid");
  });
});

describe("ListAttendanceResult shape", () => {
  it("has items array and pagination", () => {
    const result: ListAttendanceResult = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.items).toEqual([]);
  });
});

describe("CreateAttendanceInput shape", () => {
  it("accepts valid input values", () => {
    const input: CreateAttendanceInput = {
      employee_uuid: "emp-uuid",
      date: "2025-01-15",
    };
    expect(input.employee_uuid).toBe("emp-uuid");
  });
});
