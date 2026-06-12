import { describe, it, expect } from "vitest";
import {
  getCandidateProfileSchema,
  educationStateResultSchema,
  candidateActionErrorResultSchema,
  changePasswordResultSchema,
} from "./schemas";

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

// ---------------------------------------------------------------------------
// educationStateResultSchema
// ---------------------------------------------------------------------------

describe("educationStateResultSchema", () => {
  it("accepts success: true with no error", () => {
    const r = educationStateResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("accepts success: false with error message", () => {
    const r = educationStateResultSchema.safeParse({ success: false, error: "Something went wrong." });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.success).toBe(false);
      expect(r.data.error).toBe("Something went wrong.");
    }
  });

  it("accepts success: false without error", () => {
    const r = educationStateResultSchema.safeParse({ success: false });
    expect(r.success).toBe(true);
  });

  it("rejects missing success field", () => {
    expect(educationStateResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-boolean success", () => {
    expect(educationStateResultSchema.safeParse({ success: "yes" }).success).toBe(false);
  });

  it("rejects non-string error", () => {
    expect(educationStateResultSchema.safeParse({ success: false, error: 42 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateActionErrorResultSchema
// ---------------------------------------------------------------------------

describe("candidateActionErrorResultSchema", () => {
  it("accepts empty error string (success case)", () => {
    const r = candidateActionErrorResultSchema.safeParse({ error: "" });
    expect(r.success).toBe(true);
  });

  it("accepts non-empty error string (failure case)", () => {
    const r = candidateActionErrorResultSchema.safeParse({ error: "Invalid input." });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.error).toBe("Invalid input.");
  });

  it("rejects missing error field", () => {
    expect(candidateActionErrorResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-string error", () => {
    expect(candidateActionErrorResultSchema.safeParse({ error: false }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// changePasswordResultSchema
// ---------------------------------------------------------------------------

describe("changePasswordResultSchema", () => {
  it("accepts success: true", () => {
    const r = changePasswordResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.success).toBe(true);
    }
  });

  it("accepts success: false with error string", () => {
    const r = changePasswordResultSchema.safeParse({ success: false, error: "Incorrect password." });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.success).toBe(false);
    }
  });

  it("accepts success: false with fieldErrors", () => {
    const r = changePasswordResultSchema.safeParse({
      success: false,
      fieldErrors: { currentPassword: ["Required"] },
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.success).toBe(false);
    }
  });

  it("rejects success: false missing both error and fieldErrors", () => {
    const r = changePasswordResultSchema.safeParse({ success: false });
    expect(r.success).toBe(false);
  });

  it("accepts success: false with both error and fieldErrors (union picks first match)", () => {
    // z.union matches the first fitting variant; extra keys are allowed,
    // so {success:false, error, fieldErrors} matches the error variant.
    const r = changePasswordResultSchema.safeParse({
      success: false,
      error: "Nope",
      fieldErrors: { x: ["y"] },
    });
    expect(r.success).toBe(true);
  });

  it("rejects non-boolean success", () => {
    expect(changePasswordResultSchema.safeParse({ success: 1 }).success).toBe(false);
  });
});
