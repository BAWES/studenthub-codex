import { describe, it, expect } from "vitest";
import {
  getCandidateDetailSchema,
  updateCandidateStatusSchema,
  updateCandidateSchema,
  deleteCandidateSchema,
} from "./schemas";

/**
 * Page migration test for admin/candidates/[id].
 *
 * Verifies the data contract between page and action.
 * The admin candidate detail page uses getCandidateDetail to display
 * candidate information.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("admin candidate detail page — data contract", () => {
  // -----------------------------------------------------------------------
  // getCandidateDetailSchema
  // -----------------------------------------------------------------------
  it("getCandidateDetailSchema accepts valid candidateId", () => {
    const r = getCandidateDetailSchema.safeParse({ candidateId: 42 });
    expect(r.success).toBe(true);
  });

  it("getCandidateDetailSchema coerces string number", () => {
    const r = getCandidateDetailSchema.safeParse({ candidateId: "42" });
    expect(r.success).toBe(true);
  });

  it("getCandidateDetailSchema rejects missing candidateId", () => {
    const r = getCandidateDetailSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("getCandidateDetailSchema rejects zero candidateId", () => {
    const r = getCandidateDetailSchema.safeParse({ candidateId: 0 });
    expect(r.success).toBe(false);
  });

  // -----------------------------------------------------------------------
  // updateCandidateStatusSchema
  // -----------------------------------------------------------------------
  it("updateCandidateStatusSchema accepts valid inputs", () => {
    const r = updateCandidateStatusSchema.safeParse({
      candidateId: 1,
      status: 10,
    });
    expect(r.success).toBe(true);
  });

  it("updateCandidateStatusSchema accepts status 20", () => {
    const r = updateCandidateStatusSchema.safeParse({
      candidateId: 1,
      status: 20,
    });
    expect(r.success).toBe(true);
  });

  it("updateCandidateStatusSchema rejects invalid status 0", () => {
    const r = updateCandidateStatusSchema.safeParse({
      candidateId: 1,
      status: 0,
    });
    expect(r.success).toBe(false);
  });

  it("updateCandidateStatusSchema rejects status not in {10,20,30}", () => {
    const r = updateCandidateStatusSchema.safeParse({
      candidateId: 1,
      status: 99,
    });
    expect(r.success).toBe(false);
  });

  // -----------------------------------------------------------------------
  // updateCandidateSchema
  // -----------------------------------------------------------------------
  it("updateCandidateSchema accepts only required candidateId", () => {
    const r = updateCandidateSchema.safeParse({ candidateId: 1 });
    expect(r.success).toBe(true);
  });

  it("updateCandidateSchema accepts all optional fields", () => {
    const r = updateCandidateSchema.safeParse({
      candidateId: 1,
      candidateName: "John Doe",
      candidateEmail: "john@example.com",
      candidatePhone: "+96556781234",
    });
    expect(r.success).toBe(true);
  });

  it("updateCandidateSchema rejects name exceeding 255 chars", () => {
    const r = updateCandidateSchema.safeParse({
      candidateId: 1,
      candidateName: "x".repeat(256),
    });
    expect(r.success).toBe(false);
  });

  it("updateCandidateSchema rejects missing candidateId", () => {
    const r = updateCandidateSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  // -----------------------------------------------------------------------
  // deleteCandidateSchema
  // -----------------------------------------------------------------------
  it("deleteCandidateSchema accepts valid candidateId", () => {
    const r = deleteCandidateSchema.safeParse({ candidateId: 1 });
    expect(r.success).toBe(true);
  });

  it("deleteCandidateSchema rejects zero candidateId", () => {
    const r = deleteCandidateSchema.safeParse({ candidateId: 0 });
    expect(r.success).toBe(false);
  });

  it("deleteCandidateSchema rejects missing candidateId", () => {
    const r = deleteCandidateSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});
