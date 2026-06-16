import { describe, it, expect } from "vitest";
import {
  listCandidateEducationSchema,
  candidateEducationRowSchema,
  listCandidateEducationResultSchema,
  getCandidateEducationInputSchema,
} from "./schemas";

/**
 * Page migration test for admin/candidate-education.
 *
 * Verifies the data contract between page and action.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("admin candidate-education page — data contract", () => {
  it("listCandidateEducationSchema parses with defaults", () => {
    const r = listCandidateEducationSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("listCandidateEducationSchema accepts search param", () => {
    const r = listCandidateEducationSchema.safeParse({ search: "Kuwait U" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.search).toBe("Kuwait U");
  });

  it("candidateEducationRowSchema validates a valid row", () => {
    const r = candidateEducationRowSchema.safeParse({
      education_uuid: "edu-123",
      candidate_id: 42,
      candidate_name: "Ahmed",
      university_name: "Kuwait University",
      degree_name: "Bachelor",
      major_name: "Engineering",
      graduation_year: 2026,
      is_currently_studying: false,
      created_at: new Date("2026-06-14"),
      updated_at: null,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.university_name).toBe("Kuwait University");
  });

  it("candidateEducationRowSchema rejects missing university_name", () => {
    const r = candidateEducationRowSchema.safeParse({
      education_uuid: "edu-123",
      candidate_id: 42,
      university_name: "",
      is_currently_studying: false,
    });
    expect(r.success).toBe(false);
  });

  it("listCandidateEducationResultSchema validates paginated output", () => {
    const r = listCandidateEducationResultSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("getCandidateEducationInputSchema validates education_uuid", () => {
    const r = getCandidateEducationInputSchema.safeParse({
      education_uuid: "edu-123",
    });
    expect(r.success).toBe(true);
  });

  it("getCandidateEducationInputSchema rejects empty uuid", () => {
    const r = getCandidateEducationInputSchema.safeParse({
      education_uuid: "",
    });
    expect(r.success).toBe(false);
  });
});
