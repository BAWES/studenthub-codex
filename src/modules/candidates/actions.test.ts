import { describe, it, expect } from "vitest";
import { getCandidateProfileSchema } from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests — pure unit tests, no DB required
// ---------------------------------------------------------------------------

describe("getCandidateProfileSchema", () => {
  it("accepts a valid positive candidateId (number)", () => {
    const r = getCandidateProfileSchema.safeParse({ candidateId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(42);
    }
  });

  it("coerces string candidateId to number", () => {
    const r = getCandidateProfileSchema.safeParse({ candidateId: "99" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(99);
    }
  });

  it("rejects zero candidateId", () => {
    expect(getCandidateProfileSchema.safeParse({ candidateId: 0 }).success).toBe(false);
  });

  it("rejects negative candidateId", () => {
    expect(getCandidateProfileSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });

  it("rejects non-numeric candidateId", () => {
    expect(getCandidateProfileSchema.safeParse({ candidateId: "abc" }).success).toBe(false);
  });

  it("rejects missing candidateId", () => {
    expect(getCandidateProfileSchema.safeParse({}).success).toBe(false);
  });
});
