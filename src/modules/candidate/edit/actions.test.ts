import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  updatePersonalInfoSchema,
  updateProfileFieldsSchema,
  profileEditDataOutputSchema,
  profileActionResultOutputSchema,
  optionsItemOutputSchema,
  profileEditDataNullableOutputSchema,
} from "@/app/candidate/edit/schemas";
import type {
  CandidateProfileEditData,
  ProfileActionResult,
  UpdatePersonalInfoInput,
} from "@/app/candidate/edit/schemas";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireCapability,
  mockRevalidatePath,
  mockFindUnique,
  mockFindMany,
  mockCandidateUpdate,
  mockGetCandidateDetail,
} = vi.hoisted(() => ({
  mockRequireCapability: vi.fn(),
  mockRevalidatePath: vi.fn(),
  mockFindUnique: vi.fn(),
  mockFindMany: vi.fn(),
  mockCandidateUpdate: vi.fn(),
  mockGetCandidateDetail: vi.fn(),
}));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: mockRequireCapability,
}));

// ── Mock next/cache ─────────────────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate: {
      findUnique: mockFindUnique,
      update: mockCandidateUpdate,
    },
    country: { findMany: mockFindMany },
    university: { findMany: mockFindMany },
    bank: { findMany: mockFindMany },
    degree: { findMany: mockFindMany },
    major: { findMany: mockFindMany },
  },
}));

// ── Mock candidate-detail module ────────────────────────────
vi.mock("@/modules/candidates/candidate-detail", () => ({
  getCandidateDetail: mockGetCandidateDetail,
}));

import {
  getCandidateProfileEdit,
  getCountryOptions,
  getUniversityOptions,
  getBankOptions,
  getDegreeOptions,
  getMajorOptions,
  getCandidateProfileForEdit,
  updateCandidatePersonalInfo,
  updateCandidateProfileFields,
} from "./actions";

// ---------------------------------------------------------------------------
// Input schema validation — updatePersonalInfoSchema
// ---------------------------------------------------------------------------

describe("updatePersonalInfoSchema", () => {
  it("accepts valid personal info with all fields", () => {
    const result = updatePersonalInfoSchema.safeParse({
      name: "John Doe",
      nameAr: "جون دو",
      email: "john@example.com",
      phone: "+965****0000",
      objective: "Seeking opportunities",
      intro: "Experienced developer",
      civilId: "1234567890",
      profileUrl: "https://example.com",
    });
    expect(result.success).toBe(true);
  });

  it("accepts name only (minimum required)", () => {
    const result = updatePersonalInfoSchema.safeParse({ name: "John" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = updatePersonalInfoSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = updatePersonalInfoSchema.safeParse({
      name: "John",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty email", () => {
    const result = updatePersonalInfoSchema.safeParse({
      name: "John",
      email: "",
    });
    expect(result.success).toBe(true);
  });

  it("accepts missing optional fields", () => {
    const result = updatePersonalInfoSchema.safeParse({ name: "John" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nameAr).toBe("");
      expect(result.data.email).toBe("");
      expect(result.data.phone).toBe("");
    }
  });

  it("rejects invalid profileUrl", () => {
    const result = updatePersonalInfoSchema.safeParse({
      name: "John",
      profileUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema validation — updateProfileFieldsSchema
// ---------------------------------------------------------------------------

describe("updateProfileFieldsSchema", () => {
  it("accepts empty payload (all optional)", () => {
    const result = updateProfileFieldsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts valid all fields", () => {
    const result = updateProfileFieldsSchema.safeParse({
      countryId: 1,
      universityId: 2,
      bankId: 3,
      bankAccountName: "My Account",
      iban: "KW123456",
      birthDate: "2000-01-01",
      address: "Salmiya, Kuwait",
      gender: 1,
      drivingLicense: "1",
      civilExpiry: "2030-12-31",
      preferredTime: "09:00",
    });
    expect(result.success).toBe(true);
  });

  it("coerces string IDs to numbers", () => {
    const result = updateProfileFieldsSchema.safeParse({
      countryId: "1",
      universityId: "2",
      bankId: "3",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.countryId).toBe(1);
      expect(result.data.universityId).toBe(2);
      expect(result.data.bankId).toBe(3);
    }
  });

  it("accepts null/empty countryId", () => {
    const result = updateProfileFieldsSchema.safeParse({ countryId: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      // "" matches z.literal("") — stays as empty string, not coerced to null
      expect(result.data.countryId).toBe("");
    }
  });

  it("rejects negative gender", () => {
    const result = updateProfileFieldsSchema.safeParse({ gender: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects gender > 2", () => {
    const result = updateProfileFieldsSchema.safeParse({ gender: 5 });
    expect(result.success).toBe(false);
  });

  it("accepts boolean driving license", () => {
    const result = updateProfileFieldsSchema.safeParse({
      drivingLicense: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts string '0' driving license", () => {
    const result = updateProfileFieldsSchema.safeParse({
      drivingLicense: "0",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null driving license", () => {
    const result = updateProfileFieldsSchema.safeParse({
      drivingLicense: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.drivingLicense).toBeNull();
    }
  });
});

// ---------------------------------------------------------------------------
// Output schema validation
// ---------------------------------------------------------------------------

describe("profileEditDataOutputSchema", () => {
  it("accepts valid profile edit data", () => {
    const data: CandidateProfileEditData = {
      candidateName: "John",
      candidateNameAr: "جون",
      candidateEmail: "john@example.com",
      candidatePhone: "+965****0000",
      candidateObjective: null,
      candidateIntro: null,
      candidateCivilId: null,
      profileUrl: null,
      candidateBirthDate: new Date("2000-01-01"),
      candidateAddressLine1: null,
      candidateGender: 1,
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
    const result = profileEditDataOutputSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("accepts nullable phone", () => {
    const data: CandidateProfileEditData = {
      candidateName: "Ali",
      candidateNameAr: "علي",
      candidateEmail: "ali@example.com",
      candidatePhone: null,
      candidateObjective: null,
      candidateIntro: "Hello",
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
    const result = profileEditDataOutputSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("rejects missing candidateName", () => {
    const result = profileEditDataOutputSchema.safeParse({
      candidateNameAr: "جون",
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
    });
    expect(result.success).toBe(false);
  });
});

describe("profileActionResultOutputSchema", () => {
  it("accepts success result", () => {
    const result: ProfileActionResult = { success: true };
    const parsed = profileActionResultOutputSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("accepts failure result with error", () => {
    const result: ProfileActionResult = {
      success: false,
      error: "Invalid data",
      fieldErrors: { name: ["Name is required"] },
    };
    const parsed = profileActionResultOutputSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("accepts failure result without fieldErrors", () => {
    const result: ProfileActionResult = {
      success: false,
      error: "Something went wrong",
    };
    const parsed = profileActionResultOutputSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("rejects missing error on failure", () => {
    const parsed = profileActionResultOutputSchema.safeParse({
      success: false,
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects ambiguous shape (no success field)", () => {
    const parsed = profileActionResultOutputSchema.safeParse({});
    expect(parsed.success).toBe(false);
  });
});

describe("optionsItemOutputSchema", () => {
  it("accepts option with numeric id", () => {
    const result = optionsItemOutputSchema.safeParse({ id: 1, label: "Option A" });
    expect(result.success).toBe(true);
  });

  it("accepts option with string id", () => {
    const result = optionsItemOutputSchema.safeParse({
      id: "uuid-xyz",
      label: "Option B",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing label", () => {
    const result = optionsItemOutputSchema.safeParse({ id: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects null label", () => {
    const result = optionsItemOutputSchema.safeParse({ id: 1, label: null });
    expect(result.success).toBe(false);
  });
});

describe("profileEditDataNullableOutputSchema", () => {
  it("accepts valid profile data", () => {
    const result = profileEditDataNullableOutputSchema.safeParse({
      candidateName: "John",
      candidateNameAr: "جون",
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
    });
    expect(result.success).toBe(true);
  });

  it("accepts null", () => {
    const result = profileEditDataNullableOutputSchema.safeParse(null);
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Action-level tests — getCandidateProfileEdit
// ---------------------------------------------------------------------------

describe("getCandidateProfileEdit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to getCandidateDetail with candidate id", async () => {
    mockGetCandidateDetail.mockResolvedValue({ id: 42, name: "Ali" });

    const result = await getCandidateProfileEdit({ candidateId: 42 });

    expect(mockGetCandidateDetail).toHaveBeenCalledWith(42, "/candidate/invitations");
    expect(result).toEqual({ id: 42, name: "Ali" });
  });

  it("returns null when candidate detail returns null", async () => {
    mockGetCandidateDetail.mockResolvedValue(null);

    const result = await getCandidateProfileEdit({ candidateId: 999 });

    expect(result).toBeNull();
  });

  it("throws when getCandidateDetail throws", async () => {
    mockGetCandidateDetail.mockRejectedValue(new Error("Detail error"));

    await expect(getCandidateProfileEdit({ candidateId: 1 })).rejects.toThrow("Detail error");
  });
});

// ---------------------------------------------------------------------------
// Action-level tests — getCountryOptions / getUniversityOptions / etc.
// ---------------------------------------------------------------------------

describe("getCountryOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps country rows to option items", async () => {
    const rows = [
      { country_id: 1, country_name_en: "Kuwait", country_nationality_name_en: "Kuwaiti" },
      { country_id: 2, country_name_en: "Egypt", country_nationality_name_en: "Egyptian" },
    ];
    mockFindMany.mockResolvedValue(rows);

    const result = await getCountryOptions();

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { country_name_en: "asc" },
        take: 250,
      }),
    );
    expect(result).toEqual([
      { id: 1, label: "Kuwait (Kuwaiti)" },
      { id: 2, label: "Egypt (Egyptian)" },
    ]);
  });

  it("returns empty array when no countries", async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await getCountryOptions();

    expect(result).toEqual([]);
  });
});

describe("getUniversityOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps university rows to option items", async () => {
    const rows = [
      { university_id: 10, university_name_en: "Kuwait University" },
      { university_id: 20, university_name_en: "American University of Kuwait" },
    ];
    mockFindMany.mockResolvedValue(rows);

    const result = await getUniversityOptions();

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deleted: 0 },
        orderBy: { university_name_en: "asc" },
        take: 250,
      }),
    );
    expect(result).toEqual([
      { id: 10, label: "Kuwait University" },
      { id: 20, label: "American University of Kuwait" },
    ]);
  });

  it("returns empty array when no universities", async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await getUniversityOptions();

    expect(result).toEqual([]);
  });
});

describe("getBankOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps bank rows to option items", async () => {
    const rows = [
      { bank_id: 5, bank_name: "NBK" },
      { bank_id: 10, bank_name: "Gulf Bank" },
    ];
    mockFindMany.mockResolvedValue(rows);

    const result = await getBankOptions();

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deleted: 0 },
        orderBy: { bank_name: "asc" },
        take: 100,
      }),
    );
    expect(result).toEqual([
      { id: 5, label: "NBK" },
      { id: 10, label: "Gulf Bank" },
    ]);
  });

  it("returns empty array when no banks", async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await getBankOptions();

    expect(result).toEqual([]);
  });
});

describe("getDegreeOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps degree rows to option items", async () => {
    const rows = [
      { degree_uuid: "uuid-a", degree_name_en: "Bachelor" },
      { degree_uuid: "uuid-b", degree_name_en: "Master" },
    ];
    mockFindMany.mockResolvedValue(rows);

    const result = await getDegreeOptions();

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { degree_name_en: "asc" },
        take: 250,
      }),
    );
    expect(result).toEqual([
      { id: "uuid-a", label: "Bachelor" },
      { id: "uuid-b", label: "Master" },
    ]);
  });
});

describe("getMajorOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps major rows to option items", async () => {
    const rows = [
      { major_uuid: "uuid-x", major_name_en: "Computer Science" },
      { major_uuid: "uuid-y", major_name_en: "Engineering" },
    ];
    mockFindMany.mockResolvedValue(rows);

    const result = await getMajorOptions();

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { major_name_en: "asc" },
        take: 250,
      }),
    );
    expect(result).toEqual([
      { id: "uuid-x", label: "Computer Science" },
      { id: "uuid-y", label: "Engineering" },
    ]);
  });
});

// ---------------------------------------------------------------------------
// Action-level tests — getCandidateProfileForEdit
// ---------------------------------------------------------------------------

describe("getCandidateProfileForEdit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue({ id: 42, role: "candidate" });
  });

  it("calls requireRoleCapability with correct capability", async () => {
    mockFindUnique.mockResolvedValue({
      candidate_id: 42,
      candidate_name: "Ali",
      candidate_name_ar: "علي",
      candidate_email: "ali@example.com",
      candidate_phone: null,
      candidate_objective: null,
      candidate_intro: null,
      candidate_civil_id: null,
      profile_url: null,
      candidate_birth_date: null,
      candidate_address_line1: null,
      candidate_gender: null,
      candidate_driving_license: null,
      candidate_civil_expiry_date: null,
      candidate_preferred_time: null,
      country_id: null,
      university_id: null,
      bank_id: null,
      bank_account_name: null,
      candidate_iban: null,
      candidate_personal_photo: null,
      candidate_resume: null,
      candidate_video: null,
      candidate_civil_photo_front: null,
      candidate_civil_photo_back: null,
    });

    await getCandidateProfileForEdit();

    expect(mockRequireCapability).toHaveBeenCalledWith("candidate", "candidate.read.own");
  });

  it("returns mapped profile data when candidate found", async () => {
    mockFindUnique.mockResolvedValue({
      candidate_id: 42,
      candidate_name: "Ali",
      candidate_name_ar: "علي",
      candidate_email: "ali@example.com",
      candidate_phone: "+965****0000",
      candidate_objective: "Developer",
      candidate_intro: "Hello",
      candidate_civil_id: "12345",
      profile_url: "https://profile.example.com",
      candidate_birth_date: new Date("2000-01-01"),
      candidate_address_line1: "Salmiya",
      candidate_gender: 1,
      candidate_driving_license: true,
      candidate_civil_expiry_date: new Date("2030-12-31"),
      candidate_preferred_time: "09:00",
      country_id: 1,
      university_id: 2,
      bank_id: 3,
      bank_account_name: "My Account",
      candidate_iban: "KW123",
      candidate_personal_photo: "photo.jpg",
      candidate_resume: "resume.pdf",
      candidate_video: null,
      candidate_civil_photo_front: "front.jpg",
      candidate_civil_photo_back: "back.jpg",
    });

    const result = await getCandidateProfileForEdit();

    expect(result).toEqual({
      candidateName: "Ali",
      candidateNameAr: "علي",
      candidateEmail: "ali@example.com",
      candidatePhone: "+965****0000",
      candidateObjective: "Developer",
      candidateIntro: "Hello",
      candidateCivilId: "12345",
      profileUrl: "https://profile.example.com",
      candidateBirthDate: new Date("2000-01-01"),
      candidateAddressLine1: "Salmiya",
      candidateGender: 1,
      candidateDrivingLicense: true,
      candidateCivilExpiryDate: new Date("2030-12-31"),
      candidatePreferredTime: "09:00",
      countryId: 1,
      universityId: 2,
      bankId: 3,
      bankAccountName: "My Account",
      candidateIban: "KW123",
      candidatePersonalPhoto: "photo.jpg",
      candidateResume: "resume.pdf",
      candidateVideo: null,
      civilPhotoFront: "front.jpg",
      civilPhotoBack: "back.jpg",
    });
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(getCandidateProfileForEdit()).rejects.toThrow("Unauthorized");
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("returns null when candidate not found (null row)", async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await getCandidateProfileForEdit();

    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Action-level tests — updateCandidatePersonalInfo
// ---------------------------------------------------------------------------

describe("updateCandidatePersonalInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue({ id: 42, role: "candidate" });
  });

  it("updates candidate personal info and returns success", async () => {
    mockCandidateUpdate.mockResolvedValue({ candidate_id: 42 });

    const data: UpdatePersonalInfoInput = {
      name: "John Updated",
      nameAr: "جون محدث",
      email: "john.new@example.com",
      phone: "+965****1111",
      objective: "Senior developer",
      intro: "Updated intro",
      civilId: "99999",
      profileUrl: "https://new.example.com",
    };

    const result = await updateCandidatePersonalInfo(data);

    expect(mockRequireCapability).toHaveBeenCalledWith("candidate", "candidate.profile.edit");
    expect(mockCandidateUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { candidate_id: 42 },
      }),
    );
    expect(result).toEqual({ success: true });
  });

  it("calls revalidatePath after update", async () => {
    mockCandidateUpdate.mockResolvedValue({ candidate_id: 42 });

    await updateCandidatePersonalInfo({ name: "John" });

    expect(mockRevalidatePath).toHaveBeenCalledWith("/candidate/edit");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/candidate");
  });

  it("returns validation error for invalid input", async () => {
    const result: ProfileActionResult = await updateCandidatePersonalInfo({ name: "" });

    expect(result.success).toBe(false);
    // TS discriminated union narrowing — safe after success check
    if (result.success === false) {
      expect(result.error).toBe("Name is required");
    }
    expect(mockCandidateUpdate).not.toHaveBeenCalled();
  });

  it("returns validation error for empty name", async () => {
    const result: ProfileActionResult = await updateCandidatePersonalInfo({ name: "" });

    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.error).toBe("Name is required");
    }
  });

  it("throws when session fails (requires candidate.profile.edit)", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(
      updateCandidatePersonalInfo({ name: "John" }),
    ).rejects.toThrow("Unauthorized");
    expect(mockCandidateUpdate).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Action-level tests — updateCandidateProfileFields
// ---------------------------------------------------------------------------

describe("updateCandidateProfileFields", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue({ id: 42, role: "candidate" });
  });

  it("updates profile fields and returns success", async () => {
    mockCandidateUpdate.mockResolvedValue({ candidate_id: 42 });

    const result = await updateCandidateProfileFields({
      countryId: 1,
      universityId: 2,
      bankId: 3,
      bankAccountName: "My Account",
      iban: "KW123",
      birthDate: "2000-01-01",
      address: "Salmiya",
      gender: 1,
      drivingLicense: "1",
      civilExpiry: "2030-12-31",
      preferredTime: "09:00",
    });

    expect(mockRequireCapability).toHaveBeenCalledWith("candidate", "candidate.profile.edit");
    expect(mockCandidateUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { candidate_id: 42 },
      }),
    );
    expect(result).toEqual({ success: true });
  });

  it("calls revalidatePath after update", async () => {
    mockCandidateUpdate.mockResolvedValue({ candidate_id: 42 });

    await updateCandidateProfileFields({});

    expect(mockRevalidatePath).toHaveBeenCalledWith("/candidate/edit");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/candidate");
  });

  it("accepts empty payload (all defaults)", async () => {
    mockCandidateUpdate.mockResolvedValue({ candidate_id: 42 });

    const result = await updateCandidateProfileFields({});

    expect(result.success).toBe(true);
    expect(mockCandidateUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          country_id: null,
          university_id: null,
          bank_id: null,
        }),
      }),
    );
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(updateCandidateProfileFields({})).rejects.toThrow("Unauthorized");
    expect(mockCandidateUpdate).not.toHaveBeenCalled();
  });
});
