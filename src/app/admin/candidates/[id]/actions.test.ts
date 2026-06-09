import { describe, it, expect } from "vitest";
import {
  getCandidateByIdSchema,
  updateCandidateStatusSchema,
  verifyCredentialsSchema,
} from "./actions";

// ---------------------------------------------------------------------------
// Schema tests — pure unit tests, no DB required
// ---------------------------------------------------------------------------

describe("getCandidateByIdSchema", () => {
  it("accepts a valid positive candidate ID", () => {
    const r = getCandidateByIdSchema.safeParse({ candidateId: 42 });
    expect(r.success).toBe(true);
  });

  it("rejects zero ID", () => {
    expect(getCandidateByIdSchema.safeParse({ candidateId: 0 }).success).toBe(false);
  });

  it("rejects negative ID", () => {
    expect(getCandidateByIdSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });

  it("rejects non-numeric ID", () => {
    expect(getCandidateByIdSchema.safeParse({ candidateId: "abc" }).success).toBe(false);
  });

  it("coerces string candidateId to number", () => {
    const r = getCandidateByIdSchema.safeParse({ candidateId: "99" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(99);
    }
  });

  it("rejects missing candidateId", () => {
    expect(getCandidateByIdSchema.safeParse({}).success).toBe(false);
  });
});

describe("updateCandidateStatusSchema", () => {
  it("accepts a valid candidate ID and status number", () => {
    const r = updateCandidateStatusSchema.safeParse({
      candidateId: 42,
      status: 10,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(42);
      expect(r.data.status).toBe(10);
    }
  });

  it("accepts status 0 (inactive)", () => {
    const r = updateCandidateStatusSchema.safeParse({
      candidateId: 1,
      status: 0,
    });
    expect(r.success).toBe(true);
  });

  it("accepts negative status (soft-deleted)", () => {
    const r = updateCandidateStatusSchema.safeParse({
      candidateId: 1,
      status: -10,
    });
    expect(r.success).toBe(true);
  });

  it("rejects zero candidateId", () => {
    expect(
      updateCandidateStatusSchema.safeParse({ candidateId: 0, status: 10 })
        .success,
    ).toBe(false);
  });

  it("rejects negative candidateId", () => {
    expect(
      updateCandidateStatusSchema.safeParse({ candidateId: -5, status: 10 })
        .success,
    ).toBe(false);
  });

  it("rejects missing candidateId", () => {
    expect(
      updateCandidateStatusSchema.safeParse({ status: 10 }).success,
    ).toBe(false);
  });

  it("rejects missing status", () => {
    expect(
      updateCandidateStatusSchema.safeParse({ candidateId: 42 }).success,
    ).toBe(false);
  });

  it("rejects non-numeric status", () => {
    expect(
      updateCandidateStatusSchema.safeParse({
        candidateId: 1,
        status: "active",
      }).success,
    ).toBe(false);
  });

  it("rejects non-numeric candidateId", () => {
    expect(
      updateCandidateStatusSchema.safeParse({
        candidateId: "abc",
        status: 10,
      }).success,
    ).toBe(false);
  });

  it("accepts string coercion for both fields", () => {
    const r = updateCandidateStatusSchema.safeParse({
      candidateId: "42",
      status: "20",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(42);
      expect(r.data.status).toBe(20);
    }
  });
});

describe("verifyCredentialsSchema", () => {
  it("accepts a valid positive candidate ID", () => {
    const r = verifyCredentialsSchema.safeParse({ candidateId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(42);
    }
  });

  it("rejects zero ID", () => {
    expect(verifyCredentialsSchema.safeParse({ candidateId: 0 }).success).toBe(false);
  });

  it("rejects negative ID", () => {
    expect(verifyCredentialsSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });

  it("rejects non-numeric ID", () => {
    expect(verifyCredentialsSchema.safeParse({ candidateId: "xyz" }).success).toBe(false);
  });

  it("coerces string candidateId to number", () => {
    const r = verifyCredentialsSchema.safeParse({ candidateId: "55" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(55);
    }
  });

  it("rejects missing candidateId", () => {
    expect(verifyCredentialsSchema.safeParse({}).success).toBe(false);
  });
});
