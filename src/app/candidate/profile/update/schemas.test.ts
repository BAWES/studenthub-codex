import { describe, it, expect } from "vitest";
import { profileDataSchema, profileActionResultSchema } from "./schemas";

// ---------------------------------------------------------------------------
// Output schema validation tests — candidate/profile/update
// ---------------------------------------------------------------------------

describe("profileDataSchema", () => {
  const validProfile = {
    candidateId: 1,
    name: "Ahmed Al-Mutairi",
    nameAr: "أحمد المطيري",
    email: "ahmed@example.com",
    phone: "+965 5555 1234",
    photoUrl: "https://example.com/photo.jpg",
    objective: "Looking for a software engineering internship",
    intro: "A motivated CS student",
    address: "Kuwait City",
    gender: 1,
    birthDate: "2000-01-15",
    drivingLicense: true,
    civilId: "1234567890",
    hourlyRate: 10.5,
    profileUrl: "https://studenthub.ai/candidate/1",
    preferredTime: "any",
    bankAccountName: "Ahmed Al-Mutairi",
    iban: "KW1234567890123456789012345678901234567890",
    countryId: 1,
    universityId: 5,
    bankId: 3,
  };

  it("accepts a valid profile object", () => {
    expect(profileDataSchema.safeParse(validProfile).success).toBe(true);
  });

  it("accepts null for all nullable fields", () => {
    const nullableProfile = {
      ...validProfile,
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
    };
    expect(profileDataSchema.safeParse(nullableProfile).success).toBe(true);
  });

  it("rejects missing candidateId", () => {
    const { candidateId: _, ...rest } = validProfile;
    expect(profileDataSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for candidateId", () => {
    expect(
      profileDataSchema.safeParse({ ...validProfile, candidateId: "abc" })
        .success,
    ).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      profileDataSchema.safeParse({ ...validProfile, email: "not-an-email" })
        .success,
    ).toBe(false);
  });

  it("rejects wrong type for hourlyRate", () => {
    expect(
      profileDataSchema.safeParse({ ...validProfile, hourlyRate: "free" })
        .success,
    ).toBe(false);
  });
});

describe("profileActionResultSchema", () => {
  it("accepts success result", () => {
    expect(
      profileActionResultSchema.safeParse({ success: true }).success,
    ).toBe(true);
  });

  it("accepts failure result with error", () => {
    expect(
      profileActionResultSchema.safeParse({
        success: false,
        error: "Something went wrong",
      }).success,
    ).toBe(true);
  });

  it("accepts failure result with fieldErrors", () => {
    expect(
      profileActionResultSchema.safeParse({
        success: false,
        error: "Validation failed",
        fieldErrors: { name: ["Name is required"] },
      }).success,
    ).toBe(true);
  });

  it("rejects missing error on failure", () => {
    expect(
      profileActionResultSchema.safeParse({ success: false }).success,
    ).toBe(false);
  });

  it("rejects invalid discriminant value", () => {
    expect(
      profileActionResultSchema.safeParse({ success: "yes" }).success,
    ).toBe(false);
  });
});
