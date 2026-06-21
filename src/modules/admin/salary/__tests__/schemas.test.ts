import { describe, it, expect } from "vitest";
import {
  listSalarySchema,
  salaryItemSchema,
  listSalaryResultSchema,
  salaryActionResponseSchema,
} from "../schemas";

describe("admin/salary schemas", () => {
  describe("listSalarySchema", () => {
    it("defaults page and limit", () => {
      const result = listSalarySchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
    });

    it("accepts explicit page and limit", () => {
      const result = listSalarySchema.parse({ page: "2", limit: "25" });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(25);
    });

    it("rejects negative page", () => {
      const result = listSalarySchema.safeParse({ page: "-1" });
      expect(result.success).toBe(false);
    });

    it("rejects limit over 200", () => {
      const result = listSalarySchema.safeParse({ limit: "300" });
      expect(result.success).toBe(false);
    });
  });

  describe("salaryItemSchema", () => {
    it("validates a complete salary item", () => {
      const result = salaryItemSchema.parse({
        staff_salary_uuid: "SAL-001",
        staff_name: "John Doe",
        salary: 2500,
        salary_currency: "KWD",
        comment: "Monthly",
        salary_date: new Date("2026-06-01"),
      });
      expect(result.staff_salary_uuid).toBe("SAL-001");
      expect(result.salary).toBe(2500);
    });

    it("accepts null fields", () => {
      const result = salaryItemSchema.parse({
        staff_salary_uuid: "SAL-002",
      });
      expect(result.staff_salary_uuid).toBe("SAL-002");
      expect(result.salary).toBeUndefined();
    });
  });

  describe("listSalaryResultSchema", () => {
    it("validates a complete list result", () => {
      const result = listSalaryResultSchema.parse({
        salaries: [
          { staff_salary_uuid: "SAL-001", salary: 2500, salary_currency: "KWD" },
        ],
        total: 1,
        page: 1,
        limit: 50,
        totalPages: 1,
      });
      expect(result.salaries).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe("salaryActionResponseSchema", () => {
    it("validates an action response", () => {
      const result = salaryActionResponseSchema.parse({
        operation: "success",
        message: "Salary saved",
      });
      expect(result.operation).toBe("success");
    });
  });
});
