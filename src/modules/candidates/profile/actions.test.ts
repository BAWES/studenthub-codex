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
    const r = getCandidateProfileMetricsSchema.safeParse({ candidateId: 1 });
    expect(r.success).toBe(true);
  });

  it("rejects negative candidateId", () => {
    expect(
      getCandidateProfileMetricsSchema.safeParse({ candidateId: -1 }).success,
    ).toBe(false);
  });

  it("rejects zero candidateId", () => {
    expect(
      getCandidateProfileMetricsSchema.safeParse({ candidateId: 0 }).success,
    ).toBe(false);
  });

  it("rejects missing candidateId", () => {
    expect(
      getCandidateProfileMetricsSchema.safeParse({}).success,
    ).toBe(false);
  });

  it("rejects non-integer candidateId", () => {
    expect(
      getCandidateProfileMetricsSchema.safeParse({ candidateId: 1.5 }).success,
    ).toBe(false);
  });
});

describe("getCandidateProfileDataSchema", () => {
  it("accepts valid candidateId", () => {
    const r = getCandidateProfileDataSchema.safeParse({ candidateId: 42 });
    expect(r.success).toBe(true);
  });

  it("rejects negative candidateId", () => {
    expect(
      getCandidateProfileDataSchema.safeParse({ candidateId: -1 }).success,
    ).toBe(false);
  });

  it("rejects missing candidateId", () => {
    expect(
      getCandidateProfileDataSchema.safeParse({}).success,
    ).toBe(false);
  });
});

describe("updateCandidateProfileDataSchema", () => {
  it("accepts valid minimal input (name + candidateId only)", () => {
    const r = updateCandidateProfileDataSchema.safeParse({
      candidateId: 1,
      name: "John Doe",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("John Doe");
      expect(r.data.nameAr).toBe("");
      expect(r.data.phone).toBe("");
    }
  });

  it("trims name whitespace", () => {
    const r = updateCandidateProfileDataSchema.safeParse({
      candidateId: 1,
      name: "  John Doe  ",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.name).toBe("John Doe");
  });

  it("rejects empty name", () => {
    expect(
      updateCandidateProfileDataSchema.safeParse({
        candidateId: 1,
        name: "",
      }).success,
    ).toBe(false);
  });

  it("rejects name over 255 chars", () => {
    expect(
      updateCandidateProfileDataSchema.safeParse({
        candidateId: 1,
        name: "x".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("accepts name exactly 255 chars", () => {
    const r = updateCandidateProfileDataSchema.safeParse({
      candidateId: 1,
      name: "x".repeat(255),
    });
    expect(r.success).toBe(true);
  });

  it("accepts optional fields", () => {
    const r = updateCandidateProfileDataSchema.safeParse({
      candidateId: 1,
      name: "Jane",
      nameAr: "جين",
      phone: "+96512345678",
      objective: "Looking for opportunities",
      intro: "Experienced developer",
      address: "Kuwait City",
      gender: 1,
      birthDate: "1990-01-15",
      drivingLicense: "1",
      preferredTime: "Morning",
      hourlyRate: 50,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.nameAr).toBe("جين");
      expect(r.data.phone).toBe("+96512345678");
      expect(r.data.objective).toBe("Looking for opportunities");
      expect(r.data.intro).toBe("Experienced developer");
      expect(r.data.address).toBe("Kuwait City");
      expect(r.data.gender).toBe(1);
      expect(r.data.birthDate).toBe("1990-01-15");
      expect(r.data.drivingLicense).toBe("1");
      expect(r.data.preferredTime).toBe("Morning");
      expect(r.data.hourlyRate).toBe(50);
    }
  });

  it("accepts drivingLicense as empty string", () => {
    const r = updateCandidateProfileDataSchema.safeParse({
      candidateId: 1,
      name: "Test",
      drivingLicense: "",
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid gender value > 2", () => {
    expect(
      updateCandidateProfileDataSchema.safeParse({
        candidateId: 1,
        name: "Test",
        gender: 5,
      }).success,
    ).toBe(false);
  });

  it("rejects negative hourlyRate", () => {
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

  it("rejects missing candidateId", () => {
    expect(
      updateCandidateProfileDataSchema.safeParse({ name: "Test" }).success,
    ).toBe(false);
  });

  it("rejects missing name", () => {
    expect(
      updateCandidateProfileDataSchema.safeParse({ candidateId: 1 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

describe("candidateProfileMetricsSchema", () => {
  it("accepts valid metrics with all zeros", () => {
    const r = candidateProfileMetricsSchema.safeParse({
      experienceCount: 0,
      educationCount: 0,
      skillCount: 0,
      certificationCount: 0,
      languageCount: 0,
      applicationCount: 0,
    });
    expect(r.success).toBe(true);
  });

  it("accepts metrics with positive values", () => {
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

  it("rejects missing required field", () => {
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

  it("rejects non-integer count", () => {
    expect(
      candidateProfileMetricsSchema.safeParse({
        experienceCount: 1.5,
        educationCount: 0,
        skillCount: 0,
        certificationCount: 0,
        languageCount: 0,
        applicationCount: 0,
      }).success,
    ).toBe(false);
  });
});

describe("candidateProfileDataSchema", () => {
  const validProfile = {
    candidateId: 1,
    name: "John Doe",
    nameAr: "جون دو",
    email: "john@example.com",
    phone: "+96512345678",
    photoUrl: "https://example.com/photo.jpg",
    objective: "Looking for a software engineering role",
    intro: "Experienced developer with 5 years in fintech",
    address: "Kuwait City, Kuwait",
    gender: 1,
    birthDate: "1990-01-15T00:00:00.000Z",
    drivingLicense: true,
    civilId: "1234567890",
    hourlyRate: 50,
    profileUrl: "https://example.com/profile",
    preferredTime: "Morning",
    bankAccountName: "John's Account",
    iban: "KW1234567890",
    countryId: 1,
    universityId: 5,
    bankId: 3,
  };

  it("accepts complete valid profile", () => {
    const r = candidateProfileDataSchema.safeParse(validProfile);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("John Doe");
      expect(r.data.email).toBe("john@example.com");
      expect(r.data.candidateId).toBe(1);
    }
  });

  it("accepts nullable fields as null", () => {
    const r = candidateProfileDataSchema.safeParse({
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
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(
      candidateProfileDataSchema.safeParse({
        ...validProfile,
        email: "not-an-email",
      }).success,
    ).toBe(false);
  });

  it("rejects missing required fields", () => {
    expect(
      candidateProfileDataSchema.safeParse({
        candidateId: 1,
      }).success,
    ).toBe(false);
  });

  it("rejects negative candidateId", () => {
    expect(
      candidateProfileDataSchema.safeParse({
        ...validProfile,
        candidateId: -1,
      }).success,
    ).toBe(false);
  });
});

describe("candidateProfileActionResultSchema", () => {
  it("accepts success result", () => {
    const r = candidateProfileActionResultSchema.safeParse({
      success: true,
    });
    expect(r.success).toBe(true);
  });

  it("accepts failure result with error message", () => {
    const r = candidateProfileActionResultSchema.safeParse({
      success: false,
      error: "Profile update failed",
    });
    expect(r.success).toBe(true);
  });

  it("accepts failure result with fieldErrors", () => {
    const r = candidateProfileActionResultSchema.safeParse({
      success: false,
      error: "Validation failed",
      fieldErrors: {
        name: ["Name is required"],
        email: ["Invalid email format"],
      },
    });
    expect(r.success).toBe(true);
  });

  it("accepts success result and strips extra error field", () => {
    const r = candidateProfileActionResultSchema.safeParse({
      success: true,
      error: "This should not be here",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      // Zod strips unknown fields on discriminated union
      expect(Object.keys(r.data)).toEqual(["success"]);
    }
  });

  it("rejects missing required fields", () => {
    expect(
      candidateProfileActionResultSchema.safeParse({}).success,
    ).toBe(false);
  });

  it("rejects success: false without error", () => {
    expect(
      candidateProfileActionResultSchema.safeParse({
        success: false,
      }).success,
    ).toBe(false);
  });
});
