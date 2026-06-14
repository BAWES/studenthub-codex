import { describe, it, expect } from "vitest";
import {
  candidateProfileMetricsSchema,
  candidateProfileDataSchema,
  candidateProfileActionResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// candidateProfileMetricsSchema
// ---------------------------------------------------------------------------

describe("candidateProfileMetricsSchema", () => {
  const validMetrics = () => ({
    experienceCount: 3,
    educationCount: 2,
    skillCount: 8,
    certificationCount: 1,
    languageCount: 2,
    applicationCount: 5,
  });

  it("accepts valid metrics", () => {
    const r = candidateProfileMetricsSchema.safeParse(validMetrics());
    expect(r.success).toBe(true);
  });

  it("accepts all-zero counters", () => {
    const zero = validMetrics();
    for (const k of Object.keys(zero)) {
      (zero as Record<string, number>)[k] = 0;
    }
    const r = candidateProfileMetricsSchema.safeParse(zero);
    expect(r.success).toBe(true);
  });

  it("rejects negative values", () => {
    const r = candidateProfileMetricsSchema.safeParse({ ...validMetrics(), experienceCount: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects missing experienceCount", () => {
    const { experienceCount: _, ...rest } = validMetrics();
    expect(candidateProfileMetricsSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateProfileDataSchema
// ---------------------------------------------------------------------------

describe("candidateProfileDataSchema", () => {
  const validData = () => ({
    candidateId: 123,
    name: "John Doe",
    nameAr: "جون دو",
    email: "john@example.com",
    phone: "+965 5555 1234",
    photoUrl: "/photos/john.jpg",
    objective: "Looking for opportunities",
    intro: "Experienced developer",
    address: "Kuwait City",
    gender: 1,
    birthDate: "1990-01-01",
    drivingLicense: true,
    civilId: "123456789",
    hourlyRate: 10.50,
    profileUrl: "https://profile.example.com/john",
    preferredTime: "Morning",
    bankAccountName: "John Doe",
    iban: "KW12...",
    countryId: 1,
    universityId: 5,
    bankId: 3,
  });

  it("accepts valid profile data", () => {
    const r = candidateProfileDataSchema.safeParse(validData());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = candidateProfileDataSchema.safeParse({
      ...validData(),
      phone: null, photoUrl: null, objective: null, intro: null,
      address: null, gender: null, birthDate: null, drivingLicense: null,
      civilId: null, hourlyRate: null, profileUrl: null, preferredTime: null,
      bankAccountName: null, iban: null, countryId: null, universityId: null, bankId: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing candidateId", () => {
    const { candidateId: _, ...rest } = validData();
    expect(candidateProfileDataSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-email in email field", () => {
    const r = candidateProfileDataSchema.safeParse({ ...validData(), email: "not-an-email" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateProfileActionResultSchema  (discriminatedUnion)
// ---------------------------------------------------------------------------

describe("candidateProfileActionResultSchema", () => {
  it("accepts success", () => {
    const r = candidateProfileActionResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("accepts failure with error", () => {
    const r = candidateProfileActionResultSchema.safeParse({ success: false, error: "Validation failed" });
    expect(r.success).toBe(true);
  });

  it("accepts failure with fieldErrors", () => {
    const r = candidateProfileActionResultSchema.safeParse({
      success: false,
      error: "Validation failed",
      fieldErrors: { name: ["Name is required"], email: ["Invalid email"] },
    });
    expect(r.success).toBe(true);
  });

  it("rejects success without true literal", () => {
    const r = candidateProfileActionResultSchema.safeParse({ success: false });
    expect(r.success).toBe(false); // second variant requires error field
  });
});
