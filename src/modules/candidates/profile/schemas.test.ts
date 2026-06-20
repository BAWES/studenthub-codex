import { describe, it, expect } from "vitest";
import {
  getCandidateProfileMetricsSchema,
  getCandidateProfileDataSchema,
  updateCandidateProfileDataSchema,
  candidateProfileMetricsSchema,
  candidateProfileDataSchema,
  candidateProfileActionResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

describe("getCandidateProfileMetricsSchema", () => {
  it("accepts valid candidateId", () => {
    expect(getCandidateProfileMetricsSchema.safeParse({ candidateId: 1 }).success).toBe(true);
  });

  it("rejects missing candidateId", () => {
    expect(getCandidateProfileMetricsSchema.safeParse({}).success).toBe(false);
  });

  it("rejects negative candidateId", () => {
    expect(getCandidateProfileMetricsSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });
});

describe("getCandidateProfileDataSchema", () => {
  it("accepts valid candidateId", () => {
    expect(getCandidateProfileDataSchema.safeParse({ candidateId: 1 }).success).toBe(true);
  });

  it("rejects missing candidateId", () => {
    expect(getCandidateProfileDataSchema.safeParse({}).success).toBe(false);
  });
});

describe("updateCandidateProfileDataSchema", () => {
  const valid = {
    candidateId: 1,
    name: "Ahmed Ali",
  };

  it("accepts valid input with required name", () => {
    const r = updateCandidateProfileDataSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.name).toBe("Ahmed Ali");
  });

  it("accepts all optional fields", () => {
    const r = updateCandidateProfileDataSchema.safeParse({
      ...valid,
      nameAr: "أحمد علي",
      phone: "+96512345678",
      objective: "Software engineer seeking opportunities",
      intro: "Experienced developer",
      address: "Kuwait City",
      gender: 1,
      birthDate: "1990-01-01",
      drivingLicense: "1",
      preferredTime: "Morning",
      hourlyRate: 15,
    });
    expect(r.success).toBe(true);
  });

  it("accepts default values for optional fields", () => {
    const r = updateCandidateProfileDataSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.nameAr).toBe("");
      expect(r.data.phone).toBe("");
      expect(r.data.objective).toBe("");
      expect(r.data.intro).toBe("");
      expect(r.data.address).toBe("");
      expect(r.data.birthDate).toBe("");
      expect(r.data.drivingLicense).toBe("");
      expect(r.data.preferredTime).toBe("");
    }
  });

  it("trims whitespace from name", () => {
    const r = updateCandidateProfileDataSchema.safeParse({
      candidateId: 1,
      name: "  Ahmed Ali  ",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.name).toBe("Ahmed Ali");
  });

  it("accepts nullable gender", () => {
    const r = updateCandidateProfileDataSchema.safeParse({
      candidateId: 1,
      name: "Test",
      gender: null,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.gender).toBeNull();
  });

  it("rejects missing name", () => {
    expect(updateCandidateProfileDataSchema.safeParse({ candidateId: 1 }).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(
      updateCandidateProfileDataSchema.safeParse({ candidateId: 1, name: "" }).success,
    ).toBe(false);
  });

  it("rejects gender over 2", () => {
    expect(
      updateCandidateProfileDataSchema.safeParse({ candidateId: 1, name: "Test", gender: 5 }).success,
    ).toBe(false);
  });

  it("rejects hourlyRate negative", () => {
    expect(
      updateCandidateProfileDataSchema.safeParse({
        candidateId: 1,
        name: "Test",
        hourlyRate: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects hourlyRate over 9999", () => {
    expect(
      updateCandidateProfileDataSchema.safeParse({
        candidateId: 1,
        name: "Test",
        hourlyRate: 10000,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

describe("candidateProfileMetricsSchema", () => {
  it("accepts valid metrics", () => {
    const r = candidateProfileMetricsSchema.safeParse({
      experienceCount: 3,
      educationCount: 2,
      skillCount: 8,
      certificationCount: 1,
      languageCount: 2,
      applicationCount: 5,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative count", () => {
    expect(
      candidateProfileMetricsSchema.safeParse({
        experienceCount: -1,
        educationCount: 0,
        skillCount: 0,
        certificationCount: 0,
        languageCount: 0,
        applicationCount: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects missing field", () => {
    expect(
      candidateProfileMetricsSchema.safeParse({
        experienceCount: 0,
        educationCount: 0,
        skillCount: 0,
        certificationCount: 0,
        languageCount: 0,
      }).success,
    ).toBe(false);
  });
});

describe("candidateProfileDataSchema", () => {
  const valid = {
    candidateId: 1,
    name: "Ahmed Ali",
    nameAr: "أحمد علي",
    email: "ahmed@example.com",
    phone: "+96512345678",
    photoUrl: "https://example.com/photo.jpg",
    objective: "Software engineer",
    intro: "Experienced developer",
    address: "Kuwait City",
    gender: 1,
    birthDate: "1990-01-01",
    drivingLicense: true,
    civilId: "284101234567",
    hourlyRate: 15,
    profileUrl: "https://example.com/profile",
    preferredTime: "Morning",
    bankAccountName: "Ahmed Ali",
    iban: "KW00...",
    countryId: 1,
    universityId: 5,
    bankId: 3,
  };

  it("accepts a valid profile data", () => {
    expect(candidateProfileDataSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable fields", () => {
    expect(
      candidateProfileDataSchema.safeParse({
        ...valid,
        phone: null,
        photoUrl: null,
        objective: null,
        intro: null,
        address: null,
        gender: null,
        birthDate: null,
        drivingLicense: null,
        civilId: null,
        hourlyRate: null,
        profileUrl: null,
        preferredTime: null,
        bankAccountName: null,
        iban: null,
        countryId: null,
        universityId: null,
        bankId: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing candidateId", () => {
    const { candidateId: _, ...rest } = valid;
    expect(candidateProfileDataSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = valid;
    expect(candidateProfileDataSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      candidateProfileDataSchema.safeParse({ ...valid, email: "not-an-email" }).success,
    ).toBe(false);
  });
});

describe("candidateProfileActionResultSchema", () => {
  it("accepts success", () => {
    expect(candidateProfileActionResultSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("accepts error with optional fieldErrors", () => {
    expect(
      candidateProfileActionResultSchema.safeParse({
        success: false,
        error: "Validation failed.",
        fieldErrors: { name: ["Name is required"] },
      }).success,
    ).toBe(true);
  });

  it("rejects missing error on false", () => {
    expect(candidateProfileActionResultSchema.safeParse({ success: false }).success).toBe(false);
  });

  it("rejects wrong type for success", () => {
    expect(
      candidateProfileActionResultSchema.safeParse({ success: "yes" }).success,
    ).toBe(false);
  });
});
