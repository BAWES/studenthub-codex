import { describe, it, expect } from "vitest";
import {
  listCandidatesSchema,
  getCandidateByIdSchema,
  candidateRowOutputSchema,
  candidateListOutputSchema,
  candidateDetailOutputSchema,
} from "./schemas";

/**
 * Page migration test for staff/candidates.
 *
 * Verifies the data contract between page and action.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("staff candidates page — data contract", () => {
  it("listCandidatesSchema accepts valid input", () => {
    const r = listCandidatesSchema.safeParse({
      page: 1,
      limit: 20,
      q: "test",
      status: "active",
    });
    expect(r.success).toBe(true);
  });

  it("listCandidatesSchema accepts empty input (defaults)", () => {
    const r = listCandidatesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("listCandidatesSchema rejects negative page", () => {
    const r = listCandidatesSchema.safeParse({ page: -1 });
    expect(r.success).toBe(false);
  });

  it("getCandidateByIdSchema validates with candidateId", () => {
    const r = getCandidateByIdSchema.safeParse({ candidateId: "42" });
    expect(r.success).toBe(true);
  });

  it("getCandidateByIdSchema rejects missing candidateId", () => {
    const r = getCandidateByIdSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("candidateRowOutputSchema validates a candidate row", () => {
    const r = candidateRowOutputSchema.safeParse({
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "+96512345678",
      status: 1,
      createdAt: "2026-01-01T00:00:00Z",
    });
    expect(r.success).toBe(true);
  });

  it("candidateRowOutputSchema accepts nullable phone", () => {
    const r = candidateRowOutputSchema.safeParse({
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: null,
      status: 1,
      createdAt: "2026-01-01T00:00:00Z",
    });
    expect(r.success).toBe(true);
  });

  it("candidateListOutputSchema validates paginated result", () => {
    const r = candidateListOutputSchema.safeParse({
      items: [
        {
          id: 1,
          name: "John",
          email: "john@test.com",
          phone: null,
          status: 1,
          createdAt: "2026-01-01T00:00:00Z",
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("candidateDetailOutputSchema validates detail object", () => {
    const r = candidateDetailOutputSchema.safeParse({
      id: 1,
      name: "John Doe",
      nameAr: "جون دو",
      email: "john@example.com",
      phone: "+96512345678",
      gender: 1,
      objective: "Seeking internship",
      status: 1,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-15T00:00:00Z",
    });
    expect(r.success).toBe(true);
  });
});
