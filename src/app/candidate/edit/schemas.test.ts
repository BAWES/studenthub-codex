import { describe, it, expect } from "vitest";
import {
  getProfileSchema,
  updatePersonalInfoSchema,
  updateProfileFieldsSchema,
  profileEditDataOutputSchema,
  profileActionResultOutputSchema,
  optionsItemOutputSchema,
  profileEditDataNullableOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests — candidate/edit
// ---------------------------------------------------------------------------

describe("getProfileSchema", () => {
  it("accepts empty object", () => {
    const r = getProfileSchema.safeParse({});
    expect(r.success).toBe(true);
  });
});

describe("updatePersonalInfoSchema", () => {
  const validInput = {
    name: "John Doe",
  };

  it("accepts valid input with name only", () => {
    const r = updatePersonalInfoSchema.safeParse(validInput);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("John Doe");
      expect(r.data.nameAr).toBe("");
    }
  });

  it("accepts all optional fields", () => {
    const r = updatePersonalInfoSchema.safeParse({
      ...validInput,
      nameAr: "جون دو",
      email: "john@example.com",
      phone: "+96512345678",
      objective: "Looking for a job",
      intro: "Experienced developer",
      civilId: "1234567890",
      profileUrl: "https://example.com/profile",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing name", () => {
    expect(updatePersonalInfoSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(updatePersonalInfoSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      updatePersonalInfoSchema.safeParse({
        ...validInput,
        email: "not-an-email",
      }).success,
    ).toBe(false);
  });

  it("accepts empty string for email", () => {
    const r = updatePersonalInfoSchema.safeParse({
      ...validInput,
      email: "",
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid profile URL", () => {
    expect(
      updatePersonalInfoSchema.safeParse({
        ...validInput,
        profileUrl: "not-a-url",
      }).success,
    ).toBe(false);
  });

  it("accepts empty string for profile URL", () => {
    const r = updatePersonalInfoSchema.safeParse({
      ...validInput,
      profileUrl: "",
    });
    expect(r.success).toBe(true);
  });
});

describe("updateProfileFieldsSchema", () => {
  it("accepts empty input (all fields optional)", () => {
    const r = updateProfileFieldsSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("accepts valid country ID", () => {
    const r = updateProfileFieldsSchema.safeParse({ countryId: 1 });
    expect(r.success).toBe(true);
  });

  it("accepts null for nullable fields", () => {
    const r = updateProfileFieldsSchema.safeParse({
      countryId: null,
      universityId: null,
      bankId: null,
      gender: null,
      drivingLicense: null,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty string for nullable fields", () => {
    const r = updateProfileFieldsSchema.safeParse({
      countryId: "",
      universityId: "",
      gender: "",
    });
    expect(r.success).toBe(true);
  });

  it("accepts valid driving license values", () => {
    const r = updateProfileFieldsSchema.safeParse({
      drivingLicense: true,
    });
    expect(r.success).toBe(true);
  });

  it("accepts drivingLicense '1' and '0' strings", () => {
    const r1 = updateProfileFieldsSchema.safeParse({ drivingLicense: "1" });
    expect(r1.success).toBe(true);

    const r0 = updateProfileFieldsSchema.safeParse({ drivingLicense: "0" });
    expect(r0.success).toBe(true);
  });

  it("rejects negative countryId", () => {
    expect(
      updateProfileFieldsSchema.safeParse({ countryId: -1 }).success,
    ).toBe(false);
  });

  it("rejects gender outside 0-2 range", () => {
    expect(
      updateProfileFieldsSchema.safeParse({ gender: 5 }).success,
    ).toBe(false);
  });

  it("rejects gender out of range via string", () => {
    expect(
      updateProfileFieldsSchema.safeParse({ gender: "5" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("profileEditDataOutputSchema", () => {
  const validItem = {
    candidateName: "John Doe",
    candidateNameAr: "",
    candidateEmail: "john@example.com",
    candidatePhone: null,
    candidateObjective: null,
    candidateIntro: null,
    candidateCivilId: null,
    profileUrl: null,
    candidateBirthDate: null,
    candidateAddressLine1: null,
    candidateGender: null,
    candidateDrivingLicense: null,
    candidateCivilExpiryDate: null,
    candidatePreferredTime: null,
    countryId: null,
    universityId: null,
    bankId: null,
    bankAccountName: null,
    candidateIban: null,
    candidatePersonalPhoto: null,
    candidateResume: null,
    candidateVideo: null,
    civilPhotoFront: null,
    civilPhotoBack: null,
  };

  it("accepts valid profile data", () => {
    expect(profileEditDataOutputSchema.safeParse(validItem).success).toBe(true);
  });

  it("rejects missing candidateName", () => {
    const { candidateName: _, ...rest } = validItem;
    expect(profileEditDataOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing candidateEmail", () => {
    const { candidateEmail: _, ...rest } = validItem;
    expect(profileEditDataOutputSchema.safeParse(rest).success).toBe(false);
  });
});

describe("profileActionResultOutputSchema", () => {
  it("accepts success result", () => {
    expect(
      profileActionResultOutputSchema.safeParse({ success: true }).success,
    ).toBe(true);
  });

  it("accepts error result with error message", () => {
    expect(
      profileActionResultOutputSchema.safeParse({
        success: false,
        error: "Validation failed",
      }).success,
    ).toBe(true);
  });

  it("accepts error result with fieldErrors", () => {
    expect(
      profileActionResultOutputSchema.safeParse({
        success: false,
        error: "Error",
        fieldErrors: { name: ["Name is required"] },
      }).success,
    ).toBe(true);
  });

  it("accepts success result with extra error field (Zod is lenient by default)", () => {
    expect(
      profileActionResultOutputSchema.safeParse({ success: true, error: "x" })
        .success,
    ).toBe(true);
  });

  it("rejects error result without error field", () => {
    expect(
      profileActionResultOutputSchema.safeParse({ success: false }).success,
    ).toBe(false);
  });
});

describe("optionsItemOutputSchema", () => {
  it("accepts valid option with number ID", () => {
    expect(
      optionsItemOutputSchema.safeParse({ id: 1, label: "Option 1" }).success,
    ).toBe(true);
  });

  it("accepts valid option with string ID", () => {
    expect(
      optionsItemOutputSchema.safeParse({ id: "abc", label: "Option" }).success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    expect(
      optionsItemOutputSchema.safeParse({ label: "Option" }).success,
    ).toBe(false);
  });

  it("rejects missing label", () => {
    expect(optionsItemOutputSchema.safeParse({ id: 1 }).success).toBe(false);
  });
});

describe("profileEditDataNullableOutputSchema", () => {
  it("accepts valid profile data", () => {
    expect(
      profileEditDataNullableOutputSchema.safeParse({
        candidateName: "John",
        candidateNameAr: "",
        candidateEmail: "john@test.com",
        candidatePhone: null,
        candidateObjective: null,
        candidateIntro: null,
        candidateCivilId: null,
        profileUrl: null,
        candidateBirthDate: null,
        candidateAddressLine1: null,
        candidateGender: null,
        candidateDrivingLicense: null,
        candidateCivilExpiryDate: null,
        candidatePreferredTime: null,
        countryId: null,
        universityId: null,
        bankId: null,
        bankAccountName: null,
        candidateIban: null,
        candidatePersonalPhoto: null,
        candidateResume: null,
        candidateVideo: null,
        civilPhotoFront: null,
        civilPhotoBack: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null", () => {
    expect(profileEditDataNullableOutputSchema.safeParse(null).success).toBe(
      true,
    );
  });
});
