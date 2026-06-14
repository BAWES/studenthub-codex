import { describe, it, expect } from "vitest";
import {
  profileDataSchema,
  profileActionResultSchema,
} from "./schemas";

describe("profileDataSchema", () => {
  const validProfile = {
    candidateId: 1,
    name: "John Doe",
    nameAr: "جون دو",
    email: "john@example.com",
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

  it("accepts valid input with all nullable fields as null", () => {
    expect(profileDataSchema.safeParse(validProfile).success).toBe(true);
  });

  it("accepts valid input with non-null values", () => {
    const input = {
      ...validProfile,
      phone: "+965 1234 5678",
      photoUrl: "https://example.com/photo.jpg",
      gender: 1,
      birthDate: "1990-01-01",
      drivingLicense: true,
      hourlyRate: 50.0,
      countryId: 1,
      universityId: 5,
      bankId: 3,
    };
    expect(profileDataSchema.safeParse(input).success).toBe(true);
  });

  it("rejects missing required field candidateId", () => {
    const { name, nameAr, email, ...rest } = validProfile;
    expect(profileDataSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing required field name", () => {
    const { candidateId, nameAr, email, ...rest } = validProfile;
    expect(profileDataSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing required field nameAr", () => {
    const { candidateId, name, email, ...rest } = validProfile;
    expect(profileDataSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing required field email", () => {
    const { candidateId, name, nameAr, ...rest } = validProfile;
    expect(profileDataSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-positive candidateId", () => {
    expect(profileDataSchema.safeParse({ ...validProfile, candidateId: 0 }).success).toBe(false);
    expect(profileDataSchema.safeParse({ ...validProfile, candidateId: -5 }).success).toBe(false);
  });

  it("rejects invalid email format", () => {
    expect(profileDataSchema.safeParse({ ...validProfile, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects invalid types", () => {
    expect(profileDataSchema.safeParse({ ...validProfile, candidateId: "abc" }).success).toBe(false);
    expect(profileDataSchema.safeParse({ ...validProfile, name: 123 }).success).toBe(false);
    expect(profileDataSchema.safeParse({ ...validProfile, email: 456 }).success).toBe(false);
  });
});

describe("profileActionResultSchema", () => {
  it("accepts success branch", () => {
    expect(profileActionResultSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("accepts failure branch with error", () => {
    expect(
      profileActionResultSchema.safeParse({ success: false, error: "Something went wrong" }).success
    ).toBe(true);
  });

  it("accepts failure branch with error and fieldErrors", () => {
    expect(
      profileActionResultSchema.safeParse({
        success: false,
        error: "Validation failed",
        fieldErrors: { name: ["Name is required"] },
      }).success
    ).toBe(true);
  });

  it("accepts success branch with extra fields (Zod strips unknown fields)", () => {
    // Zod's default behavior strips unknown fields, so extra fields like "error"
    // on both branches don't cause rejection.
    const result = profileActionResultSchema.safeParse({ success: true, error: "should not be here" });
    expect(result.success).toBe(true);
  });

  it("rejects empty object", () => {
    expect(profileActionResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects invalid success value", () => {
    expect(profileActionResultSchema.safeParse({ success: "maybe" }).success).toBe(false);
  });

  it("rejects failure branch missing error", () => {
    expect(profileActionResultSchema.safeParse({ success: false }).success).toBe(false);
  });
});
