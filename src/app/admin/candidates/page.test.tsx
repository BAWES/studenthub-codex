import { describe, it, expect } from "vitest";
import {
  listCandidatesSchema,
  getCandidateSchema,
  searchCandidatesSchema,
  createCandidateSchema,
  updateCandidateSchema,
  deleteCandidateSchema,
  candidateRowOutputSchema,
  candidateListOutputSchema,
  candidateActionResultOutputSchema,
} from "./schemas";

/**
 * Page migration test for admin/candidates.
 *
 * Verifies the data contract between page and action.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("admin candidates page — data contract", () => {
  it("listCandidatesSchema parses with defaults", () => {
    const r = listCandidatesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("listCandidatesSchema accepts filters", () => {
    const r = listCandidatesSchema.safeParse({ status: 2, q: "ahmed", storeId: 5 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe(2);
      expect(r.data.q).toBe("ahmed");
      expect(r.data.storeId).toBe(5);
    }
  });

  it("getCandidateSchema validates with candidateId", () => {
    const r = getCandidateSchema.safeParse({ candidateId: 42 });
    expect(r.success).toBe(true);
  });

  it("getCandidateSchema rejects missing candidateId", () => {
    const r = getCandidateSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("searchCandidatesSchema validates with query", () => {
    const r = searchCandidatesSchema.safeParse({ q: "Ahmed" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.q).toBe("Ahmed");
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("searchCandidatesSchema rejects empty query", () => {
    const r = searchCandidatesSchema.safeParse({ q: "" });
    expect(r.success).toBe(false);
  });

  it("createCandidateSchema validates with required fields", () => {
    const r = createCandidateSchema.safeParse({
      name: "Ahmed Ali",
      email: "ahmed@test.com",
    });
    expect(r.success).toBe(true);
  });

  it("createCandidateSchema rejects missing name", () => {
    const r = createCandidateSchema.safeParse({ email: "ahmed@test.com" });
    expect(r.success).toBe(false);
  });

  it("createCandidateSchema rejects missing email", () => {
    const r = createCandidateSchema.safeParse({ name: "Ahmed Ali" });
    expect(r.success).toBe(false);
  });

  it("createCandidateSchema rejects invalid email", () => {
    const r = createCandidateSchema.safeParse({
      name: "Ahmed Ali",
      email: "not-an-email",
    });
    expect(r.success).toBe(false);
  });

  it("updateCandidateSchema validates with candidateId", () => {
    const r = updateCandidateSchema.safeParse({ candidateId: 42 });
    expect(r.success).toBe(true);
  });

  it("updateCandidateSchema accepts partial update with optional fields", () => {
    const r = updateCandidateSchema.safeParse({
      candidateId: 42,
      name: "Ahmed Updated",
      phone: null,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Ahmed Updated");
      expect(r.data.phone).toBeNull();
    }
  });

  it("updateCandidateSchema rejects missing candidateId", () => {
    const r = updateCandidateSchema.safeParse({ name: "Ahmed Ali" });
    expect(r.success).toBe(false);
  });

  it("deleteCandidateSchema validates with candidateId", () => {
    const r = deleteCandidateSchema.safeParse({ candidateId: 42 });
    expect(r.success).toBe(true);
  });

  it("deleteCandidateSchema rejects missing candidateId", () => {
    const r = deleteCandidateSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("candidateRowOutputSchema validates a row entry", () => {
    const r = candidateRowOutputSchema.safeParse({
      candidate_id: 1,
      name: "Ahmed Ali",
      name_ar: "أحمد علي",
      email: "ahmed@test.com",
      phone: "+965 5555 1234",
      status: 1,
      store_name: "Main Store",
      created_at: "2026-06-14T10:00:00Z",
      updated_at: "2026-06-14T10:00:00Z",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidate_id).toBe(1);
      expect(r.data.name).toBe("Ahmed Ali");
    }
  });

  it("candidateRowOutputSchema accepts nullable fields", () => {
    const r = candidateRowOutputSchema.safeParse({
      candidate_id: 2,
      name: "Sara",
      name_ar: "سارة",
      email: "sara@test.com",
      phone: null,
      status: 2,
      store_name: null,
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("candidateRowOutputSchema rejects missing required candidate_id", () => {
    const r = candidateRowOutputSchema.safeParse({
      name: "Ahmed",
      name_ar: "أحمد",
      email: "ahmed@test.com",
      status: 1,
    });
    expect(r.success).toBe(false);
  });

  it("candidateRowOutputSchema rejects missing required name", () => {
    const r = candidateRowOutputSchema.safeParse({
      candidate_id: 1,
      name_ar: "أحمد",
      email: "ahmed@test.com",
      status: 1,
    });
    expect(r.success).toBe(false);
  });

  it("candidateRowOutputSchema rejects missing required email", () => {
    const r = candidateRowOutputSchema.safeParse({
      candidate_id: 1,
      name: "Ahmed",
      name_ar: "أحمد",
      status: 1,
    });
    expect(r.success).toBe(false);
  });

  it("candidateListOutputSchema validates paginated result", () => {
    const r = candidateListOutputSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("candidateListOutputSchema validates with items", () => {
    const r = candidateListOutputSchema.safeParse({
      items: [
        {
          candidate_id: 1,
          name: "Ahmed Ali",
          name_ar: "أحمد علي",
          email: "ahmed@test.com",
          phone: null,
          status: 1,
          store_name: null,
          created_at: null,
          updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.items.length).toBe(1);
    }
  });

  it("candidateActionResultOutputSchema validates success result", () => {
    const r = candidateActionResultOutputSchema.safeParse({
      success: true,
      candidateId: 42,
    });
    expect(r.success).toBe(true);
  });

  it("candidateActionResultOutputSchema validates failure result", () => {
    const r = candidateActionResultOutputSchema.safeParse({
      success: false,
      error: "Candidate not found",
    });
    expect(r.success).toBe(true);
  });

  it("candidateActionResultOutputSchema rejects missing fields", () => {
    const r = candidateActionResultOutputSchema.safeParse({ success: true });
    expect(r.success).toBe(false);
  });
});
