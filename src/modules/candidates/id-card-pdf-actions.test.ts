import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — hoisted to avoid hoisting issues with vi.mock
// ---------------------------------------------------------------------------

const { mockCandidateFindUnique, mockCountryFindUnique, mockRequireCapability } =
  vi.hoisted(() => ({
    mockCandidateFindUnique: vi.fn(),
    mockCountryFindUnique: vi.fn(),
    mockRequireCapability: vi.fn(),
  }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate: {
      findUnique: mockCandidateFindUnique,
    },
    country: {
      findUnique: mockCountryFindUnique,
    },
  },
}));

vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { getIdCardPdfData } from "./id-card-pdf-actions";
import type { IdCardPdfActionResult } from "./id-card-pdf-actions";

// ---------------------------------------------------------------------------
// Tests: getIdCardPdfData
// ---------------------------------------------------------------------------

describe("getIdCardPdfData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when candidate is not found", async () => {
    mockCandidateFindUnique.mockResolvedValue(null);
    const result = await getIdCardPdfData({ candidateId: 999 });
    expect(result).toBeNull();
    expect(mockCandidateFindUnique).toHaveBeenCalledWith({
      where: { candidate_id: 999 },
    });
  });

  it("returns formatted candidate data when found", async () => {
    mockCandidateFindUnique.mockResolvedValue({
      candidate_id: 123,
      candidate_name: "Ahmed Al-Mutawa",
      candidate_name_ar: "أحمد المطوع",
      candidate_email: "ahmed@example.com",
      candidate_phone: "+965 5123 4567",
      candidate_civil_id: "284061234567",
      candidate_civil_expiry_date: new Date("2030-06-15"),
      candidate_birth_date: new Date("1995-06-15"),
      candidate_gender: 1,
      country_id: 1,
      candidate_personal_photo: null,
    });

    mockCountryFindUnique.mockResolvedValue({
      country_id: 1,
      country_name_en: "Kuwait",
    });

    const result = await getIdCardPdfData({ candidateId: 123 });

    expect(result).toEqual<IdCardPdfActionResult>({
      candidateName: "Ahmed Al-Mutawa",
      candidateNameAr: "أحمد المطوع",
      candidateEmail: "ahmed@example.com",
      candidatePhone: "+965 5123 4567",
      candidateCivilId: "284061234567",
      candidateCivilExpiryDate: "2030-06-15",
      candidateBirthDate: "1995-06-15",
      candidateGender: "Male",
      nationality: "Kuwait",
      photoUrl: null,
    });
  });

  it("returns null nationality when country_id is null", async () => {
    mockCandidateFindUnique.mockResolvedValue({
      candidate_id: 456,
      candidate_name: "Noor Al-Ali",
      candidate_name_ar: null,
      candidate_email: null,
      candidate_phone: null,
      candidate_civil_id: null,
      candidate_civil_expiry_date: null,
      candidate_birth_date: null,
      candidate_gender: null,
      country_id: null,
      candidate_personal_photo: null,
    });

    const result = await getIdCardPdfData({ candidateId: 456 });

    expect(result).toEqual<IdCardPdfActionResult>({
      candidateName: "Noor Al-Ali",
      candidateNameAr: null,
      candidateEmail: null,
      candidatePhone: null,
      candidateCivilId: null,
      candidateCivilExpiryDate: null,
      candidateBirthDate: null,
      candidateGender: null,
      nationality: null,
      photoUrl: null,
    });
    // Should not have queried country
    expect(mockCountryFindUnique).not.toHaveBeenCalled();
  });

  it("maps gender 1 to Male and gender 2 to Female", async () => {
    mockCandidateFindUnique.mockResolvedValueOnce({
      candidate_id: 1,
      candidate_name: "Male Candidate",
      candidate_name_ar: null,
      candidate_email: null,
      candidate_phone: null,
      candidate_civil_id: null,
      candidate_civil_expiry_date: null,
      candidate_birth_date: null,
      candidate_gender: 1,
      country_id: null,
      candidate_personal_photo: null,
    });

    mockCandidateFindUnique.mockResolvedValueOnce({
      candidate_id: 2,
      candidate_name: "Female Candidate",
      candidate_name_ar: null,
      candidate_email: null,
      candidate_phone: null,
      candidate_civil_id: null,
      candidate_civil_expiry_date: null,
      candidate_birth_date: null,
      candidate_gender: 2,
      country_id: null,
      candidate_personal_photo: null,
    });

    const male = await getIdCardPdfData({ candidateId: 1 });
    expect(male?.candidateGender).toBe("Male");

    const female = await getIdCardPdfData({ candidateId: 2 });
    expect(female?.candidateGender).toBe("Female");
  });

  it("throws on invalid candidateId (non-positive)", async () => {
    await expect(getIdCardPdfData({ candidateId: 0 })).rejects.toThrow();
    await expect(getIdCardPdfData({ candidateId: -1 })).rejects.toThrow();
  });

  it("requires candidate.read.any capability", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(getIdCardPdfData({ candidateId: 1 })).rejects.toThrow("Unauthorized");
    expect(mockRequireCapability).toHaveBeenCalledWith("candidate.read.any");
  });
});
