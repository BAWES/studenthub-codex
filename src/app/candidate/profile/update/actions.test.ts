import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import type { ProfileActionResult } from "./actions";

// ---------------------------------------------------------------------------
// Mocks — data layer & auth
// ---------------------------------------------------------------------------

const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate: {
      findUnique: mockFindUnique,
      update: mockUpdate,
    },
  },
}));

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Must import after mocks are set up
const { prisma } = await import("@/lib/prisma");
const { requireRoleCapability } = await import("@/modules/auth/session");
const { revalidatePath } = await import("next/cache");
const actions = await import("./actions");

const mockUser = {
  role: "candidate" as const,
  id: "1",
  name: "Test Candidate",
  email: "test@candidate.studenthub.local",
  issuedAt: Date.now(),
};

// ---------------------------------------------------------------------------
// Helpers for type safety when constructing mock rows
// ---------------------------------------------------------------------------

function makeCandidateRow(overrides: Record<string, unknown> = {}) {
  return {
    candidate_id: 1,
    candidate_name: "Test User",
    candidate_name_ar: null,
    candidate_email: "test@example.com",
    candidate_phone: null,
    candidate_personal_photo: null,
    candidate_objective: null,
    candidate_intro: null,
    candidate_address_line1: null,
    candidate_gender: null,
    candidate_birth_date: null,
    candidate_driving_license: null,
    candidate_civil_id: null,
    candidate_hourly_rate: null,
    profile_url: null,
    candidate_preferred_time: null,
    bank_account_name: null,
    candidate_iban: null,
    country_id: null,
    university_id: null,
    bank_id: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Schema tests — pure unit, no mocking needed
// ---------------------------------------------------------------------------

// The schemas are not exported, so we test through the public API (action results)

describe("getProfileSchema (tested via action behaviour)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getProfile succeeds when session and DB return valid data", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockFindUnique.mockResolvedValue(makeCandidateRow());

    const result = await actions.getProfile();
    expect(result.candidateId).toBe(1);
    expect(result.name).toBe("Test User");
    expect(result.email).toBe("test@example.com");
  });

  it("getProfile throws when candidate not found", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue({ ...mockUser, id: "99" });
    mockFindUnique.mockResolvedValue(null);

    await expect(actions.getProfile()).rejects.toThrow("Candidate profile not found");
  });

  it("getProfile throws when session fails", async () => {
    vi.mocked(requireRoleCapability).mockRejectedValue(new Error("Unauthenticated"));

    await expect(actions.getProfile()).rejects.toThrow("Unauthenticated");
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("getProfile maps nullable fields correctly", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue({ ...mockUser, id: "2" });
    mockFindUnique.mockResolvedValue(
      makeCandidateRow({
        candidate_id: 2,
        candidate_name: "Alice",
        candidate_name_ar: "أليس",
        candidate_phone: "+965 5123 4567",
        candidate_driving_license: true,
        candidate_hourly_rate: 15.5,
        country_id: 1,
        university_id: 3,
      }),
    );

    const result = await actions.getProfile();
    expect(result.candidateId).toBe(2);
    expect(result.name).toBe("Alice");
    expect(result.nameAr).toBe("أليس");
    expect(result.phone).toBe("+965 5123 4567");
    expect(result.drivingLicense).toBe(true);
    expect(result.hourlyRate).toBe(15.5);
    expect(result.countryId).toBe(1);
    expect(result.universityId).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Action tests — updateProfile
// ---------------------------------------------------------------------------

describe("updateProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------- Success cases --------

  it("returns success when input is valid", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockUpdate.mockResolvedValue({ candidate_id: 1 });

    const result = await actions.updateProfile({ name: "Updated Name" });
    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledOnce();
  });

  it("passes the correct candidate ID to Prisma", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue({ ...mockUser, id: "5" });
    mockUpdate.mockResolvedValue({ candidate_id: 5 });

    await actions.updateProfile({ name: "Charlie" });

    // Prisma should be called with where: { candidate_id: 5 }
    const call = mockUpdate.mock.calls[0][0];
    expect(call.where.candidate_id).toBe(5);
  });

  it("trims whitespace from name", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockUpdate.mockResolvedValue({ candidate_id: 1 });

    await actions.updateProfile({ name: "  Dave  " });

    const call = mockUpdate.mock.calls[0][0];
    expect(call.data.candidate_name).toBe("Dave");
  });

  it("passes optional string fields as undefined when empty", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockUpdate.mockResolvedValue({ candidate_id: 1 });

    await actions.updateProfile({
      name: "Test",
      phone: "",
      objective: "",
      intro: "",
    });

    const call = mockUpdate.mock.calls[0][0];
    // Empty strings become undefined so Prisma doesn't overwrite with blank
    expect(call.data.candidate_phone).toBeUndefined();
    expect(call.data.candidate_objective).toBeUndefined();
    expect(call.data.candidate_intro).toBeUndefined();
  });

  it("passes driving license as boolean when '1' or '0'", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockUpdate.mockResolvedValue({ candidate_id: 1 });

    await actions.updateProfile({ name: "Test", drivingLicense: "1" });
    const call1 = mockUpdate.mock.calls[0][0];
    expect(call1.data.candidate_driving_license).toBe(true);

    vi.clearAllMocks();
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    await actions.updateProfile({ name: "Test", drivingLicense: "0" });
    const call2 = mockUpdate.mock.calls[0][0];
    expect(call2.data.candidate_driving_license).toBe(false);
  });

  it("passes driving license as null when empty string", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockUpdate.mockResolvedValue({ candidate_id: 1 });

    await actions.updateProfile({ name: "Test", drivingLicense: "" });
    const call = mockUpdate.mock.calls[0][0];
    expect(call.data.candidate_driving_license).toBeNull();
  });

  it("passes hourly rate as a number", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockUpdate.mockResolvedValue({ candidate_id: 1 });

    await actions.updateProfile({ name: "Test", hourlyRate: 25 });
    const call = mockUpdate.mock.calls[0][0];
    expect(call.data.candidate_hourly_rate).toBe(25);
  });

  it("passes gender as integer", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockUpdate.mockResolvedValue({ candidate_id: 1 });

    await actions.updateProfile({ name: "Test", gender: 1 });
    const call = mockUpdate.mock.calls[0][0];
    expect(call.data.candidate_gender).toBe(1);
  });

  it("passes birthDate as Date when valid string", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockUpdate.mockResolvedValue({ candidate_id: 1 });

    await actions.updateProfile({ name: "Test", birthDate: "1998-05-15" });
    const call = mockUpdate.mock.calls[0][0];
    expect(call.data.candidate_birth_date).toBeInstanceOf(Date);
    expect(call.data.candidate_birth_date!.toISOString()).toContain("1998");
  });

  // -------- Validation failure cases --------

  it("returns error for missing name", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);

    const result = (await actions.updateProfile(
      {} as Parameters<typeof actions.updateProfile>[0],
    )) as ProfileActionResult;

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
      expect(mockUpdate).not.toHaveBeenCalled();
    }
  });

  it("returns error for name exceeding 255 chars", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);

    const result = (await actions.updateProfile({
      name: "A".repeat(256),
    })) as ProfileActionResult;

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
      expect(mockUpdate).not.toHaveBeenCalled();
    }
  });

  it("returns error for negative hourly rate", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);

    const result = (await actions.updateProfile({
      name: "Test",
      hourlyRate: -5,
    })) as ProfileActionResult;

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
      expect(mockUpdate).not.toHaveBeenCalled();
    }
  });

  it("returns error for hourly rate > 9999", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);

    const result = (await actions.updateProfile({
      name: "Test",
      hourlyRate: 10000,
    })) as ProfileActionResult;

    expect(result.success).toBe(false);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error for invalid gender value (outside 0-2)", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);

    const result = (await actions.updateProfile({
      name: "Test",
      gender: 5,
    })) as ProfileActionResult;

    expect(result.success).toBe(false);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("includes fieldErrors in validation failure", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);

    const result = (await actions.updateProfile({
      name: "",
    })) as ProfileActionResult;

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors).toBeDefined();
      expect(result.fieldErrors!.name).toBeDefined();
    }
  });

  // -------- Auth failure --------

  it("throws when session auth fails", async () => {
    vi.mocked(requireRoleCapability).mockRejectedValue(
      new Error("Unauthorized"),
    );

    await expect(
      actions.updateProfile({ name: "Test" }),
    ).rejects.toThrow("Unauthorized");

    expect(mockUpdate).not.toHaveBeenCalled();
  });

  // -------- Prisma failure --------

  it("propagates Prisma update errors", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockUpdate.mockRejectedValue(new Error("DB connection error"));

    await expect(
      actions.updateProfile({ name: "Test" }),
    ).rejects.toThrow("DB connection error");
  });
});
