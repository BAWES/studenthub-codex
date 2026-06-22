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
  const validInput = { candidateId: "42" };

  it("accepts valid input", () => {
    expect(getCandidateDetailSchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts numeric candidateId", () => {
    expect(
      getCandidateDetailSchema.safeParse({ candidateId: 99 }).success,
    ).toBe(true);
  });

  it("rejects missing candidateId", () => {
    expect(getCandidateDetailSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero candidateId", () => {
    expect(
      getCandidateDetailSchema.safeParse({ candidateId: "0" }).success,
    ).toBe(false);
  });

  it("rejects negative candidateId", () => {
    expect(
      getCandidateDetailSchema.safeParse({ candidateId: "-5" }).success,
    ).toBe(false);
  });

  it("rejects non-numeric candidateId", () => {
    expect(
      getCandidateDetailSchema.safeParse({ candidateId: "abc" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateCandidateStatusSchema
// ---------------------------------------------------------------------------
describe("updateCandidateStatusSchema", () => {
  const validInput = { candidateId: "15", status: "10" };

  it("accepts valid input with active status", () => {
    expect(updateCandidateStatusSchema.safeParse(validInput).success).toBe(
      true,
    );
  });

  it("accepts status 20 (inactive)", () => {
    expect(
      updateCandidateStatusSchema.safeParse({
        candidateId: "15",
        status: "20",
      }).success,
    ).toBe(true);
  });

  it("accepts status 30 (banned)", () => {
    expect(
      updateCandidateStatusSchema.safeParse({
        candidateId: "15",
        status: "30",
      }).success,
    ).toBe(true);
  });

  it("accepts numeric input", () => {
    expect(
      updateCandidateStatusSchema.safeParse({
        candidateId: 15,
        status: 10,
      }).success,
    ).toBe(true);
  });

  it("rejects invalid status value", () => {
    expect(
      updateCandidateStatusSchema.safeParse({
        candidateId: "15",
        status: "99",
      }).success,
    ).toBe(false);
  });

  it("rejects missing candidateId", () => {
    expect(
      updateCandidateStatusSchema.safeParse({ status: "10" }).success,
    ).toBe(false);
  });

  it("rejects missing status", () => {
    expect(
      updateCandidateStatusSchema.safeParse({ candidateId: "15" }).success,
    ).toBe(false);
  });

  it("rejects wrong types", () => {
    expect(
      updateCandidateStatusSchema.safeParse({
        candidateId: "abc",
        status: true,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateCandidateSchema
// ---------------------------------------------------------------------------
describe("updateCandidateSchema", () => {
  const validInput = { candidateId: "42" };

  it("accepts valid input with just candidateId", () => {
    expect(updateCandidateSchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts all optional fields", () => {
    expect(
      updateCandidateSchema.safeParse({
        candidateId: "42",
        candidateName: "John",
        candidateNameAr: "جون",
        candidateEmail: "john@example.com",
        candidatePhone: "+965****5678",
        candidateGender: "1",
        candidateBirthDate: "2000-01-01",
        candidateHourlyRate: "5.5",
        currencyCode: "KWD",
        storeId: "10",
        countryId: "1",
        universityId: "3",
        candidateObjective: "Looking for work",
      }).success,
    ).toBe(true);
  });

  it("rejects candidateName exceeding max length", () => {
    expect(
      updateCandidateSchema.safeParse({
        candidateId: "42",
        candidateName: "x".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("rejects missing candidateId", () => {
    expect(updateCandidateSchema.safeParse({}).success).toBe(false);
  });

  it("rejects wrong type for candidateId", () => {
    expect(
      updateCandidateSchema.safeParse({ candidateId: "abc" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteCandidateSchema
// ---------------------------------------------------------------------------
describe("deleteCandidateSchema", () => {
  it("accepts valid input", () => {
    expect(
      deleteCandidateSchema.safeParse({ candidateId: "42" }).success,
    ).toBe(true);
  });

  it("accepts numeric candidateId", () => {
    expect(deleteCandidateSchema.safeParse({ candidateId: 7 }).success).toBe(
      true,
    );
  });

  it("rejects missing candidateId", () => {
    expect(deleteCandidateSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero candidateId", () => {
    expect(
      deleteCandidateSchema.safeParse({ candidateId: "0" }).success,
    ).toBe(false);
  });

  it("rejects negative candidateId", () => {
    expect(
      deleteCandidateSchema.safeParse({ candidateId: "-1" }).success,
    ).toBe(false);
  });
});
