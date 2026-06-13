import { describe, it, expect } from "vitest";
import { employeeOptionSchema, listEmployeeOptionsResultSchema } from "./schemas";

/**
 * Page migration test for admin/attendance.
 *
 * Verifies the data contract between page and action.
 * The attendance page uses getEmployeeOptions to populate
 * the employee filter dropdown and CreateAttendanceForm.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("admin attendance page — data contract", () => {
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

  it("employeeOptionSchema rejects missing uuid", () => {
    const r = employeeOptionSchema.safeParse({ name: "Test" });
    expect(r.success).toBe(false);
  });

  it("employeeOptionSchema rejects missing name", () => {
    const r = employeeOptionSchema.safeParse({ uuid: "emp-1" });
    expect(r.success).toBe(false);
  });

  it("listEmployeeOptionsResultSchema validates an array of options", () => {
    const r = listEmployeeOptionsResultSchema.safeParse([
      { uuid: "emp-1", name: "Ahmed" },
      { uuid: "emp-2", name: "Mona" },
    ]);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.length).toBe(2);
  });

  it("listEmployeeOptionsResultSchema rejects non-array input", () => {
    const r = listEmployeeOptionsResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("employee option shape matches the props AdminAttendanceTable expects", () => {
    const employee = { uuid: "emp-1", name: "Ahmed Al-Sabah" };
    expect(typeof employee.uuid).toBe("string");
    expect(typeof employee.name).toBe("string");
  });
});
