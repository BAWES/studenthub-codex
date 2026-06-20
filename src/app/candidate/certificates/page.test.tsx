import { describe, it, expect } from "vitest";
import { certificateDetailOutputSchema, certificateItemSchema, certificateActionResultSchema } from "./schemas";

describe("candidate certificates page — data contract", () => {
  it("certificateItemSchema validates a valid certificate item", () => {
    const r = certificateItemSchema.safeParse({
      certificate_uuid: "cert-123",
      certificate_type: true,
      certificate_title: "AWS Certified",
      certificate_issuer: "Amazon",
      certificate_url: null,
      candidate_id: 1,
      candidate_work_history_id: null,
      exam_uuid: null,
      store_id: null,
      company_id: null,
      parent_company_id: null,
      start_date: "2024-01-01",
      end_date: null,
      staff_id: null,
      created_at: new Date("2024-01-15"),
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("certificateItemSchema rejects missing certificate_uuid", () => {
    const r = certificateItemSchema.safeParse({ candidate_id: 1 });
    expect(r.success).toBe(false);
  });

  it("certificateDetailOutputSchema allows null result", () => {
    const r = certificateDetailOutputSchema.safeParse(null);
    expect(r.success).toBe(true);
  });

  it("certificateDetailOutputSchema validates a valid item", () => {
    const r = certificateDetailOutputSchema.safeParse({
      certificate_uuid: "c1", certificate_type: false, certificate_title: "T",
      certificate_issuer: "I", certificate_url: null, candidate_id: 1,
      candidate_work_history_id: null, exam_uuid: null, store_id: null,
      company_id: null, parent_company_id: null, start_date: null, end_date: null,
      staff_id: null, created_at: null, updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("certificateActionResultSchema validates success", () => {
    const r = certificateActionResultSchema.safeParse({ operation: "success", message: "Created" });
    expect(r.success).toBe(true);
  });

  it("certificateActionResultSchema validates error", () => {
    const r = certificateActionResultSchema.safeParse({ operation: "error", message: "Failed" });
    expect(r.success).toBe(true);
  });
});
