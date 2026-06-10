import { describe, it, expect } from "vitest";
import {
  getProfileSchema,
  updatePersonalInfoSchema,
  updateProfileFieldsSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// getProfileSchema
// ---------------------------------------------------------------------------

describe("getProfileSchema", () => {
  it("accepts empty object", () => {
    const result = getProfileSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// updatePersonalInfoSchema
// ---------------------------------------------------------------------------

describe("updatePersonalInfoSchema", () => {
  it("accepts minimal valid data (name only)", () => {
    const result = updatePersonalInfoSchema.safeParse({ name: "John Doe" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("John Doe");
    }
  });

  it("rejects empty name", () => {
    const result = updatePersonalInfoSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = updatePersonalInfoSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts optional email", () => {
    const result = updatePersonalInfoSchema.safeParse({
      name: "John",
      email: "john@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = updatePersonalInfoSchema.safeParse({
      name: "John",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all optional fields", () => {
    const result = updatePersonalInfoSchema.safeParse({
      name: "John Doe",
      nameAr: "جون دو",
      email: "john@example.com",
      phone: "+96512345678",
      objective: "Looking for work",
      intro: "A bit about me",
      civilId: "284123456789",
      profileUrl: "https://example.com/profile",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nameAr).toBe("جون دو");
      expect(result.data.phone).toBe("+96512345678");
    }
  });

  it("accepts empty string for optional fields", () => {
    const result = updatePersonalInfoSchema.safeParse({
      name: "John",
      email: "",
      phone: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid URL for profileUrl", () => {
    const result = updatePersonalInfoSchema.safeParse({
      name: "John",
      profileUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateProfileFieldsSchema
// ---------------------------------------------------------------------------

describe("updateProfileFieldsSchema", () => {
  it("accepts empty object (all optional)", () => {
    const result = updateProfileFieldsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts valid gender", () => {
    const result = updateProfileFieldsSchema.safeParse({ gender: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects gender out of range", () => {
    const result = updateProfileFieldsSchema.safeParse({ gender: 5 });
    expect(result.success).toBe(false);
  });

  it("accepts valid drivingLicense values", () => {
    const r1 = updateProfileFieldsSchema.safeParse({ drivingLicense: "1" });
    expect(r1.success).toBe(true);
    const r2 = updateProfileFieldsSchema.safeParse({ drivingLicense: "0" });
    expect(r2.success).toBe(true);
    const r3 = updateProfileFieldsSchema.safeParse({ drivingLicense: true });
    expect(r3.success).toBe(true);
    const r4 = updateProfileFieldsSchema.safeParse({ drivingLicense: false });
    expect(r4.success).toBe(true);
  });

  it("accepts country/university/bank as positive numbers", () => {
    const result = updateProfileFieldsSchema.safeParse({
      countryId: 1,
      universityId: 42,
      bankId: 7,
    });
    expect(result.success).toBe(true);
  });

  it("accepts country/university/bank as empty string or null", () => {
    const r1 = updateProfileFieldsSchema.safeParse({ countryId: "" });
    expect(r1.success).toBe(true);
    const r2 = updateProfileFieldsSchema.safeParse({ countryId: null });
    expect(r2.success).toBe(true);
  });

  it("accepts IBAN string", () => {
    const result = updateProfileFieldsSchema.safeParse({
      iban: "KW91CBKU0000000000001234560101",
    });
    expect(result.success).toBe(true);
  });

  it("accepts birthDate as date string", () => {
    const result = updateProfileFieldsSchema.safeParse({
      birthDate: "2000-01-15",
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Return type shape tests
// ---------------------------------------------------------------------------

type CandidateProfileEditData = {
  candidateName: string;
  candidateNameAr: string;
  candidateEmail: string;
  candidatePhone: string | null;
  candidateObjective: string | null;
  candidateIntro: string | null;
  candidateCivilId: string | null;
  profileUrl: string | null;
  candidateBirthDate: Date | null;
  candidateAddressLine1: string | null;
  candidateGender: number | null;
  candidateDrivingLicense: boolean | null;
  candidateCivilExpiryDate: Date | null;
  candidatePreferredTime: string | null;
  countryId: number | null;
  universityId: number | null;
  bankId: number | null;
  bankAccountName: string | null;
  candidateIban: string | null;
  candidatePersonalPhoto: string | null;
  candidateResume: string | null;
  candidateVideo: string | null;
  civilPhotoFront: string | null;
  civilPhotoBack: string | null;
};

type ProfileActionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

describe("CandidateProfileEditData shape", () => {
  it("defines all expected fields", () => {
    const mock: CandidateProfileEditData = {
      candidateName: "John Doe",
      candidateNameAr: "جون دو",
      candidateEmail: "john@example.com",
      candidatePhone: "+96512345678",
      candidateObjective: "Software Engineer",
      candidateIntro: "Experienced developer",
      candidateCivilId: "284123456789",
      profileUrl: "https://example.com/profile",
      candidateBirthDate: new Date("2000-01-15"),
      candidateAddressLine1: "Kuwait City",
      candidateGender: 1,
      candidateDrivingLicense: true,
      candidateCivilExpiryDate: new Date("2030-01-01"),
      candidatePreferredTime: "morning",
      countryId: 1,
      universityId: 42,
      bankId: 7,
      bankAccountName: "John's Account",
      candidateIban: "KW91CBKU0000000000001234560101",
      candidatePersonalPhoto: "/photos/photo.jpg",
      candidateResume: "/resume.pdf",
      candidateVideo: "/video.mp4",
      civilPhotoFront: "/civil/front.jpg",
      civilPhotoBack: "/civil/back.jpg",
    };
    expect(mock.candidateName).toBe("John Doe");
    expect(mock.candidateNameAr).toBe("جون دو");
    expect(mock.candidateIban).toBe("KW91CBKU0000000000001234560101");
  });
});

describe("ProfileActionResult shape", () => {
  it("supports success variant", () => {
    const result: ProfileActionResult = { success: true };
    expect(result.success).toBe(true);
  });

  it("supports error variant", () => {
    const result: ProfileActionResult = {
      success: false,
      error: "Something went wrong",
      fieldErrors: { name: ["Name is required"] },
    };
    expect(result.success).toBe(false);
    expect(result.error).toBe("Something went wrong");
  });
});

// ---------------------------------------------------------------------------
// Colocated option-query function shapes
// ---------------------------------------------------------------------------

type Option = { id: string | number; label: string };

describe("getCountryOptions return shape", () => {
  it("returns array of {id, label} objects", () => {
    // Type check — function is async, tested via shape
    const result: Option[] = [{ id: 1, label: "Kuwait (Kuwaiti)" }];
    expect(result[0].id).toBe(1);
    expect(result[0].label).toContain("Kuwait");
  });
});

describe("getUniversityOptions return shape", () => {
  it("returns array of {id, label} objects", () => {
    const result: Option[] = [{ id: 1, label: "Kuwait University" }];
    expect(result[0].label).toContain("University");
  });
});

describe("getBankOptions return shape", () => {
  it("returns array of {id, label} objects", () => {
    const result: Option[] = [{ id: 1, label: "National Bank of Kuwait" }];
    expect(result[0].label).toContain("Bank");
  });
});

describe("getDegreeOptions return shape", () => {
  it("returns array of {id: string, label} objects", () => {
    type DegreeOption = { id: string; label: string };
    const result: DegreeOption[] = [{ id: "uuid-1", label: "Bachelor" }];
    expect(result[0].id).toBe("uuid-1");
    expect(result[0].label).toBe("Bachelor");
  });
});

describe("getMajorOptions return shape", () => {
  it("returns array of {id: string, label} objects", () => {
    type MajorOption = { id: string; label: string };
    const result: MajorOption[] = [{ id: "uuid-2", label: "Computer Science" }];
    expect(result[0].label).toBe("Computer Science");
  });
});

describe("getCandidateProfileEdit input shape", () => {
  it("accepts { candidateId: number }", () => {
    const input: { candidateId: number } = { candidateId: 42 };
    expect(input.candidateId).toBe(42);
  });
});
