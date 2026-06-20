/**
 * @vitest-environment node
 */

import { describe, it, expect } from "vitest";
import {
  salaryItemSchema,
  listSalariesResultSchema,
} from "@/modules/admin/salary/schemas";

describe("admin salary page — data contract", () => {
  describe("salaryItemSchema", () => {
    it("validates a full salary entry", () => {
      const r = salaryItemSchema.safeParse({
        staff_salary_uuid: "sal-001",
        salary: 1500,
        salary_currency: "KWD",
        comment: "Monthly salary",
        salary_date: new Date("2026-06-01"),
      });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.staff_salary_uuid).toBe("sal-001");
        expect(r.data.salary).toBe(1500);
      }
    });

    it("accepts null optional fields", () => {
      const r = salaryItemSchema.safeParse({
        staff_salary_uuid: "sal-002",
        salary: null,
        salary_currency: null,
        comment: null,
        salary_date: null,
      });
      expect(r.success).toBe(true);
    });

    it("rejects missing required staff_salary_uuid", () => {
      const r = salaryItemSchema.safeParse({
        salary: 1500,
      });
      expect(r.success).toBe(false);
    });
  });

  describe("listSalariesResultSchema", () => {
    it("validates a list result", () => {
      const r = listSalariesResultSchema.safeParse({
        salaries: [
          {
            staff_salary_uuid: "sal-001",
            salary: 1500,
            salary_currency: "KWD",
            comment: "Monthly",
            salary_date: new Date("2026-06-01"),
          },
        ],
        total: 1,
      });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.total).toBe(1);
        expect(r.data.salaries).toHaveLength(1);
      }
    });

    it("validates empty list", () => {
      const r = listSalariesResultSchema.safeParse({
        salaries: [],
        total: 0,
      });
      expect(r.success).toBe(true);
    });
  });
});
