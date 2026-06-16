import { describe, it, expect } from "vitest";
import {
  listEvaluationsSchema,
  getEvaluationSchema,
  createEvaluationSchema,
  updateEvaluationSchema,
  evaluationRowSchema,
  listEvaluationsResultSchema,
  evaluationDetailSchema,
  getEvaluationResultSchema,
  evaluationActionResultSchema,
} from "./schemas";

describe("admin/evaluations — input schemas", () => {
  describe("listEvaluationsSchema", () => {
    it("accepts valid input", () => {
      const result = listEvaluationsSchema.safeParse({ page: 1, limit: 20, search: "test" });
      expect(result.success).toBe(true);
    });

    it("applies defaults for missing optional fields", () => {
      const result = listEvaluationsSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("rejects negative page", () => {
      const result = listEvaluationsSchema.safeParse({ page: -1 });
      expect(result.success).toBe(false);
    });

    it("rejects limit > 100", () => {
      const result = listEvaluationsSchema.safeParse({ limit: 200 });
      expect(result.success).toBe(false);
    });
  });

  describe("getEvaluationSchema", () => {
    it("accepts valid UUID", () => {
      const result = getEvaluationSchema.safeParse({ canEvalUuid: "uuid-123" });
      expect(result.success).toBe(true);
    });

    it("rejects empty UUID", () => {
      const result = getEvaluationSchema.safeParse({ canEvalUuid: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("createEvaluationSchema", () => {
    it("accepts valid input", () => {
      const result = createEvaluationSchema.safeParse({
        candidateId: 1,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        staffId: 5,
      });
      expect(result.success).toBe(true);
    });

    it("accepts optional deptId", () => {
      const result = createEvaluationSchema.safeParse({
        candidateId: 1,
        deptId: 3,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        staffId: 5,
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing candidateId", () => {
      const result = createEvaluationSchema.safeParse({
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        staffId: 5,
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing startDate", () => {
      const result = createEvaluationSchema.safeParse({
        candidateId: 1,
        endDate: "2024-12-31",
        staffId: 5,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updateEvaluationSchema", () => {
    it("accepts valid input with all fields", () => {
      const result = updateEvaluationSchema.safeParse({
        canEvalUuid: "uuid-123",
        candidateId: 1,
        deptId: 3,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        staffId: 5,
      });
      expect(result.success).toBe(true);
    });

    it("accepts partial update with only UUID", () => {
      const result = updateEvaluationSchema.safeParse({
        canEvalUuid: "uuid-123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty UUID", () => {
      const result = updateEvaluationSchema.safeParse({ canEvalUuid: "" });
      expect(result.success).toBe(false);
    });
  });
});

describe("admin/evaluations — output schemas", () => {
  describe("evaluationRowSchema", () => {
    it("validates a complete evaluation row", () => {
      const result = evaluationRowSchema.safeParse({
        can_eval_uuid: "uuid-123",
        candidate_id: 1,
        candidate_name: "John Doe",
        dept_id: 3,
        start_date: "2024-01-01",
        end_date: "2024-12-31",
        staff_id: 5,
        staff_name: "Jane Staff",
        created_at: new Date("2024-01-01"),
        updated_at: new Date("2024-01-15"),
      });
      expect(result.success).toBe(true);
    });

    it("validates row with nullable fields as null", () => {
      const result = evaluationRowSchema.safeParse({
        can_eval_uuid: "uuid-456",
        candidate_id: null,
        candidate_name: null,
        dept_id: null,
        start_date: null,
        end_date: null,
        staff_id: null,
        staff_name: null,
        created_at: null,
        updated_at: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("listEvaluationsResultSchema", () => {
    it("validates a complete result with items", () => {
      const result = listEvaluationsResultSchema.safeParse({
        items: [
          {
            can_eval_uuid: "uuid-1",
            candidate_id: 1,
            candidate_name: "John",
            dept_id: 3,
            start_date: "2024-01-01",
            end_date: "2024-12-31",
            staff_id: 5,
            staff_name: "Jane",
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      expect(result.success).toBe(true);
    });

    it("validates empty result", () => {
      const result = listEvaluationsResultSchema.safeParse({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("evaluationDetailSchema", () => {
    it("validates a complete evaluation detail", () => {
      const result = evaluationDetailSchema.safeParse({
        can_eval_uuid: "uuid-123",
        candidate_id: 1,
        candidate_name: "John Doe",
        dept_id: 3,
        start_date: "2024-01-01",
        end_date: "2024-12-31",
        staff_id: 5,
        staff_name: "Jane Staff",
        created_at: new Date("2024-01-01"),
        updated_at: new Date("2024-01-15"),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("getEvaluationResultSchema", () => {
    it("validates result with evaluation", () => {
      const result = getEvaluationResultSchema.safeParse({
        evaluation: {
          can_eval_uuid: "uuid-123",
          candidate_id: 1,
          candidate_name: "John",
          dept_id: null,
          start_date: "2024-01-01",
          end_date: "2024-12-31",
          staff_id: 5,
          staff_name: "Jane",
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      expect(result.success).toBe(true);
    });

    it("validates result with null evaluation", () => {
      const result = getEvaluationResultSchema.safeParse({
        evaluation: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("evaluationActionResultSchema", () => {
    it("validates a successful action result", () => {
      const result = evaluationActionResultSchema.safeParse({
        success: true,
        canEvalUuid: "uuid-123",
      });
      expect(result.success).toBe(true);
    });

    it("validates a failed action result", () => {
      const result = evaluationActionResultSchema.safeParse({
        success: false,
        error: "Something went wrong",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid action result", () => {
      const result = evaluationActionResultSchema.safeParse({
        success: "not-a-boolean",
      });
      expect(result.success).toBe(false);
    });
  });
});
