import { describe, it, expect } from "vitest";
import {
  getCandidateDetailSchema,
  updateCandidateStatusSchema,
  updateCandidateSchema,
  deleteCandidateSchema,
} from "./schemas";

describe("getCandidateDetailSchema", () => {
  it("accepts a valid candidate ID", () => {
    const r = getCandidateDetailSchema.safeParse({ candidateId: 42 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.candidateId).toBe(42);
  });

  it("rejects negative ID", () => {
    expect(getCandidateDetailSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });

  it("rejects zero", () => {
    expect(getCandidateDetailSchema.safeParse({ candidateId: 0 }).success).toBe(false);
  });

  it("coerces string to number", () => {
    const r = getCandidateDetailSchema.safeParse({ candidateId: "99" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.candidateId).toBe(99);
  });
});

describe("updateCandidateStatusSchema", () => {
  it("accepts valid status 10 (active)", () => {
    const r = updateCandidateStatusSchema.safeParse({ candidateId: 1, status: 10 });
    expect(r.success).toBe(true);
  });

  it("accepts valid status 20 (inactive)", () => {
    expect(updateCandidateStatusSchema.safeParse({ candidateId: 1, status: 20 }).success).toBe(true);
  });

  it("accepts valid status 30 (banned)", () => {
    expect(updateCandidateStatusSchema.safeParse({ candidateId: 1, status: 30 }).success).toBe(true);
  });

  it("rejects invalid status 0", () => {
    expect(updateCandidateStatusSchema.safeParse({ candidateId: 1, status: 0 }).success).toBe(false);
  });

  it("rejects invalid status 99", () => {
    expect(updateCandidateStatusSchema.safeParse({ candidateId: 1, status: 99 }).success).toBe(false);
  });

  it("rejects missing candidateId", () => {
    expect(updateCandidateStatusSchema.safeParse({ status: 10 }).success).toBe(false);
  });

  it("coerces string status to number", () => {
    const r = updateCandidateStatusSchema.safeParse({ candidateId: 1, status: "10" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.status).toBe(10);
  });
});

describe("updateCandidateSchema", () => {
  it("accepts empty optional fields (only required)", () => {
    const r = updateCandidateSchema.safeParse({ candidateId: 1 });
    expect(r.success).toBe(true);
  });

  it("accepts all fields", () => {
    const r = updateCandidateSchema.safeParse({
      candidateId: 1,
      candidateName: "John Doe",
      candidateNameAr: "جون دو",
      candidateEmail: "john@example.com",
      candidatePhone: "+965****5678",
      candidateGender: 1,
      candidateBirthDate: "1995-06-15",
      candidateHourlyRate: 3.5,
      currencyCode: "KWD",
      storeId: 5,
      countryId: 62,
      universityId: 10,
      candidateObjective: "Looking for part-time",
    });
    expect(r.success).toBe(true);
  });

  it("rejects candidateName over 255 chars", () => {
    expect(
      updateCandidateSchema.safeParse({ candidateId: 1, candidateName: "x".repeat(256) }).success,
    ).toBe(false);
  });

  it("rejects missing candidateId", () => {
    expect(updateCandidateSchema.safeParse({ candidateName: "Test" }).success).toBe(false);
  });
});

describe("deleteCandidateSchema", () => {
  it("accepts a valid candidate ID", () => {
    const r = deleteCandidateSchema.safeParse({ candidateId: 42 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.candidateId).toBe(42);
  });

  it("rejects negative ID", () => {
    expect(deleteCandidateSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });

  it("rejects zero", () => {
    expect(deleteCandidateSchema.safeParse({ candidateId: 0 }).success).toBe(false);
  });

  it("rejects non-numeric ID", () => {
    expect(deleteCandidateSchema.safeParse({ candidateId: "abc" }).success).toBe(false);
  });

  it("coerces string to number", () => {
    const r = deleteCandidateSchema.safeParse({ candidateId: "42" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.candidateId).toBe(42);
  });
});
