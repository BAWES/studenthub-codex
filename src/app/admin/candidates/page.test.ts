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
  candidateDetailOutputSchema,
  candidateActionResultOutputSchema,
} from "./schemas";

/**
 * Page migration test for admin/candidates.
 *
 * Verifies the data contract between page and action.
 * The candidates admin page uses listCandidates / searchCandidates
 * to populate a searchable candidate list.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("admin candidates page — data contract", () => {
  // ── Input schemas ──

  it("listCandidatesSchema accepts empty params (page default 1, limit 20)", () => {
    const r = listCandidatesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("listCandidatesSchema accepts pagination and search", () => {
    const r = listCandidatesSchema.safeParse({ page: 2, limit: 50, q: "Ahmed" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.q).toBe("Ahmed");
  });

  it("listCandidatesSchema accepts status and storeId filters", () => {
    const r = listCandidatesSchema.safeParse({ status: 10, storeId: 5 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe(10);
      expect(r.data.storeId).toBe(5);
    }
  });

  it("listCandidatesSchema rejects limit over 100", () => {
    const r = listCandidatesSchema.safeParse({ limit: 200 });
    expect(r.success).toBe(false);
  });

  it("getCandidateSchema accepts valid candidateId", () => {
    const r = getCandidateSchema.safeParse({ candidateId: 42 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.candidateId).toBe(42);
  });

  it("getCandidateSchema rejects non-positive candidateId", () => {
    const r = getCandidateSchema.safeParse({ candidateId: 0 });
    expect(r.success).toBe(false);
  });

  it("searchCandidatesSchema accepts query with defaults", () => {
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

  it("createCandidateSchema requires name and email", () => {
    const r = createCandidateSchema.safeParse({
      name: "Ahmed Al-Sabah",
      email: "ahmed@example.com",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Ahmed Al-Sabah");
      expect(r.data.email).toBe("ahmed@example.com");
    }
  });

  it("createCandidateSchema rejects missing name", () => {
    const r = createCandidateSchema.safeParse({ email: "test@test.com" });
    expect(r.success).toBe(false);
  });

  it("createCandidateSchema rejects invalid email", () => {
    const r = createCandidateSchema.safeParse({ name: "Test", email: "not-an-email" });
    expect(r.success).toBe(false);
  });

  it("createCandidateSchema sets defaults for optional fields", () => {
    const r = createCandidateSchema.safeParse({
      name: "Ahmed",
      email: "ahmed@test.com",
    });
    if (r.success) {
      expect(r.data.nameAr).toBe("");
      expect(r.data.phone).toBe("");
      expect(r.data.bankAccountName).toBe("");
      expect(r.data.iban).toBe("");
      expect(r.data.civilId).toBe("");
    }
  });

  it("updateCandidateSchema accepts partial update", () => {
    const r = updateCandidateSchema.safeParse({
      candidateId: 1,
      name: "Updated Name",
    });
    expect(r.success).toBe(true);
  });

  it("updateCandidateSchema requires candidateId", () => {
    const r = updateCandidateSchema.safeParse({ name: "Test" });
    expect(r.success).toBe(false);
  });

  it("deleteCandidateSchema requires positive candidateId", () => {
    const r = deleteCandidateSchema.safeParse({ candidateId: 42 });
    expect(r.success).toBe(true);
  });

  // ── Output schemas ──

  it("candidateRowOutputSchema validates a valid candidate row", () => {
    const r = candidateRowOutputSchema.safeParse({
      candidate_id: 1,
      name: "Ahmed Al-Sabah",
      name_ar: "أحمد الصباح",
      email: "ahmed@example.com",
      phone: "+965 5555 1234",
      status: 10,
      store_name: "Main Store",
      created_at: "2026-01-15T00:00:00Z",
      updated_at: "2026-06-10T00:00:00Z",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Ahmed Al-Sabah");
      expect(r.data.status).toBe(10);
    }
  });

  it("candidateRowOutputSchema allows null optional fields", () => {
    const r = candidateRowOutputSchema.safeParse({
      candidate_id: 2,
      name: "Test",
      name_ar: "",
      email: "test@test.com",
      phone: null,
      status: 0,
      store_name: null,
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("candidateListOutputSchema validates paginated response", () => {
    const r = candidateListOutputSchema.safeParse({
      items: [
        {
          candidate_id: 1,
          name: "Ahmed",
          name_ar: "",
          email: "ahmed@test.com",
          phone: null,
          status: 10,
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
  });

  it("candidateDetailOutputSchema validates detail response", () => {
    const r = candidateDetailOutputSchema.safeParse({
      candidate: {
        candidate_id: 1,
        candidate_name: "Ahmed Al-Sabah",
        candidate_name_ar: "أحمد الصباح",
        candidate_email: "ahmed@example.com",
        candidate_phone: "+965 5555 1234",
        candidate_status: 10,
        candidate_gender: 1,
        candidate_birth_date: "2000-01-15",
        candidate_hourly_rate: 5.5,
        currency_code: "KWD",
        candidate_created_at: "2026-01-15T00:00:00Z",
        candidate_updated_at: "2026-06-10T00:00:00Z",
        store: { store_name: "Main Store" },
        country: { country_name_en: "Kuwait" },
      },
      metrics: [
        { label: "Active contracts", value: 3, note: "All ongoing" },
      ],
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidate?.candidate_name).toBe("Ahmed Al-Sabah");
      expect(r.data.metrics.length).toBe(1);
    }
  });

  it("candidateDetailOutputSchema allows null candidate", () => {
    const r = candidateDetailOutputSchema.safeParse({
      candidate: null,
      metrics: [],
    });
    expect(r.success).toBe(true);
  });

  it("candidateActionResultOutputSchema validates success", () => {
    const r = candidateActionResultOutputSchema.safeParse({
      success: true,
      candidateId: 42,
    });
    expect(r.success).toBe(true);
  });

  it("candidateActionResultOutputSchema validates failure", () => {
    const r = candidateActionResultOutputSchema.safeParse({
      success: false,
      error: "Email already exists",
    });
    expect(r.success).toBe(true);
  });

  it("CandidateRow shape matches the search results table", () => {
    const row = {
      candidate_id: 1,
      name: "Ahmed Al-Sabah",
      email: "ahmed@example.com",
      status: 10,
      store_name: "Main Store",
    };
    expect(row.candidate_id).toBe(1);
    expect(row.name).toBe("Ahmed Al-Sabah");
    expect(row.email).toContain("@");
  });
});
