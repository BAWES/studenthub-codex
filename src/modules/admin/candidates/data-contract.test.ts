import { describe, it, expect } from "vitest";
import { listCandidatesSchema, getCandidateSchema, searchCandidatesSchema } from "./schemas";

describe("admin candidates — data contracts", () => {
  it("listCandidatesSchema defaults page and limit", () => {
    const r = listCandidatesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("listCandidatesSchema accepts search query", () => {
    const r = listCandidatesSchema.safeParse({ q: "Ahmed", page: 2, limit: 50 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.q).toBe("Ahmed");
      expect(r.data.page).toBe(2);
    }
  });

  it("listCandidatesSchema rejects negative page", () => {
    const r = listCandidatesSchema.safeParse({ page: -1 });
    expect(r.success).toBe(false);
  });

  it("getCandidateSchema rejects missing candidateId", () => {
    const r = getCandidateSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("getCandidateSchema accepts valid candidateId", () => {
    const r = getCandidateSchema.safeParse({ candidateId: 42 });
    expect(r.success).toBe(true);
  });

  it("searchCandidatesSchema requires query", () => {
    const r = searchCandidatesSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("searchCandidatesSchema accepts valid search", () => {
    const r = searchCandidatesSchema.safeParse({ q: "Al-Sabah" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });
});
