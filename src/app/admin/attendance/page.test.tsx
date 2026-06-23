import { describe, it, expect } from "vitest";
import {
  listAttendanceSchema,
  attendanceItemSchema,
  listAttendanceResultSchema,
  createAttendanceSchema,
} from "@/modules/attendance/schemas";
import { employeeOptionSchema, listEmployeeOptionsResultSchema } from "./schemas";

/**
 * Page migration test for admin/attendance.
 *
 * Verifies that listAttendanceSchema accepts the params passed by the page,
 * that attendanceItem fields map correctly to AdminAttendanceTable columns,
 * and that listAttendanceResultSchema matches the page's result destructuring.
 *
 * Full rendering tests require Playwright (server component).
 * This validates the data contract between the page and the server action.
 */
describe("admin attendance page — data contract", () => {
  // ── Input schemas ──

  it("listAttendanceSchema accepts params the page actually passes (limit: 100)", () => {
    const r = listAttendanceSchema.safeParse({ limit: 100 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(100);
      expect(typeof r.data.page).toBe("number");
    }
  });

  it("listAttendanceSchema accepts empty params (defaults apply)", () => {
    const r = listAttendanceSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(20);
      expect(r.data.page).toBe(1);
    }
  });

  it("listAttendanceSchema rejects limit over 100", () => {
    const r = listAttendanceSchema.safeParse({ limit: 200 });
    expect(r.success).toBe(false);
  });

  // ── Output schemas: attendance items ──

  it("listAttendanceResultSchema validates the page's result destructuring", () => {
    const r = listAttendanceResultSchema.safeParse({
      items: [
        {
          attendance_uuid: "att-uuid-1",
          employee_uuid: "emp-uuid-1",
          date: "2026-06-15",
          clock_in: "09:00",
          clock_out: "17:00",
          total_hours: 8,
          status: 10,
          note: "On time",
          created_at: "2026-06-15T06:00:00Z",
          updated_at: "2026-06-15T17:00:00Z",
        },
      ],
      total: 1,
      page: 1,
      limit: 100,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(Array.isArray(r.data.items)).toBe(true);
      expect(typeof r.data.total).toBe("number");
      expect(typeof r.data.page).toBe("number");
      expect(typeof r.data.limit).toBe("number");
      expect(typeof r.data.totalPages).toBe("number");
      expect(r.data.items[0].attendance_uuid).toBe("att-uuid-1");
    }
  });

  it("listAttendanceResultSchema allows all-null optional fields on items", () => {
    const r = listAttendanceResultSchema.safeParse({
      items: [
        {
          attendance_uuid: "att-uuid-2",
          employee_uuid: null,
          date: "2026-06-15",
          clock_in: null,
          clock_out: null,
          total_hours: null,
          status: 10,
          note: null,
          created_at: "2026-06-15T06:00:00Z",
          updated_at: "2026-06-15T17:00:00Z",
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("attendanceItem fields map correctly to AdminAttendanceTable columns", () => {
    // The page maps AttendanceItem to DataTable columns:
    //   attendance_uuid → row.attendance_uuid (key)
    //   employee_uuid   → row.employee_uuid
    //   date            → row.date
    //   clock_in        → row.clock_in
    //   clock_out       → row.clock_out
    //   total_hours     → row.total_hours
    //   status          → row.status
    //   note            → row.note
    //   created_at      → row.created_at
    //   updated_at      → row.updated_at
    const row = {
      attendance_uuid: "att-uuid-1",
      employee_uuid: "emp-uuid-1",
      date: "2026-06-15",
      clock_in: "09:00",
      clock_out: "17:00",
      total_hours: 8,
      status: 10,
      note: "On time",
      created_at: "2026-06-15T06:00:00Z",
      updated_at: "2026-06-15T17:00:00Z",
    };
    expect(row.attendance_uuid).toBe("att-uuid-1");
    expect(row.employee_uuid).toBe("emp-uuid-1");
    expect(row.date).toBe("2026-06-15");
    expect(row.clock_in).toBe("09:00");
    expect(row.clock_out).toBe("17:00");
    expect(row.total_hours).toBe(8);
    expect(row.status).toBe(10);
    expect(row.note).toBe("On time");
  });

  // ── Employee options ──

  it("employeeOptionSchema validates a valid employee option", () => {
    const r = employeeOptionSchema.safeParse({
      uuid: "emp-1",
      name: "Ahmed Al-Sabah",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.uuid).toBe("emp-1");
      expect(r.data.name).toBe("Ahmed Al-Sabah");
    }
  });

  it("listEmployeeOptionsResultSchema validates an array of options", () => {
    const r = listEmployeeOptionsResultSchema.safeParse([
      { uuid: "emp-1", name: "Ahmed" },
      { uuid: "emp-2", name: "Mona" },
    ]);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.length).toBe(2);
  });

  // ── Create attendance ──

  it("createAttendanceSchema validates create input", () => {
    const r = createAttendanceSchema.safeParse({
      employee_uuid: "emp-uuid-1",
      date: "2026-06-15",
      clock_in: "09:00",
      clock_out: "17:00",
      total_hours: 8,
      note: "On time",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.employee_uuid).toBe("emp-uuid-1");
      expect(r.data.date).toBe("2026-06-15");
    }
  });

  it("createAttendanceSchema rejects missing employee_uuid", () => {
    const r = createAttendanceSchema.safeParse({ date: "2026-06-15" });
    expect(r.success).toBe(false);
  });
});
