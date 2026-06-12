import { describe, it, expect } from "vitest";
import {
  getCandidateDetailSchema,
  updateCandidateStatusSchema,
  updateCandidateSchema,
  deleteCandidateSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// getCandidateDetailSchema
// ---------------------------------------------------------------------------
describe("getCandidateDetailSchema", () => {
  it("accepts a valid candidateId as number", () => {
    expect(getCandidateDetailSchema.safeParse({ candidateId: 1 }).success).toBe(true);
  });

  it("accepts a valid candidateId as string (coerced)", () => {
    expect(getCandidateDetailSchema.safeParse({ candidateId: "42" }).success).toBe(true);
  });

  it("rejects missing candidateId", () => {
    expect(getCandidateDetailSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero candidateId", () => {
    expect(getCandidateDetailSchema.safeParse({ candidateId: 0 }).success).toBe(false);
  });

  it("rejects negative candidateId", () => {
    expect(getCandidateDetailSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });

  it("rejects non-numeric string", () => {
    expect(getCandidateDetailSchema.safeParse({ candidateId: "abc" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateCandidateStatusSchema
// ---------------------------------------------------------------------------
describe("updateCandidateStatusSchema", () => {
  it("accepts status 10 (active)", () => {
    expect(updateCandidateStatusSchema.safeParse({ candidateId: 1, status: 10 }).success).toBe(true);
  });

  it("accepts status 20 (inactive)", () => {
    expect(updateCandidateStatusSchema.safeParse({ candidateId: 1, status: 20 }).success).toBe(true);
  });

  it("accepts status 30 (banned)", () => {
    expect(updateCandidateStatusSchema.safeParse({ candidateId: 1, status: 30 }).success).toBe(true);
  });

  it("accepts coerced string values", () => {
    expect(updateCandidateStatusSchema.safeParse({ candidateId: "1", status: "10" }).success).toBe(true);
  });

  it("rejects missing status", () => {
    expect(updateCandidateStatusSchema.safeParse({ candidateId: 1 }).success).toBe(false);
  });

  it("rejects invalid status value", () => {
    expect(updateCandidateStatusSchema.safeParse({ candidateId: 1, status: 99 }).success).toBe(false);
  });

  it("rejects zero candidateId", () => {
    expect(updateCandidateStatusSchema.safeParse({ candidateId: 0, status: 10 }).success).toBe(false);
  });

  it("rejects zero status", () => {
    expect(updateCandidateStatusSchema.safeParse({ candidateId: 1, status: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateCandidateSchema
// ---------------------------------------------------------------------------
describe("updateCandidateSchema", () => {
  const validMinimal = { candidateId: 1 };

  it("accepts minimal input (candidateId only)", () => {
    expect(updateCandidateSchema.safeParse(validMinimal).success).toBe(true);
  });

  it("accepts full input", () => {
    expect(
      updateCandidateSchema.safeParse({
        candidateId: 1,
        candidateName: "Alice",
        candidateNameAr: "أليس",
        candidateEmail: "alice@test.com",
        candidatePhone: "+96512345678",
        candidateGender: 1,
        candidateBirthDate: "1995-06-15",
        candidateHourlyRate: 30.5,
        currencyCode: "KWD",
        storeId: 5,
        countryId: 1,
        universityId: 3,
        candidateObjective: "Seeking position",
      }).success,
    ).toBe(true);
  });

  it("rejects missing candidateId", () => {
    expect(updateCandidateSchema.safeParse({}).success).toBe(false);
  });

  it("rejects candidateName exceeding 255 chars", () => {
    expect(
      updateCandidateSchema.safeParse({ candidateId: 1, candidateName: "x".repeat(256) }).success,
    ).toBe(false);
  });

  it("rejects candidateEmail exceeding 255 chars", () => {
    expect(
      updateCandidateSchema.safeParse({ candidateId: 1, candidateEmail: "x".repeat(256) }).success,
    ).toBe(false);
  });

  it("rejects candidatePhone exceeding 20 chars", () => {
    expect(
      updateCandidateSchema.safeParse({ candidateId: 1, candidatePhone: "x".repeat(21) }).success,
    ).toBe(false);
  });

  it("rejects currencyCode exceeding 3 chars", () => {
    expect(
      updateCandidateSchema.safeParse({ candidateId: 1, currencyCode: "KWDX" }).success,
    ).toBe(false);
  });

  it("rejects zero candidateId", () => {
    expect(updateCandidateSchema.safeParse({ candidateId: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteCandidateSchema
// ---------------------------------------------------------------------------
describe("deleteCandidateSchema", () => {
  it("accepts a valid candidateId", () => {
    expect(deleteCandidateSchema.safeParse({ candidateId: 1 }).success).toBe(true);
  });

  it("accepts coerced string", () => {
    expect(deleteCandidateSchema.safeParse({ candidateId: "99" }).success).toBe(true);
  });

  it("rejects missing candidateId", () => {
    expect(deleteCandidateSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero candidateId", () => {
    expect(deleteCandidateSchema.safeParse({ candidateId: 0 }).success).toBe(false);
  });

  it("rejects negative candidateId", () => {
    expect(deleteCandidateSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });
});
