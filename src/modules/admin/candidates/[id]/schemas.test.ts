import { describe, it, expect } from "vitest";
import {
  getCandidateDetailSchema,
  updateCandidateStatusSchema,
  updateCandidateSchema,
  deleteCandidateSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// getCandidateDetailSchema tests
// ---------------------------------------------------------------------------

describe("getCandidateDetailSchema", () => {
  it("accepts a valid candidateId", () => {
    expect(getCandidateDetailSchema.safeParse({ candidateId: 42 }).success).toBe(
      true,
    );
  });

  it("coerces string number to number", () => {
    expect(
      getCandidateDetailSchema.safeParse({ candidateId: "42" }).success,
    ).toBe(true);
  });

  it("rejects missing candidateId", () => {
    expect(getCandidateDetailSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero candidateId", () => {
    expect(getCandidateDetailSchema.safeParse({ candidateId: 0 }).success).toBe(
      false,
    );
  });

  it("rejects negative candidateId", () => {
    expect(
      getCandidateDetailSchema.safeParse({ candidateId: -1 }).success,
    ).toBe(false);
  });

  it("rejects non-numeric candidateId", () => {
    expect(
      getCandidateDetailSchema.safeParse({ candidateId: "abc" }).success,
    ).toBe(false);
  });

  it("rejects null candidateId", () => {
    expect(getCandidateDetailSchema.safeParse({ candidateId: null }).success).toBe(
      false,
    );
  });
});

// ---------------------------------------------------------------------------
// updateCandidateStatusSchema tests
// ---------------------------------------------------------------------------

describe("updateCandidateStatusSchema", () => {
  const valid = { candidateId: 1, status: 10 };

  it("accepts valid status 10 (active)", () => {
    expect(updateCandidateStatusSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts status 20 (inactive)", () => {
    expect(
      updateCandidateStatusSchema.safeParse({ ...valid, status: 20 }).success,
    ).toBe(true);
  });

  it("accepts status 30 (banned)", () => {
    expect(
      updateCandidateStatusSchema.safeParse({ ...valid, status: 30 }).success,
    ).toBe(true);
  });

  it("coerces string number status", () => {
    expect(
      updateCandidateStatusSchema.safeParse({
        candidateId: "1",
        status: "10",
      }).success,
    ).toBe(true);
  });

  it("rejects status 0 (invalid)", () => {
    expect(
      updateCandidateStatusSchema.safeParse({ ...valid, status: 0 }).success,
    ).toBe(false);
  });

  it("rejects status 40 (not in allowed set)", () => {
    expect(
      updateCandidateStatusSchema.safeParse({ ...valid, status: 40 }).success,
    ).toBe(false);
  });

  it("rejects missing candidateId", () => {
    expect(
      updateCandidateStatusSchema.safeParse({ status: 10 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateCandidateSchema tests
// ---------------------------------------------------------------------------

describe("updateCandidateSchema", () => {
  const valid = { candidateId: 1 };

  it("accepts only required candidateId", () => {
    expect(updateCandidateSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts all optional fields", () => {
    expect(
      updateCandidateSchema.safeParse({
        candidateId: 1,
        candidateName: "John Doe",
        candidateNameAr: "جون دو",
        candidateEmail: "john@example.com",
        candidatePhone: "+96512345678",
        candidateGender: 1,
        candidateBirthDate: "2000-01-01",
        candidateHourlyRate: 2.5,
        currencyCode: "KWD",
        storeId: 5,
        countryId: 3,
        universityId: 7,
        candidateObjective: "Looking for opportunities",
      }).success,
    ).toBe(true);
  });

  it("rejects candidateName exceeding 255 chars", () => {
    expect(
      updateCandidateSchema.safeParse({
        ...valid,
        candidateName: "x".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("rejects candidateEmail that exceeds 255 chars", () => {
    expect(
      updateCandidateSchema.safeParse({
        ...valid,
        candidateEmail: "a".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("rejects non-string candidateEmail", () => {
    expect(
      updateCandidateSchema.safeParse({
        ...valid,
        candidateEmail: 12345,
      }).success,
    ).toBe(false);
  });

  it("accepts partial update with single field", () => {
    expect(
      updateCandidateSchema.safeParse({
        candidateId: 1,
        candidateName: "Updated Name",
      }).success,
    ).toBe(true);
  });

  it("rejects missing candidateId", () => {
    expect(updateCandidateSchema.safeParse({}).success).toBe(false);
  });

  it("rejects candidateId of zero", () => {
    expect(
      updateCandidateSchema.safeParse({ candidateId: 0 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteCandidateSchema tests
// ---------------------------------------------------------------------------

describe("deleteCandidateSchema", () => {
  it("accepts a valid candidateId", () => {
    expect(deleteCandidateSchema.safeParse({ candidateId: 1 }).success).toBe(
      true,
    );
  });

  it("coerces string number", () => {
    expect(deleteCandidateSchema.safeParse({ candidateId: "1" }).success).toBe(
      true,
    );
  });

  it("rejects missing candidateId", () => {
    expect(deleteCandidateSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero candidateId", () => {
    expect(deleteCandidateSchema.safeParse({ candidateId: 0 }).success).toBe(
      false,
    );
  });

  it("rejects negative candidateId", () => {
    expect(deleteCandidateSchema.safeParse({ candidateId: -5 }).success).toBe(
      false,
    );
  });
});
