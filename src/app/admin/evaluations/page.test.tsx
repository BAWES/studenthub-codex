import { describe, it, expect } from "vitest";
import {
  listEvaluationsSchema,
  getEvaluationSchema,
  createEvaluationSchema,
  updateEvaluationSchema,
  evaluationRowSchema,
  listEvaluationsResultSchema,
  getEvaluationResultSchema,
  evaluationActionResultSchema,
  type EvaluationRow,
  type ListEvaluationsResult,
} from "./schemas";

/**
 * Page data-contract test for admin/evaluations.
 *
 * Verifies the schema contracts between the list page (page.tsx) and
 * its server actions. Full rendering tests require Playwright
 * (this is a server component).
 *
 * The list page (page.tsx) calls listEvaluations({ page, limit: 20, search })
 * and passes the result to AdminEvaluationsTable.
 * Detail page uses getEvaluation, createEvaluation, updateEvaluation.
 */
describe("admin evaluations page — data contract", () => {
  // -----------------------------------------------------------------------
  // Input schemas — passed to server actions
  // -----------------------------------------------------------------------

  describe("listEvaluationsSchema", () => {
    it("parses with defaults (empty params)", () => {
      const r = listEvaluationsSchema.safeParse({});
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.page).toBe(1);
        expect(r.data.limit).toBe(20);
        expect(r.data.search).toBeUndefined();
      }
    });

    it("accepts explicit page and limit", () => {
      const r = listEvaluationsSchema.safeParse({ page: 3, limit: 10 });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.page).toBe(3);
        expect(r.data.limit).toBe(10);
      }
    });

    it("accepts search string", () => {
      const r = listEvaluationsSchema.safeParse({ search: "Ahmed" });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.search).toBe("Ahmed");
      }
    });

    it("rejects limit over 100", () => {
      const r = listEvaluationsSchema.safeParse({ limit: 999 });
      expect(r.success).toBe(false);
    });

    it("rejects page 0", () => {
      const r = listEvaluationsSchema.safeParse({ page: 0 });
      expect(r.success).toBe(false);
    });

    it("rejects negative limit", () => {
      const r = listEvaluationsSchema.safeParse({ limit: -5 });
      expect(r.success).toBe(false);
    });
  });

  describe("getEvaluationSchema", () => {
    it("accepts valid UUID", () => {
      const r = getEvaluationSchema.safeParse({
        canEvalUuid: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(r.success).toBe(true);
    });

    it("rejects empty string", () => {
      const r = getEvaluationSchema.safeParse({ canEvalUuid: "" });
      expect(r.success).toBe(false);
    });

    it("rejects missing field", () => {
      const r = getEvaluationSchema.safeParse({});
      expect(r.success).toBe(false);
    });
  });

  describe("createEvaluationSchema", () => {
    it("accepts valid create payload", () => {
      const r = createEvaluationSchema.safeParse({
        candidateId: "42",
        deptId: "1",
        startDate: "2026-06-01",
        endDate: "2026-06-30",
        staffId: "7",
      });
      expect(r.success).toBe(true);
    });

    it("accepts without optional deptId", () => {
      const r = createEvaluationSchema.safeParse({
        candidateId: "42",
        startDate: "2026-06-01",
        endDate: "2026-06-30",
        staffId: "7",
      });
      expect(r.success).toBe(true);
    });

    it("rejects missing candidateId", () => {
      const r = createEvaluationSchema.safeParse({
        startDate: "2026-06-01",
        endDate: "2026-06-30",
        staffId: "7",
      });
      expect(r.success).toBe(false);
    });

    it("rejects missing staffId", () => {
      const r = createEvaluationSchema.safeParse({
        candidateId: "42",
        startDate: "2026-06-01",
        endDate: "2026-06-30",
      });
      expect(r.success).toBe(false);
    });

    it("rejects missing startDate", () => {
      const r = createEvaluationSchema.safeParse({
        candidateId: "42",
        endDate: "2026-06-30",
        staffId: "7",
      });
      expect(r.success).toBe(false);
    });

    it("rejects non-positive candidateId", () => {
      const r = createEvaluationSchema.safeParse({
        candidateId: "0",
        startDate: "2026-06-01",
        endDate: "2026-06-30",
        staffId: "7",
      });
      expect(r.success).toBe(false);
    });
  });

  describe("updateEvaluationSchema", () => {
    it("accepts valid update payload with optional fields", () => {
      const r = updateEvaluationSchema.safeParse({
        canEvalUuid: "550e8400-e29b-41d4-a716-446655440000",
        candidateId: "42",
        staffId: "7",
      });
      expect(r.success).toBe(true);
    });

    it("accepts update with only UUID (partial update)", () => {
      const r = updateEvaluationSchema.safeParse({
        canEvalUuid: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(r.success).toBe(true);
    });

    it("rejects empty canEvalUuid", () => {
      const r = updateEvaluationSchema.safeParse({ canEvalUuid: "" });
      expect(r.success).toBe(false);
    });

    it("rejects missing canEvalUuid", () => {
      const r = updateEvaluationSchema.safeParse({ candidateId: "42" });
      expect(r.success).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Output schemas — returned from server actions
  // -----------------------------------------------------------------------

  describe("evaluationRowSchema", () => {
    it("validates a complete evaluation row", () => {
      const row = {
        can_eval_uuid: "550e8400-e29b-41d4-a716-446655440000",
        candidate_id: 42,
        candidate_name: "Ahmed Al-Sabah",
        dept_id: 1,
        start_date: "2026-06-01",
        end_date: "2026-06-30",
        staff_id: 7,
        staff_name: "Dr. Fatima",
        created_at: new Date("2026-06-01"),
        updated_at: new Date("2026-06-15"),
      };
      const r = evaluationRowSchema.safeParse(row);
      expect(r.success).toBe(true);
    });

    it("validates a row with null fields", () => {
      const row = {
        can_eval_uuid: "550e8400-e29b-41d4-a716-446655440000",
        candidate_id: null,
        candidate_name: null,
        dept_id: null,
        start_date: null,
        end_date: null,
        staff_id: null,
        staff_name: null,
        created_at: null,
        updated_at: null,
      };
      const r = evaluationRowSchema.safeParse(row);
      expect(r.success).toBe(true);
    });

    it("rejects missing can_eval_uuid", () => {
      const r = evaluationRowSchema.safeParse({ candidate_id: 42 });
      expect(r.success).toBe(false);
    });
  });

  describe("listEvaluationsResultSchema", () => {
    it("validates an empty result", () => {
      const r = listEvaluationsResultSchema.safeParse({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });
      expect(r.success).toBe(true);
    });

    it("validates a result with items", () => {
      const r = listEvaluationsResultSchema.safeParse({
        items: [
          {
            can_eval_uuid: "550e8400-e29b-41d4-a716-446655440000",
            candidate_id: 42,
            candidate_name: "Ahmed",
            dept_id: 1,
            start_date: "2026-06-01",
            end_date: "2026-06-30",
            staff_id: 7,
            staff_name: "Dr. Fatima",
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      expect(r.success).toBe(true);
      if (r.success) {
        expect((r as { success: true; data: ListEvaluationsResult }).data.items).toHaveLength(1);
      }
    });

    it("rejects negative total", () => {
      const r = listEvaluationsResultSchema.safeParse({
        items: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
      });
      expect(r.success).toBe(false);
    });
  });

  describe("getEvaluationResultSchema", () => {
    it("validates an evaluation found", () => {
      const r = getEvaluationResultSchema.safeParse({
        evaluation: {
          can_eval_uuid: "550e8400-e29b-41d4-a716-446655440000",
          candidate_id: 42,
          candidate_name: "Ahmed",
          dept_id: 1,
          start_date: "2026-06-01",
          end_date: "2026-06-30",
          staff_id: 7,
          staff_name: "Dr. Fatima",
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      expect(r.success).toBe(true);
    });

    it("validates a null evaluation (not found)", () => {
      const r = getEvaluationResultSchema.safeParse({ evaluation: null });
      expect(r.success).toBe(true);
    });
  });

  describe("evaluationActionResultSchema", () => {
    it("validates a success result", () => {
      const r = evaluationActionResultSchema.safeParse({
        success: true,
        canEvalUuid: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(r.success).toBe(true);
    });

    it("validates an error result", () => {
      const r = evaluationActionResultSchema.safeParse({
        success: false,
        error: "Evaluation not found",
      });
      expect(r.success).toBe(true);
    });

    it("validates a minimal result (success only)", () => {
      const r = evaluationActionResultSchema.safeParse({ success: true });
      expect(r.success).toBe(true);
    });

    it("rejects missing success field", () => {
      const r = evaluationActionResultSchema.safeParse({});
      expect(r.success).toBe(false);
    });
  });
});
